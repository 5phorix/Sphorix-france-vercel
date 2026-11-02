import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteSelect = vi.hoisted(() => vi.fn());
const deleteLt = vi.hoisted(() => vi.fn(() => ({ select: deleteSelect })));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      delete: () => ({
        lt: deleteLt,
      }),
    }),
  }),
}));

import {
  getContactRetentionCutoff,
  purgeExpiredChatData,
  purgeExpiredContactLeads,
} from "@/lib/privacy-retention";

describe("rétention des demandes", () => {
  beforeEach(() => {
    deleteSelect.mockResolvedValue({
      data: [{ id: "lead-1" }, { id: "lead-2" }],
      error: null,
    });
  });

  it("calcule la date limite à 24 mois calendaires", () => {
    expect(getContactRetentionCutoff(new Date("2026-11-02T10:20:30.000Z"))).toBe(
      "2024-11-02T10:20:30.000Z"
    );
  });

  it("borne la date au dernier jour du mois cible", () => {
    expect(getContactRetentionCutoff(new Date("2028-02-29T08:00:00.000Z"))).toBe(
      "2026-02-28T08:00:00.000Z"
    );
  });

  it("supprime les demandes expirées avec le seuil de 24 mois", async () => {
    await expect(purgeExpiredContactLeads(new Date("2026-11-02T10:20:30.000Z"))).resolves.toBe(2);
    expect(deleteLt).toHaveBeenCalledWith("created_at", "2024-11-02T10:20:30.000Z");
  });

  it("purge les conversations expirées et les limites de débit obsolètes", async () => {
    deleteLt.mockClear();
    await expect(purgeExpiredChatData(new Date("2026-11-02T10:20:30.000Z"))).resolves.toEqual({
      conversations: 2,
      rateLimits: 2,
    });
    expect(deleteLt).toHaveBeenNthCalledWith(1, "expires_at", "2026-11-02T10:20:30.000Z");
    expect(deleteLt).toHaveBeenNthCalledWith(2, "window_started_at", "2026-11-01T10:20:30.000Z");
  });

  it("refuse l'appel du cron sans le secret attendu", async () => {
    process.env.CRON_SECRET = "expected-secret";
    const { GET } = await import("@/app/api/cron/purge-contact-leads/route");
    const response = await GET(new NextRequest("https://example.test/api/cron/purge-contact-leads"));

    expect(response.status).toBe(401);
  });
});
