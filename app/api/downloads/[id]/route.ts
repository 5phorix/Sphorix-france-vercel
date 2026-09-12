import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DownloadRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: DownloadRouteProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: download, error: downloadError } = await admin
    .from("downloads")
    .select("id, user_id, product_file_id, download_count")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (downloadError) {
    return NextResponse.json({ error: "Téléchargement indisponible." }, { status: 500 });
  }

  if (!download) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 404 });
  }

  const { data: file, error: fileError } = await admin
    .from("product_files")
    .select("storage_path, original_name")
    .eq("id", download.product_file_id)
    .single();

  if (fileError || !file) {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }

  const { data: signedUrl, error: signedUrlError } = await admin.storage
    .from("digital-products")
    .createSignedUrl(file.storage_path, 600, { download: file.original_name });

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json({ error: "Impossible de préparer le téléchargement." }, { status: 500 });
  }

  await admin
    .from("downloads")
    .update({
      download_count: download.download_count + 1,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq("id", download.id);

  return NextResponse.redirect(signedUrl.signedUrl);
}
