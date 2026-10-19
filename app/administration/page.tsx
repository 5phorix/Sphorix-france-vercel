import { redirect } from "next/navigation";

import AdministrationConsole from "@/components/admin/AdministrationConsole";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdministrationPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/administration/connexion");

  const { data: platformAdmin } = await supabase
    .from("platform_admins")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!platformAdmin?.is_active || !["owner", "admin"].includes(platformAdmin.role)) {
    redirect("/administration/connexion?access=denied");
  }

  return <AdministrationConsole userEmail={user.email ?? ""} role={platformAdmin.role} />;
}