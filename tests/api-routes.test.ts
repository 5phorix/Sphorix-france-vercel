import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const sendMail = vi.hoisted(() => vi.fn().mockResolvedValue({}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail })),
  },
}));

const databaseDirectory = mkdtempSync(path.join(os.tmpdir(), "sphorix-tests-"));
process.env.CONTACT_DB_PATH = path.join(databaseDirectory, "contacts.sqlite");
process.env.SMTP_HOST = "smtp.test";
process.env.SMTP_PORT = "465";
process.env.SMTP_USER = "contact@sphorix.fr";
process.env.SMTP_PASS = "test-password";
process.env.SMTP_TO = "contact@sphorix.fr";

let contactPost: typeof import("@/app/api/contact/route").POST;
let quotePost: typeof import("@/app/api/quote/route").POST;

beforeAll(async () => {
  ({ POST: contactPost } = await import("@/app/api/contact/route"));
  ({ POST: quotePost } = await import("@/app/api/quote/route"));
});

afterAll(() => {
  rmSync(databaseDirectory, { recursive: true, force: true });
});

describe("API contact", () => {
  it("refuse une demande sans consentement", async () => {
    const response = await contactPost(
      new NextRequest("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contactType: "particulier",
          fullName: "Marie Dupont",
          email: "marie@example.com",
          subject: "Besoin d'accompagnement",
          message: "Je souhaite échanger sur mon projet.",
          consent: false,
          retentionMonths: 24,
          policyVersion: "2026-07",
          startedAt: Date.now() - 5000,
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ success: false });
  });
});

describe("API devis", () => {
  it("refuse une adresse email invalide", async () => {
    const response = await quotePost(
      new NextRequest("http://localhost/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": "quote-invalid" },
        body: JSON.stringify({ name: "Marie Dupont", email: "invalid" }),
      })
    );

    expect(response.status).toBe(400);
  });

  it("échappe les champs avant de générer l'email", async () => {
    sendMail.mockClear();

    const response = await quotePost(
      new NextRequest("http://localhost/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": "quote-html" },
        body: JSON.stringify({
          name: "<script>alert(1)</script>",
          email: "marie@example.com",
          details: "<img src=x onerror=alert(1)>",
          minPrice: 200,
          maxPrice: 400,
          minDays: 1,
          maxDays: 2,
        }),
      })
    );

    expect(response.status).toBe(200);
    const message = sendMail.mock.calls[0]?.[0] as { html: string };
    expect(message.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(message.html).not.toContain("<script>alert(1)</script>");
    expect(message.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });
});