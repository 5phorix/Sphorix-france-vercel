import { NextResponse } from "next/server";

import { getClientPortalAdministrator, isSameOriginRequest } from "@/lib/client-portal/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const projectStatuses = ["not_started", "in_progress", "waiting_client", "completed", "on_hold"] as const;
const stepStatuses = ["pending", "in_progress", "completed"] as const;

function isValidDateOnly(value: string | null) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

async function authorize() {
  try {
    const administrator = await getClientPortalAdministrator();
    return administrator
      ? { administrator, response: null }
      : { administrator: null, response: NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 }) };
  } catch (error) {
    console.error("Échec de la vérification des droits du portail client :", error);
    return {
      administrator: null,
      response: NextResponse.json({ error: "Impossible de vérifier les droits administrateur." }, { status: 500 }),
    };
  }
}

export async function GET() {
  const { response } = await authorize();
  if (response) return response;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: subscribers, error: subscribersError } = await supabase
      .from("platform_subscribers")
      .select("id, company_name, contact_name, email, phone, status, user_id")
      .neq("status", "archived")
      .order("company_name")
      .limit(500);

    if (subscribersError) throw subscribersError;
    const subscriberIds = (subscribers ?? []).map((subscriber) => subscriber.id);
    const [
      projectsResult,
      subscriptionsResult,
      productsResult,
      documentsResult,
      invitationsResult,
    ] = await Promise.all([
      subscriberIds.length
        ? supabase.from("client_projects").select("*").in("subscriber_id", subscriberIds).order("updated_at", { ascending: false }).limit(1000)
        : Promise.resolve({ data: [], error: null }),
      subscriberIds.length
        ? supabase.from("platform_subscriptions").select("id, subscriber_id, product_code, plan_name, status, billing_interval, starts_at, current_period_end").in("subscriber_id", subscriberIds).order("created_at", { ascending: false }).limit(1000)
        : Promise.resolve({ data: [], error: null }),
      supabase.from("platform_products").select("code, name"),
      subscriberIds.length
        ? supabase.from("client_portal_documents").select("id, subscriber_id, project_id, category, title, original_name, file_size, created_at").in("subscriber_id", subscriberIds).order("created_at", { ascending: false }).limit(1000)
        : Promise.resolve({ data: [], error: null }),
      subscriberIds.length
        ? supabase.from("client_invitations").select("id, subscriber_id, expires_at, accepted_at, created_at").in("subscriber_id", subscriberIds).order("created_at", { ascending: false }).limit(1000)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const failed = [projectsResult, subscriptionsResult, productsResult, documentsResult, invitationsResult]
      .find((result) => result.error);
    if (failed?.error) throw failed.error;

    const projectIds = (projectsResult.data ?? []).map((project) => project.id);
    const [stepsResult, updatesResult] = projectIds.length
      ? await Promise.all([
        supabase.from("client_project_steps")
          .select("*")
          .in("project_id", projectIds)
          .order("sort_order")
          .limit(3000),
        supabase.from("client_project_updates")
          .select("id, project_id, author_role, body, created_at")
          .in("project_id", projectIds)
          .order("created_at", { ascending: true })
          .limit(3000),
      ])
      : [{ data: [], error: null }, { data: [], error: null }];
    if (stepsResult.error) throw stepsResult.error;
    if (updatesResult.error) throw updatesResult.error;

    const latestInvitations = new Map<string, NonNullable<typeof invitationsResult.data>[number]>();
    for (const invitation of invitationsResult.data ?? []) {
      if (!latestInvitations.has(invitation.subscriber_id)) latestInvitations.set(invitation.subscriber_id, invitation);
    }

    return NextResponse.json({
      subscribers: subscribers ?? [],
      projects: projectsResult.data ?? [],
      steps: stepsResult.data ?? [],
      updates: updatesResult.data ?? [],
      subscriptions: subscriptionsResult.data ?? [],
      products: productsResult.data ?? [],
      documents: documentsResult.data ?? [],
      invitations: [...latestInvitations.values()].map((invitation) => ({
        ...invitation,
        isActive: !invitation.accepted_at && new Date(invitation.expires_at).getTime() > Date.now(),
      })),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Échec du chargement des données du portail client :", error);
    return NextResponse.json({ error: "Les dossiers clients n’ont pas pu être chargés." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de la requête invalide." }, { status: 403 });
  }

  const { administrator, response } = await authorize();
  if (response) return response;
  if (!administrator) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "La demande est invalide." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  try {
    if (payload.action === "subscriber") {
      const companyName = typeof payload.companyName === "string" ? payload.companyName.trim() : "";
      const contactName = typeof payload.contactName === "string" ? payload.contactName.trim() : "";
      const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
      const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
      if (
        companyName.length < 2 || companyName.length > 160
        || contactName.length > 160 || phone.length > 40
        || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)
      ) {
        return NextResponse.json({ error: "Vérifiez les coordonnées du client." }, { status: 400 });
      }

      const { data: subscriberId, error: createError } = await supabase.rpc("create_client_portal_subscriber", {
        target_company_name: companyName,
        target_contact_name: contactName,
        target_email: email,
        target_phone: phone,
        target_actor_user_id: administrator.userId,
      });
      if (createError?.code === "23505") {
        return NextResponse.json({ error: "Un client existe déjà avec cette adresse email." }, { status: 409 });
      }
      if (createError) throw createError;
      if (!subscriberId) throw new Error("La création de la fiche client n’a retourné aucun identifiant.");

      const { data: subscriber, error } = await supabase
        .from("platform_subscribers")
        .select("id, company_name, contact_name, email, phone, status, user_id")
        .eq("id", subscriberId)
        .single();
      if (error) throw error;
      return NextResponse.json({ subscriber }, { status: 201 });
    }

    if (payload.action === "project") {
      const subscriberId = typeof payload.subscriberId === "string" ? payload.subscriberId : "";
      const projectId = typeof payload.projectId === "string" ? payload.projectId : null;
      const title = typeof payload.title === "string" ? payload.title.trim() : "";
      const description = typeof payload.description === "string" ? payload.description.trim() : "";
      const status = typeof payload.status === "string" ? payload.status : "not_started";
      const dueAt = typeof payload.dueAt === "string" && payload.dueAt ? payload.dueAt : null;
      if (
        !uuidPattern.test(subscriberId)
        || (projectId !== null && !uuidPattern.test(projectId))
        || title.length < 2 || title.length > 160
        || description.length > 5000
        || !projectStatuses.includes(status as typeof projectStatuses[number])
        || !isValidDateOnly(dueAt)
      ) {
        return NextResponse.json({ error: "Vérifiez les informations du dossier." }, { status: 400 });
      }

      const { data: subscriber, error: subscriberError } = await supabase
        .from("platform_subscribers")
        .select("id")
        .eq("id", subscriberId)
        .maybeSingle();
      if (subscriberError) throw subscriberError;
      if (!subscriber) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

      if (projectId) {
        const { data: project, error } = await supabase
          .from("client_projects")
          .update({
            title,
            description,
            status,
            due_at: dueAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId)
          .eq("subscriber_id", subscriberId)
          .select("*")
          .maybeSingle();
        if (error) throw error;
        if (!project) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
        return NextResponse.json({ project });
      }

      const { data: project, error } = await supabase
        .from("client_projects")
        .insert({
          subscriber_id: subscriberId,
          title,
          description,
          status,
          due_at: dueAt,
          created_by: administrator?.userId,
        })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ project }, { status: 201 });
    }

    if (payload.action === "comment") {
      const projectId = typeof payload.projectId === "string" ? payload.projectId : "";
      const body = typeof payload.body === "string" ? payload.body.trim() : "";
      if (!uuidPattern.test(projectId) || body.length < 1 || body.length > 5000) {
        return NextResponse.json({ error: "Le commentaire est invalide." }, { status: 400 });
      }

      const { data: project, error: projectError } = await supabase
        .from("client_projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();
      if (projectError) throw projectError;
      if (!project) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });

      const { data: update, error } = await supabase
        .from("client_project_updates")
        .insert({
          project_id: projectId,
          author_user_id: administrator?.userId,
          author_role: "admin",
          body,
        })
        .select("id, project_id, author_role, body, created_at")
        .single();
      if (error) throw error;
      return NextResponse.json({ update }, { status: 201 });
    }

    if (payload.action === "step") {
      const projectId = typeof payload.projectId === "string" ? payload.projectId : "";
      const stepId = typeof payload.stepId === "string" ? payload.stepId : null;
      const title = typeof payload.title === "string" ? payload.title.trim() : "";
      const status = typeof payload.status === "string" ? payload.status : "pending";
      if (
        !uuidPattern.test(projectId)
        || (stepId !== null && !uuidPattern.test(stepId))
        || title.length < 1 || title.length > 160
        || !stepStatuses.includes(status as typeof stepStatuses[number])
      ) {
        return NextResponse.json({ error: "Vérifiez les informations de l’étape." }, { status: 400 });
      }

      const { data: project, error: projectError } = await supabase
        .from("client_projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();
      if (projectError) throw projectError;
      if (!project) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });

      if (stepId) {
        const { data: step, error } = await supabase
          .from("client_project_steps")
          .update({ title, status, updated_at: new Date().toISOString() })
          .eq("id", stepId)
          .eq("project_id", projectId)
          .select("*")
          .maybeSingle();
        if (error) throw error;
        if (!step) return NextResponse.json({ error: "Étape introuvable." }, { status: 404 });
        return NextResponse.json({ step });
      }

      const { data: existingSteps, error: listError } = await supabase
        .from("client_project_steps")
        .select("sort_order")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: false })
        .limit(1);
      if (listError) throw listError;
      const sortOrder = (existingSteps?.[0]?.sort_order ?? -1) + 1;
      const { data: step, error } = await supabase
        .from("client_project_steps")
        .insert({ project_id: projectId, title, status, sort_order: sortOrder })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ step }, { status: 201 });
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } catch (error) {
    console.error("Échec de la modification du portail client :", error);
    return NextResponse.json({ error: "La modification n’a pas pu être enregistrée." }, { status: 500 });
  }
}
