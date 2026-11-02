import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { isSameOriginRequest } from "@/lib/client-portal/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function releaseInvitation(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  invitationId: string,
  claimedAt: string,
) {
  const { error } = await supabase
    .from("client_invitations")
    .update({ accepted_at: null })
    .eq("id", invitationId)
    .eq("accepted_at", claimedAt);
  if (error) console.error("Échec de la libération d’une invitation client :", error);
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de la requête invalide." }, { status: 403 });
  }

  let payload: { token?: unknown; password?: unknown; fullName?: unknown };
  try {
    payload = await request.json() as typeof payload;
  } catch {
    return NextResponse.json({ error: "La demande est invalide." }, { status: 400 });
  }

  if (typeof payload.token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(payload.token)) {
    return NextResponse.json({ error: "Ce lien d’invitation est invalide ou expiré." }, { status: 400 });
  }

  const serverClient = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await serverClient.auth.getUser();
  if (userError) {
    console.error("Échec de la vérification du compte lors de l’acceptation d’une invitation :", userError);
    return NextResponse.json({ error: "La session n’a pas pu être vérifiée." }, { status: 500 });
  }

  const password = typeof payload.password === "string" ? payload.password : "";
  const fullName = typeof payload.fullName === "string" ? payload.fullName.trim().slice(0, 120) : "";
  if (!user && (password.length < 8 || password.length > 128)) {
    return NextResponse.json({ error: "Choisissez un mot de passe de 8 à 128 caractères." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const tokenHash = createHash("sha256").update(payload.token).digest("hex");
    const { data: invitation, error: invitationError } = await supabase
      .from("client_invitations")
      .select("id, subscriber_id, expires_at, accepted_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (invitationError) throw invitationError;
    if (!invitation || invitation.accepted_at || new Date(invitation.expires_at) <= new Date()) {
      return NextResponse.json({ error: "Ce lien d’invitation est invalide ou expiré." }, { status: 400 });
    }

    const { data: subscriber, error: subscriberError } = await supabase
      .from("platform_subscribers")
      .select("id, email, contact_name, company_name, user_id")
      .eq("id", invitation.subscriber_id)
      .maybeSingle();

    if (subscriberError) throw subscriberError;
    if (!subscriber || subscriber.user_id) {
      return NextResponse.json({ error: "Ce lien ne peut plus être utilisé." }, { status: 409 });
    }
    if (user && user.email?.toLowerCase() !== subscriber.email.toLowerCase()) {
      return NextResponse.json({ error: "Connectez-vous avec l’adresse email invitée." }, { status: 403 });
    }

    const claimedAt = new Date().toISOString();
    const { data: claimedInvitation, error: claimError } = await supabase
      .from("client_invitations")
      .update({ accepted_at: claimedAt })
      .eq("id", invitation.id)
      .is("accepted_at", null)
      .gt("expires_at", claimedAt)
      .select("id")
      .maybeSingle();

    if (claimError) throw claimError;
    if (!claimedInvitation) {
      return NextResponse.json({ error: "Ce lien a déjà été utilisé ou a expiré." }, { status: 409 });
    }

    let userId = user?.id;
    let createdUserId: string | null = null;
    if (!userId) {
      const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: subscriber.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || subscriber.contact_name },
      });

      if (createUserError || !createdUser.user) {
        await releaseInvitation(supabase, invitation.id, claimedAt);

        if (createUserError?.message.toLowerCase().includes("already")) {
          return NextResponse.json({
            code: "account_exists",
            error: "Un compte existe déjà pour cette adresse. Connectez-vous avec l’email invité puis validez à nouveau le lien.",
          }, { status: 409 });
        }
        if (createUserError) console.error("Échec de la création du compte invité :", createUserError);
        return NextResponse.json({ error: "Le compte n’a pas pu être créé. Vérifiez le mot de passe puis réessayez." }, { status: 400 });
      }

      userId = createdUser.user.id;
      createdUserId = userId;
    }

    const { data: linkedSubscriber, error: linkError } = await supabase
      .from("platform_subscribers")
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .eq("id", subscriber.id)
      .is("user_id", null)
      .select("id")
      .maybeSingle();

    if (linkError || !linkedSubscriber) {
      if (createdUserId) {
        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(createdUserId);
        if (deleteUserError) console.error("Échec du nettoyage du compte invité non associé :", deleteUserError);
      }
      await releaseInvitation(supabase, invitation.id, claimedAt);
      if (linkError) throw linkError;
      return NextResponse.json({ error: "Ce compte client est déjà associé." }, { status: 409 });
    }

    return NextResponse.json({ success: true, email: subscriber.email }, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("Échec de l’acceptation d’une invitation client :", error);
    return NextResponse.json({ error: "L’invitation n’a pas pu être validée." }, { status: 500 });
  }
}
