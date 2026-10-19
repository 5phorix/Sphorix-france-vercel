import { NextResponse } from "next/server";

import { postLoginDestination } from "@/lib/auth/post-login-destination";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/compte";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/connexion?error=link-expired", request.url));

    if (next === "/auth/reset-password") {
      return NextResponse.redirect(new URL(next, request.url));
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: platformAdmin } = user
      ? await supabase.from("platform_admins").select("role, is_active").eq("user_id", user.id).maybeSingle()
      : { data: null };
    return NextResponse.redirect(new URL(
      postLoginDestination(platformAdmin?.role, platformAdmin?.is_active ?? false),
      request.url
    ));
  }

  return NextResponse.redirect(new URL("/connexion?error=link-expired", request.url));
}
