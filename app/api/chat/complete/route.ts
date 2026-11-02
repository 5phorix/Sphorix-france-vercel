import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ChatbotConfigurationError,
  requestFoundryChatCompletion,
  type ChatCompletionMessage,
} from "@/lib/chatbot/azure";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const VISITOR_COOKIE = "sphorix_chat_visitor";
const CONVERSATION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEAD_REQUEST_TYPES = new Set(["quote", "appointment", "callback"]);
const LEAD_DETAIL_FIELDS = new Set(["name", "company", "email", "phone", "callback_time", "preferred_contact_method"]);

type SummaryResult = {
  summary: string;
  primary_need: string | null;
  category: string | null;
  interested_services: string[];
  lead_request_type: string | null;
  lead_details: Record<string, string>;
  unresolved_question: boolean;
};

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

function normalizeSummary(value: unknown): SummaryResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Le compte rendu du chatbot a un format invalide.");
  }
  const result = value as Record<string, unknown>;
  const summary = typeof result.summary === "string" ? result.summary.trim() : "";
  const primaryNeed = result.primary_need;
  const category = result.category;
  const services = result.interested_services;
  const leadRequestType = result.lead_request_type;
  const rawDetails = result.lead_details;
  const unresolved = result.unresolved_question;

  if (
    !summary || summary.length > 2000
    || !(primaryNeed === null || (typeof primaryNeed === "string" && primaryNeed.length <= 300))
    || !(category === null || (typeof category === "string" && category.length <= 100))
    || !Array.isArray(services)
    || services.length > 10
    || services.some((service) => typeof service !== "string" || service.length > 120)
    || !(leadRequestType === null || (
      typeof leadRequestType === "string" && LEAD_REQUEST_TYPES.has(leadRequestType)
    ))
    || !rawDetails || typeof rawDetails !== "object" || Array.isArray(rawDetails)
    || typeof unresolved !== "boolean"
  ) {
    throw new Error("Le compte rendu du chatbot contient des champs invalides.");
  }

  const leadDetails: Record<string, string> = {};
  for (const [key, detail] of Object.entries(rawDetails)) {
    if (!LEAD_DETAIL_FIELDS.has(key)) continue;
    if (typeof detail !== "string" || detail.length > 200) {
      throw new Error("Une information de suivi du chatbot est invalide.");
    }
    if (detail.trim()) leadDetails[key] = detail.trim();
  }

  return {
    summary,
    primary_need: typeof primaryNeed === "string" ? primaryNeed.trim() : null,
    category: typeof category === "string" ? category.trim() : null,
    interested_services: services.map((service) => (service as string).trim()).filter(Boolean),
    lead_request_type: typeof leadRequestType === "string" ? leadRequestType : null,
    lead_details: leadDetails,
    unresolved_question: unresolved,
  };
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }

  let payload: { conversationId?: unknown };
  try {
    payload = await request.json() as { conversationId?: unknown };
  } catch {
    return NextResponse.json({ error: "Demande invalide." }, { status: 400 });
  }

  if (typeof payload.conversationId !== "string" || !CONVERSATION_ID_PATTERN.test(payload.conversationId)) {
    return NextResponse.json({ error: "Identifiant de conversation invalide." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const visitorToken = cookieStore.get(VISITOR_COOKIE)?.value;
  if (!visitorToken || !/^[0-9a-f]{64}$/.test(visitorToken)) {
    return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
  }

  const supabase = createSupabaseAdminClient();
  const forwardedIp = request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  const { data: allowed, error: rateLimitError } = await supabase.rpc("consume_chat_rate_limit", {
    target_key_hash: hash(forwardedIp),
    max_requests: 10,
    window_seconds: 600,
  });
  if (rateLimitError) {
    console.error("Échec de la limitation du débit du compte rendu chatbot :", rateLimitError);
    return NextResponse.json({ error: "La clôture est momentanément indisponible." }, { status: 500 });
  }
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives de clôture. Réessayez plus tard." }, { status: 429 });
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("chat_conversations")
    .select("id, status")
    .eq("id", payload.conversationId)
    .eq("visitor_token_hash", hash(visitorToken))
    .maybeSingle();

  if (conversationError) {
    console.error("Échec du chargement avant clôture du chatbot :", conversationError);
    return NextResponse.json({ error: "La conversation n’a pas pu être clôturée." }, { status: 500 });
  }
  if (!conversation) return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
  if (conversation.status === "completed") {
    return NextResponse.json({ success: true, alreadyCompleted: true });
  }

  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", payload.conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (messagesError) {
    console.error("Échec du chargement des messages avant clôture :", messagesError);
    return NextResponse.json({ error: "Le compte rendu n’a pas pu être préparé." }, { status: 500 });
  }
  if (!messages?.some((message) => message.role === "user")) {
    return NextResponse.json({ error: "La conversation ne contient aucun échange à clôturer." }, { status: 400 });
  }

  const transcript = messages.map((message) => ({
    role: message.role as "user" | "assistant",
    content: message.content,
  }));
  const summaryPrompt: ChatCompletionMessage[] = [
    {
      role: "system",
      content: [
        "Tu prépares un compte rendu interne d’une conversation de support commercial Sphorix France.",
        "Utilise uniquement les informations explicitement données par le visiteur ou l’assistant. N’invente jamais de données, d’intentions ou d’opportunités.",
        "Ne retiens que les coordonnées volontairement communiquées par le visiteur. N’extrais pas une adresse email ou un téléphone mentionné dans une autre source.",
        "Retourne un objet JSON avec les clés summary (string), primary_need (string ou null), category (string ou null), interested_services (tableau de chaînes), lead_request_type (quote, appointment, callback ou null), lead_details (objet n’ayant que les clés name, company, email, phone, callback_time, preferred_contact_method et des valeurs chaîne), unresolved_question (booléen).",
        "Si une réponse n’a pas pu être apportée ou qu’un suivi humain semble explicitement nécessaire, marque unresolved_question à true.",
      ].join(" "),
    },
    {
      role: "user",
      content: JSON.stringify(transcript),
    },
  ];

  let summary: SummaryResult;
  try {
    const response = await requestFoundryChatCompletion(summaryPrompt, { stream: false, jsonMode: true });
    if (!response.ok) {
      console.error(`Le service Azure de compte rendu a répondu avec le statut ${response.status}.`);
      return NextResponse.json({ error: "La génération du compte rendu a échoué." }, { status: 502 });
    }
    const completion = await response.json() as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = completion.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Le service Azure n’a pas renvoyé de compte rendu.");
    summary = normalizeSummary(JSON.parse(content) as unknown);
  } catch (error) {
    console.error(
      error instanceof ChatbotConfigurationError
        ? "Configuration Azure du résumé chatbot incomplète."
        : "Échec de la génération du résumé chatbot.",
      error instanceof ChatbotConfigurationError ? error.message : error
    );
    return NextResponse.json({ error: "Le compte rendu n’a pas pu être généré. Réessayez." }, {
      status: error instanceof ChatbotConfigurationError ? 503 : 502,
    });
  }

  const { error: updateError } = await supabase
    .from("chat_conversations")
    .update({
      ...summary,
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.conversationId)
    .eq("visitor_token_hash", hash(visitorToken));

  if (updateError) {
    console.error("Échec de l’enregistrement du compte rendu chatbot :", updateError);
    return NextResponse.json({ error: "Le compte rendu n’a pas pu être enregistré." }, { status: 500 });
  }

  return NextResponse.json({ success: true, summary });
}
