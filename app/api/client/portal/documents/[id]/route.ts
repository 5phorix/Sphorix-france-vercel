import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  try {
    const userClient = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError) throw userError;
    if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const supabase = createSupabaseAdminClient();
    const { data: subscriber, error: subscriberError } = await supabase
      .from("platform_subscribers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (subscriberError) throw subscriberError;
    if (!subscriber) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

    const { data: document, error: documentError } = await supabase
      .from("client_portal_documents")
      .select("storage_path, original_name")
      .eq("id", id)
      .eq("subscriber_id", subscriber.id)
      .maybeSingle();
    if (documentError) throw documentError;
    if (!document) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

    const { data: signedFile, error: signedUrlError } = await supabase.storage
      .from("client-portal-private")
      .createSignedUrl(document.storage_path, 60, { download: document.original_name });
    if (signedUrlError) throw signedUrlError;

    return NextResponse.redirect(signedFile.signedUrl, {
      headers: { "cache-control": "private, no-store" },
    });
  } catch (error) {
    console.error("Échec du téléchargement d’un document du portail client :", error);
    return NextResponse.json({ error: "Le document n’a pas pu être téléchargé." }, { status: 500 });
  }
}
