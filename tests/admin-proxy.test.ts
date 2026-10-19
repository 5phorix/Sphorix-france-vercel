import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const updateSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/proxy", () => ({
  updateSupabaseSession: updateSession,
}));

import { proxy } from "@/proxy";

describe("proxy console éditeur", () => {
  beforeEach(() => {
    updateSession.mockReset();
    updateSession.mockImplementation(async () => NextResponse.next());
  });

  it("met à jour la session du callback de connexion commun", async () => {
    const response = await proxy(new NextRequest("http://localhost:3000/auth/callback?code=test&next=%2Fadministration"));

    expect(updateSession).toHaveBeenCalledOnce();
    expect(response.headers.get("location")).toBeNull();
  });

  it("ne bloque plus l’accès aux routes de compte du login commun", async () => {
    const response = await proxy(new NextRequest("http://localhost:3000/auth/callback?code=test&next=%2Fcompte"));

    expect(updateSession).toHaveBeenCalledOnce();
    expect(response.headers.get("location")).toBeNull();
  });
});