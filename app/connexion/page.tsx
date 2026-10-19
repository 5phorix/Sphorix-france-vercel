import { redirect } from "next/navigation";

import ConnexionForm from "@/components/account/ConnexionForm";
import { postLoginDestination } from "@/lib/auth/post-login-destination";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: platformAdmin } = await supabase
      .from("platform_admins")
      .select("role, is_active")
      .eq("user_id", user.id)
      .maybeSingle();
    redirect(postLoginDestination(platformAdmin?.role, platformAdmin?.is_active ?? false));
  }

  return <ConnexionForm linkExpired={params.error === "link-expired"} />;
}
