import { describe, expect, it } from "vitest";

import { mergeCartItem, updateCartItemQuantity } from "@/components/cart/CartProvider";

describe("CartProvider", () => {
  it("retire l'article quand on réduit la quantité à zéro", () => {
    const current = [
      {
        id: "prod-1",
        slug: "tableau-suivi-depenses",
        name: "Tableau de suivi des dépenses",
        priceCents: 1900,
        currency: "EUR",
        quantity: 1,
      },
    ];

    expect(updateCartItemQuantity(current, "prod-1", 0)).toEqual([]);
  });

  it("incrémente la quantité d'un article déjà présent", () => {
    const current = [
      {
        id: "prod-2",
        slug: "tableau-suivi-tresorerie",
        name: "Tableau de suivi de trésorerie",
        priceCents: 2900,
        currency: "EUR",
        quantity: 1,
      },
    ];

    expect(mergeCartItem(current, {
      id: "prod-2",
      slug: "tableau-suivi-tresorerie",
      name: "Tableau de suivi de trésorerie",
      priceCents: 2900,
      currency: "EUR",
    })).toEqual([
      {
        id: "prod-2",
        slug: "tableau-suivi-tresorerie",
        name: "Tableau de suivi de trésorerie",
        priceCents: 2900,
        currency: "EUR",
        quantity: 2,
      },
    ]);
  });
});
