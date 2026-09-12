import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/compte";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Ensure redirect target is relative to prevent open redirect vulnerabilities
  const redirectPath = next.startsWith("/") ? next : "/compte";
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
