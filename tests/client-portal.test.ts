import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it } from "vitest";

let adminInvitePost: typeof import("@/app/api/admin/client-invitations/route").POST;
let redeemPost: typeof import("@/app/api/client-invitations/redeem/route").POST;
let clientPortalPost: typeof import("@/app/api/client/portal/route").POST;
let clientDocumentGet: typeof import("@/app/api/client/portal/documents/[id]/route").GET;

beforeAll(async () => {
  ({ POST: adminInvitePost } = await import("@/app/api/admin/client-invitations/route"));
  ({ POST: redeemPost } = await import("@/app/api/client-invitations/redeem/route"));
  ({ POST: clientPortalPost } = await import("@/app/api/client/portal/route"));
  ({ GET: clientDocumentGet } = await import("@/app/api/client/portal/documents/[id]/route"));
});

describe("API de l’espace client", () => {
  it("refuse les requêtes inter-origines avant toute action d’administration", async () => {
    const response = await adminInvitePost(new NextRequest("https://sphorixfrance.fr/api/admin/client-invitations", {
      method: "POST",
      headers: { origin: "https://attacker.example", "content-type": "application/json" },
      body: JSON.stringify({ subscriberId: "00000000-0000-4000-8000-000000000001" }),
    }));

    expect(response.status).toBe(403);
  });

  it("refuse les tokens d’invitation mal formés", async () => {
    const response = await redeemPost(new NextRequest("https://sphorixfrance.fr/api/client-invitations/redeem", {
      method: "POST",
      headers: { origin: "https://sphorixfrance.fr", "content-type": "application/json" },
      body: JSON.stringify({ token: "invalid" }),
    }));

    expect(response.status).toBe(400);
  });

  it("refuse les messages clients inter-origines", async () => {
    const response = await clientPortalPost(new NextRequest("https://sphorixfrance.fr/api/client/portal", {
      method: "POST",
      headers: { origin: "https://attacker.example", "content-type": "application/json" },
      body: JSON.stringify({ projectId: "00000000-0000-4000-8000-000000000001", body: "Bonjour" }),
    }));

    expect(response.status).toBe(403);
  });

  it("ne recherche pas de document avec un identifiant invalide", async () => {
    const response = await clientDocumentGet(
      new NextRequest("https://sphorixfrance.fr/api/client/portal/documents/not-a-uuid"),
      { params: Promise.resolve({ id: "not-a-uuid" }) },
    );

    expect(response.status).toBe(404);
  });
});
