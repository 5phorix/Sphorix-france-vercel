import { NextResponse } from "next/server";

import { getClientPortalAdministrator } from "@/lib/client-portal/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
    if (!(await getClientPortalAdministrator())) {
      return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: document, error: documentError } = await supabase
      .from("client_portal_documents")
      .select("storage_path, original_name")
      .eq("id", id)
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
    console.error("Échec du téléchargement admin d’un document client :", error);
    return NextResponse.json({ error: "Le document n’a pas pu être téléchargé." }, { status: 500 });
  }
}
