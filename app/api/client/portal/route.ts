import { NextResponse } from "next/server";

import { isSameOriginRequest } from "@/lib/client-portal/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getCurrentClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return { supabase, user: null, subscriber: null };

  const admin = createSupabaseAdminClient();
  const { data: subscriber, error } = await admin
    .from("platform_subscribers")
    .select("id, company_name, contact_name, email, user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return { supabase, user, subscriber };
}

export async function GET() {
  try {
    const { user, subscriber } = await getCurrentClient();
    if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    if (!subscriber) return NextResponse.json({ linked: false }, { headers: { "cache-control": "no-store" } });

    const supabase = createSupabaseAdminClient();
    const [projectsResult, documentsResult, subscriptionsResult] = await Promise.all([
      supabase.from("client_projects")
        .select("id, title, description, status, due_at, created_at, updated_at")
        .eq("subscriber_id", subscriber.id)
        .order("updated_at", { ascending: false }),
      supabase.from("client_portal_documents")
        .select("id, project_id, category, title, original_name, file_size, created_at")
        .eq("subscriber_id", subscriber.id)
        .order("created_at", { ascending: false }),
      supabase.from("platform_subscriptions")
        .select("id, product_code, plan_name, status, billing_interval, starts_at, current_period_end")
        .eq("subscriber_id", subscriber.id)
        .order("created_at", { ascending: false }),
    ]);

    const failed = [projectsResult, documentsResult, subscriptionsResult].find((result) => result.error);
    if (failed?.error) throw failed.error;

    const projectIds = (projectsResult.data ?? []).map((project) => project.id);
    const subscriptionIds = (subscriptionsResult.data ?? []).map((subscription) => subscription.id);
    const [stepsResult, updatesResult, productsResult, productAccessResult] = await Promise.all([
      projectIds.length
        ? supabase.from("client_project_steps")
          .select("id, project_id, title, status, sort_order, updated_at")
          .in("project_id", projectIds)
          .order("sort_order")
        : Promise.resolve({ data: [], error: null }),
      projectIds.length
        ? supabase.from("client_project_updates")
          .select("id, project_id, author_role, body, created_at")
          .in("project_id", projectIds)
          .order("created_at", { ascending: true })
          .limit(1000)
        : Promise.resolve({ data: [], error: null }),
      supabase.from("platform_products").select("code, name"),
      subscriptionIds.length
        ? supabase.from("platform_product_access")
          .select("id, subscription_id, product_code, access_kind, status, external_reference, expires_at")
          .in("subscription_id", subscriptionIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (stepsResult.error) throw stepsResult.error;
    if (updatesResult.error) throw updatesResult.error;
    if (productsResult.error) throw productsResult.error;
    if (productAccessResult.error) throw productAccessResult.error;

    const productNames = new Map((productsResult.data ?? []).map((product) => [product.code, product.name]));
    return NextResponse.json({
      linked: true,
      subscriber: {
        companyName: subscriber.company_name,
        contactName: subscriber.contact_name,
      },
      projects: projectsResult.data ?? [],
      steps: stepsResult.data ?? [],
      updates: updatesResult.data ?? [],
      documents: documentsResult.data ?? [],
      subscriptions: (subscriptionsResult.data ?? []).map((subscription) => ({
        ...subscription,
        productName: productNames.get(subscription.product_code) ?? subscription.product_code,
      })),
      productAccess: (productAccessResult.data ?? []).map((access) => ({
        ...access,
        external_reference: access.external_reference?.slice(0, 500) ?? null,
        productName: productNames.get(access.product_code) ?? access.product_code,
      })),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Échec du chargement de l’espace client :", error);
    return NextResponse.json({ error: "L’espace client n’a pas pu être chargé." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de la requête invalide." }, { status: 403 });
  }

  let payload: { projectId?: unknown; body?: unknown };
  try {
    payload = await request.json() as typeof payload;
  } catch {
    return NextResponse.json({ error: "La demande est invalide." }, { status: 400 });
  }

  if (
    typeof payload.projectId !== "string" || !uuidPattern.test(payload.projectId)
    || typeof payload.body !== "string" || payload.body.trim().length < 1 || payload.body.trim().length > 5000
  ) {
    return NextResponse.json({ error: "Le commentaire est invalide." }, { status: 400 });
  }

  try {
    const { supabase: userClient, user, subscriber } = await getCurrentClient();
    if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
    if (!subscriber) return NextResponse.json({ error: "Aucun dossier client n’est associé à ce compte." }, { status: 403 });

    const admin = createSupabaseAdminClient();
    const { data: project, error: projectError } = await admin
      .from("client_projects")
      .select("id")
      .eq("id", payload.projectId)
      .eq("subscriber_id", subscriber.id)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });

    const { data: update, error } = await userClient
      .from("client_project_updates")
      .insert({
        project_id: project.id,
        author_user_id: user.id,
        author_role: "client",
        body: payload.body.trim(),
      })
      .select("id, project_id, author_role, body, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ update }, { status: 201 });
  } catch (error) {
    console.error("Échec de l’envoi d’un commentaire client :", error);
    return NextResponse.json({ error: "Le commentaire n’a pas pu être envoyé." }, { status: 500 });
  }
}
