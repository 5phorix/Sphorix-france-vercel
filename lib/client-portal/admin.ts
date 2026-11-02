import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getClientPortalAdministrator() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(`Impossible de vérifier la session : ${userError.message}`);
  if (!user) return null;

  const { data: administrator, error } = await supabase
    .from("platform_admins")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Impossible de vérifier les droits administrateur : ${error.message}`);
  if (!administrator?.is_active || !["owner", "admin"].includes(administrator.role)) return null;

  return { userId: user.id };
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return false;
  return request.headers.get("sec-fetch-site") !== "cross-site";
}
