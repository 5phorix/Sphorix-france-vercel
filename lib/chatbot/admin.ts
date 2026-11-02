import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function isChatbotAdministrator(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(`Impossible de vérifier la session : ${userError.message}`);
  if (!user) return false;

  const { data: administrator, error } = await supabase
    .from("platform_admins")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Impossible de vérifier les droits administrateur : ${error.message}`);
  return Boolean(
    administrator?.is_active
    && ["owner", "admin"].includes(administrator.role)
  );
}
