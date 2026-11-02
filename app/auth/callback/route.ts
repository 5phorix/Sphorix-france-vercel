import { NextResponse } from "next/server";

import { postLoginDestination } from "@/lib/auth/post-login-destination";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/compte";
  const invitationNext = /^\/invitation\?token=[A-Za-z0-9_-]{43}$/.test(requestedNext)
    ? requestedNext
    : null;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/connexion?error=link-expired", request.url));

    if (requestedNext === "/auth/reset-password") {
      return NextResponse.redirect(new URL(requestedNext, request.url));
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user && !invitationNext && user.user_metadata?.password_set !== true) {
      return NextResponse.redirect(new URL("/auth/reset-password", request.url));
    }
    const { data: platformAdmin } = user
      ? await supabase.from("platform_admins").select("role, is_active").eq("user_id", user.id).maybeSingle()
      : { data: null };
    return NextResponse.redirect(new URL(
      invitationNext ?? postLoginDestination(platformAdmin?.role, platformAdmin?.is_active ?? false),
      request.url
    ));
  }

  return NextResponse.redirect(new URL("/connexion?error=link-expired", request.url));
}
