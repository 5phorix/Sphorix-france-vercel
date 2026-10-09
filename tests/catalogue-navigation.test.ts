import { describe, expect, it } from "vitest";

import { getProductNavigation } from "@/lib/catalogue";

const products: { id: string; slug: string; name: string }[] = [
  { id: "p1", slug: "produit-1", name: "Produit 1" },
  { id: "p2", slug: "produit-2", name: "Produit 2" },
  { id: "p3", slug: "produit-3", name: "Produit 3" },
];

describe("getProductNavigation", () => {
  it("retourne le produit précédent et suivant dans l’ordre du catalogue", () => {
    expect(getProductNavigation(products, "produit-2")).toEqual({
      prevProduct: products[0],
      nextProduct: products[2],
    });
  });

  it("gère le premier et le dernier produit sans erreur", () => {
    expect(getProductNavigation(products, "produit-1")).toEqual({
      prevProduct: null,
      nextProduct: products[1],
    });

    expect(getProductNavigation(products, "produit-3")).toEqual({
      prevProduct: products[1],
      nextProduct: null,
    });
  });
});
