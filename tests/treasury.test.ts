import { describe, expect, it } from "vitest";

import { analyzeTreasury, type TreasurySettings } from "@/lib/products/treasury";

const settings: TreasurySettings = {
  companyName: "Atelier test",
  activity: "Artisanat",
  contactName: "Camille Martin",
  isOnboarded: true,
  initialBalance: 20_000,
  initialBalanceDate: "2026-09-19",
  safetyThreshold: 10_000,
};

describe("analyzeTreasury", () => {
  it("calcule la position réelle et la prévision à partir des flux", () => {
    const analysis = analyzeTreasury(settings, [
      { id: "1", date: "2026-09-19", type: "income", category: "Ventes", label: "Paiement reçu", amount: 2_000, status: "completed" },
      { id: "2", date: "2026-09-20", type: "expense", category: "Fournisseurs", label: "Commande", amount: 3_000, status: "planned" },
      { id: "3", date: "2026-09-25", type: "income", category: "Ventes", label: "Facture", amount: 1_500, status: "planned" },
    ], new Date("2026-09-19T12:00:00Z"));

    expect(analysis.currentBalance).toBe(22_000);
    expect(analysis.balanceAt30Days).toBe(20_500);
    expect(analysis.plannedIncome).toBe(1_500);
    expect(analysis.plannedExpense).toBe(3_000);
  });

  it("signale le premier jour qui passe sous le seuil de sécurité", () => {
    const analysis = analyzeTreasury(settings, [
      { id: "1", date: "2026-09-22", type: "expense", category: "Salaires", label: "Paie", amount: 12_000, status: "planned" },
    ], new Date("2026-09-19T12:00:00Z"));

    expect(analysis.tensionDate).toBe("2026-09-22");
    expect(analysis.days[3].alert).toBe("critical");
  });

  it("intègre les flux mensuels récurrents dans la prévision", () => {
    const analysis = analyzeTreasury(settings, [
      { id: "rent", date: "2026-09-20", type: "expense", category: "Loyer", label: "Loyer", amount: 1000, status: "planned", recurrence: "monthly" },
    ], new Date("2026-09-19T12:00:00Z"));

    expect(analysis.plannedExpense).toBe(3000);
    expect(analysis.balanceAt90Days).toBe(17000);
  });
});