import { describe, expect, it } from "vitest";

import { analyzeExpenses } from "@/lib/products/expenses";

describe("analyzeExpenses", () => {
  it("compare les dépenses réelles et prévues aux budgets de la période", () => {
    const analysis = analyzeExpenses([
      { id: "1", date: "2026-09-04", supplier: "Fournisseur", category: "Achats", label: "Matériel", amount: 700, status: "paid" },
      { id: "2", date: "2026-09-20", supplier: "Outil", category: "Logiciels", label: "Abonnement", amount: 180, status: "planned" },
    ], [
      { category: "Achats", monthlyBudget: 600 },
      { category: "Logiciels", monthlyBudget: 250 },
    ], "2026-09", new Date("2026-09-19T12:00:00Z"));

    expect(analysis.totalActual).toBe(700);
    expect(analysis.totalPlanned).toBe(180);
    expect(analysis.totalVariance).toBe(30);
    expect(analysis.categories[0].isOverBudget).toBe(true);
  });

  it("identifie les dépenses prévues dont la date est dépassée", () => {
    const analysis = analyzeExpenses([
      { id: "1", date: "2026-09-10", supplier: "Bailleur", category: "Loyer", label: "Loyer", amount: 1000, status: "planned" },
    ], [{ category: "Loyer", monthlyBudget: 1000 }], "2026-09", new Date("2026-09-19T12:00:00Z"));

    expect(analysis.overduePlanned).toBe(1000);
  });
});