import { NextRequest, NextResponse } from "next/server";

import { isAzureChatbotConfigured } from "@/lib/chatbot/azure";
import { isChatbotAdministrator } from "@/lib/chatbot/admin";
import { syncPublicWebsiteKnowledge } from "@/lib/chatbot/knowledge-sync";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function authorize() {
  try {
    if (await isChatbotAdministrator()) return null;
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  } catch (error) {
    console.error("Échec de la vérification des droits chatbot :", error);
    return NextResponse.json({ error: "Impossible de vérifier les droits administrateur." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;

  const supabase = createSupabaseAdminClient();
  const conversationId = request.nextUrl.searchParams.get("conversationId");

  if (conversationId) {
    const { data: conversation, error: conversationError } = await supabase
      .from("chat_conversations")
      .select("id, status, category, primary_need, interested_services, summary, lead_request_type, lead_details, unresolved_question, created_at, updated_at")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError) {
      console.error("Échec du chargement d’une conversation admin :", conversationError);
      return NextResponse.json({ error: "La conversation n’a pas pu être chargée." }, { status: 500 });
    }
    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
    }

    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("id, role, content, sources, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (messagesError) {
      console.error("Échec du chargement des messages admin :", messagesError);
      return NextResponse.json({ error: "Les messages n’ont pas pu être chargés." }, { status: 500 });
    }
    return NextResponse.json({ conversation, messages }, { headers: { "cache-control": "no-store" } });
  }

  const search = (request.nextUrl.searchParams.get("search") ?? "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
  const filter = request.nextUrl.searchParams.get("filter");
  const parsedOffset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
  const offset = Number.isSafeInteger(parsedOffset) && parsedOffset >= 0
    ? Math.min(parsedOffset, 100000)
    : 0;
  let conversationsQuery = supabase
    .from("chat_conversations")
    .select("id, status, category, primary_need, interested_services, summary, lead_request_type, unresolved_question, created_at, updated_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + 200);
  if (filter === "active" || filter === "completed") {
    conversationsQuery = conversationsQuery.eq("status", filter);
  } else if (filter === "unresolved") {
    conversationsQuery = conversationsQuery.eq("unresolved_question", true);
  } else if (filter === "leads") {
    conversationsQuery = conversationsQuery.not("lead_request_type", "is", null);
  }
  if (search) {
    conversationsQuery = conversationsQuery.or(
      `category.ilike.%${search}%,primary_need.ilike.%${search}%,summary.ilike.%${search}%`
    );
  }

  const [settingsResult, statsResult, conversationsResult] = await Promise.all([
    supabase
      .from("chatbot_settings")
      .select("enabled, assistant_name, greeting, personality, suggested_questions, knowledge_synced_at, indexed_page_count, updated_at")
      .eq("id", 1)
      .single(),
    supabase.rpc("chatbot_admin_stats"),
    conversationsQuery,
  ]);

  const failed = [settingsResult, statsResult, conversationsResult].find((result) => result.error);
  if (failed?.error) {
    console.error("Échec du chargement des données chatbot admin :", failed.error);
    return NextResponse.json({ error: "Les données du chatbot n’ont pas pu être chargées." }, { status: 500 });
  }

  const conversationRows = conversationsResult.data ?? [];
  return NextResponse.json({
    settings: settingsResult.data,
    stats: statsResult.data,
    conversations: conversationRows.slice(0, 200),
    hasMore: conversationRows.length > 200,
    configured: isAzureChatbotConfigured() && (settingsResult.data?.indexed_page_count ?? 0) > 0,
  }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;

  let payload: {
    enabled?: unknown;
    assistantName?: unknown;
    greeting?: unknown;
    personality?: unknown;
    suggestedQuestions?: unknown;
  };
  try {
    payload = await request.json() as typeof payload;
  } catch {
    return NextResponse.json({ error: "Configuration invalide." }, { status: 400 });
  }

  const assistantName = typeof payload.assistantName === "string" ? payload.assistantName.trim() : "";
  const greeting = typeof payload.greeting === "string" ? payload.greeting.trim() : "";
  const personality = typeof payload.personality === "string" ? payload.personality.trim() : "";
  const suggestedQuestions = payload.suggestedQuestions;
  if (
    typeof payload.enabled !== "boolean"
    || assistantName.length < 2 || assistantName.length > 60
    || greeting.length < 2 || greeting.length > 500
    || personality.length < 2 || personality.length > 1000
    || !Array.isArray(suggestedQuestions)
    || suggestedQuestions.length > 8
    || suggestedQuestions.some((question) => typeof question !== "string" || question.trim().length > 120)
  ) {
    return NextResponse.json({ error: "Vérifiez les champs de configuration." }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient();
  const { data: currentSettings, error: settingsError } = await supabase
    .from("chatbot_settings")
    .select("indexed_page_count")
    .eq("id", 1)
    .single();
  if (settingsError) {
    console.error("Échec de la vérification de la base de connaissances chatbot :", settingsError);
    return NextResponse.json({ error: "L’état de la base de connaissances n’a pas pu être vérifié." }, { status: 500 });
  }
  if (payload.enabled && (!isAzureChatbotConfigured() || currentSettings.indexed_page_count === 0)) {
    return NextResponse.json({
      error: "Configurez Azure AI Foundry, Azure AI Search et actualisez les pages publiques avant d’activer l’assistant.",
    }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("chatbot_settings")
    .update({
      enabled: payload.enabled,
      assistant_name: assistantName,
      greeting,
      personality,
      suggested_questions: suggestedQuestions.map((question) => question.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select("enabled, assistant_name, greeting, personality, suggested_questions, knowledge_synced_at, indexed_page_count, updated_at")
    .single();

  if (error) {
    console.error("Échec de la mise à jour des paramètres chatbot :", error);
    return NextResponse.json({ error: "La configuration n’a pas pu être enregistrée." }, { status: 500 });
  }

  return NextResponse.json({
    settings: data,
    configured: isAzureChatbotConfigured() && currentSettings.indexed_page_count > 0,
  });
}

export async function POST() {
  const denied = await authorize();
  if (denied) return denied;

  try {
    const result = await syncPublicWebsiteKnowledge();
    return NextResponse.json({
      success: true,
      ...result,
      configured: isAzureChatbotConfigured(),
      knowledgeSyncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Échec de l’actualisation manuelle des connaissances chatbot :", error);
    return NextResponse.json(
      { error: "Les pages publiques n’ont pas pu être actualisées dans Azure AI Search." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
    return NextResponse.json({ error: "Identifiant de conversation invalide." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("chat_conversations").delete().eq("id", conversationId);
  if (error) {
    console.error("Échec de la suppression admin d’une conversation :", error);
    return NextResponse.json({ error: "La conversation n’a pas pu être supprimée." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
