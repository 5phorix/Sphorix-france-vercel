import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { getClientPortalAdministrator, isSameOriginRequest } from "@/lib/client-portal/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de la requête invalide." }, { status: 403 });
  }

  try {
    const administrator = await getClientPortalAdministrator();
    if (!administrator) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });

    let payload: { subscriberId?: unknown };
    try {
      payload = await request.json() as typeof payload;
    } catch {
      return NextResponse.json({ error: "La demande est invalide." }, { status: 400 });
    }

    if (typeof payload.subscriberId !== "string" || !uuidPattern.test(payload.subscriberId)) {
      return NextResponse.json({ error: "Client invalide." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: subscriber, error: subscriberError } = await supabase
      .from("platform_subscribers")
      .select("id, email, user_id")
      .eq("id", payload.subscriberId)
      .maybeSingle();

    if (subscriberError) throw subscriberError;
    if (!subscriber) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    if (subscriber.user_id) {
      return NextResponse.json({ error: "Ce client possède déjà un accès." }, { status: 409 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { error: invalidateError } = await supabase
      .from("client_invitations")
      .update({ expires_at: now.toISOString() })
      .eq("subscriber_id", subscriber.id)
      .is("accepted_at", null)
      .gt("expires_at", now.toISOString());

    if (invalidateError) throw invalidateError;

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { error: insertError } = await supabase.from("client_invitations").insert({
      subscriber_id: subscriber.id,
      token_hash: tokenHash,
      created_by: administrator.userId,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) throw insertError;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin);
    let invitationUrl: URL;
    try {
      const baseUrl = new URL(siteUrl);
      if (
        !["http:", "https:"].includes(baseUrl.protocol)
        || (process.env.NODE_ENV === "production" && baseUrl.protocol !== "https:")
      ) {
        throw new Error("URL du site non sécurisée.");
      }
      invitationUrl = new URL("/invitation", baseUrl);
    } catch {
      throw new Error("NEXT_PUBLIC_SITE_URL doit être une URL HTTPS valide en production.");
    }
    invitationUrl.searchParams.set("token", token);

    return NextResponse.json({
      invitationUrl: invitationUrl.toString(),
      expiresAt: expiresAt.toISOString(),
      email: subscriber.email,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Échec de la création d’une invitation client :", error);
    return NextResponse.json({ error: "Le lien d’invitation n’a pas pu être généré." }, { status: 500 });
  }
}
