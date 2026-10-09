import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const inactiveAccountPaths = new Set([
    "/compte",
    "/connexion",
    "/inscription",
    "/mot-de-passe-oublie",
    "/auth/reset-password",
    "/auth/callback",
  ]);

  if (inactiveAccountPaths.has(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/contact", request.url));
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/compte/:path*",
    "/connexion",
    "/inscription",
    "/mot-de-passe-oublie",
    "/auth/reset-password",
    "/auth/callback",
  ],
};
