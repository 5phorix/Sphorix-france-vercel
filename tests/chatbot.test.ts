import { NextRequest } from "next/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

let chatPost: typeof import("@/app/api/chat/route").POST;
let chatGet: typeof import("@/app/api/chat/route").GET;

beforeAll(async () => {
  ({ POST: chatPost, GET: chatGet } = await import("@/app/api/chat/route"));
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("API chatbot", () => {
  it("refuse les requêtes provenant d’une autre origine", async () => {
    const response = await chatPost(new NextRequest("https://www.sphorix.fr/api/chat", {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: "Bonjour" }),
    }));

    expect(response.status).toBe(403);
  });

  it("refuse un message vide", async () => {
    const response = await chatPost(new NextRequest("https://www.sphorix.fr/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "   " }),
    }));

    expect(response.status).toBe(400);
  });

  it("n’active pas le service lorsque la configuration Azure manque", async () => {
    for (const name of [
      "AZURE_AI_FOUNDRY_CHAT_COMPLETIONS_URL",
      "AZURE_AI_FOUNDRY_API_KEY",
      "AZURE_AI_FOUNDRY_MODEL",
      "AZURE_AI_SEARCH_ENDPOINT",
      "AZURE_AI_SEARCH_API_KEY",
      "AZURE_AI_SEARCH_INDEX",
    ]) {
      vi.stubEnv(name, "");
    }

    const response = await chatPost(new NextRequest("https://www.sphorix.fr/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Bonjour" }),
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: "Le chatbot n’est pas encore configuré.",
    });
  });

  it("masque le widget public quand Azure n’est pas configuré", async () => {
    for (const name of [
      "AZURE_AI_FOUNDRY_CHAT_COMPLETIONS_URL",
      "AZURE_AI_FOUNDRY_API_KEY",
      "AZURE_AI_FOUNDRY_MODEL",
      "AZURE_AI_SEARCH_ENDPOINT",
      "AZURE_AI_SEARCH_API_KEY",
      "AZURE_AI_SEARCH_INDEX",
    ]) {
      vi.stubEnv(name, "");
    }

    const response = await chatGet(new NextRequest("https://www.sphorix.fr/api/chat"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ enabled: false });
  });
});
