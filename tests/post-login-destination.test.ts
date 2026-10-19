import { describe, expect, it } from "vitest";

import { postLoginDestination } from "@/lib/auth/post-login-destination";

describe("destination après connexion", () => {
  it("dirige un administrateur éditeur actif vers la console", () => {
    expect(postLoginDestination("owner", true)).toBe("/administration");
    expect(postLoginDestination("admin", true)).toBe("/administration");
  });

  it("dirige les autres utilisateurs vers leur espace client", () => {
    expect(postLoginDestination("viewer", true)).toBe("/compte");
    expect(postLoginDestination("support", true)).toBe("/compte");
    expect(postLoginDestination(null, false)).toBe("/compte");
  });
});