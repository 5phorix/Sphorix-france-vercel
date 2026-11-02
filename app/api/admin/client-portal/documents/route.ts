import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { getClientPortalAdministrator, isSameOriginRequest } from "@/lib/client-portal/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maxFileSize = 4 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "image/jpeg",
  "image/png",
]);
const categories = new Set(["document", "deliverable", "quote", "invoice"]);

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de la requête invalide." }, { status: 403 });
  }

  try {
    const administrator = await getClientPortalAdministrator();
    if (!administrator) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });

    const formData = await request.formData();
    const subscriberId = formData.get("subscriberId");
    const projectId = formData.get("projectId");
    const category = formData.get("category");
    const title = formData.get("title");
    const file = formData.get("file");

    if (
      typeof subscriberId !== "string" || !uuidPattern.test(subscriberId)
      || (typeof projectId === "string" && projectId && !uuidPattern.test(projectId))
      || typeof category !== "string" || !categories.has(category)
      || typeof title !== "string" || title.trim().length < 1 || title.trim().length > 160
      || !(file instanceof File) || file.size < 1 || file.size > maxFileSize
      || !allowedTypes.has(file.type)
    ) {
      return NextResponse.json({
        error: "Vérifiez le type du document, son titre et sa taille (4 Mo maximum).",
      }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: subscriber, error: subscriberError } = await supabase
      .from("platform_subscribers")
      .select("id")
      .eq("id", subscriberId)
      .maybeSingle();
    if (subscriberError) throw subscriberError;
    if (!subscriber) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

    if (typeof projectId === "string" && projectId) {
      const { data: project, error: projectError } = await supabase
        .from("client_projects")
        .select("id")
        .eq("id", projectId)
        .eq("subscriber_id", subscriberId)
        .maybeSingle();
      if (projectError) throw projectError;
      if (!project) return NextResponse.json({ error: "Dossier introuvable pour ce client." }, { status: 404 });
    }

    const documentId = randomUUID();
    const safeName = file.name.replace(/[\\/\u0000-\u001f\u007f]/g, "_").slice(0, 255) || "document";
    const storagePath = `${subscriberId}/${documentId}`;
    const { error: uploadError } = await supabase.storage
      .from("client-portal-private")
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: "0",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data: document, error: insertError } = await supabase
      .from("client_portal_documents")
      .insert({
        id: documentId,
        subscriber_id: subscriberId,
        project_id: typeof projectId === "string" && projectId ? projectId : null,
        category,
        title: title.trim(),
        original_name: safeName,
        storage_path: storagePath,
        mime_type: file.type,
        file_size: file.size,
        uploaded_by: administrator.userId,
      })
      .select("id, subscriber_id, project_id, category, title, original_name, file_size, created_at")
      .single();

    if (insertError) {
      const { error: cleanupError } = await supabase.storage.from("client-portal-private").remove([storagePath]);
      if (cleanupError) console.error("Échec du nettoyage d’un document non enregistré :", cleanupError);
      throw insertError;
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Échec de l’ajout d’un document au portail client :", error);
    return NextResponse.json({ error: "Le document n’a pas pu être ajouté." }, { status: 500 });
  }
}
