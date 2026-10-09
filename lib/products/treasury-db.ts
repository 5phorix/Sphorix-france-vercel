"use client";

import Dexie, { type Table } from "dexie";

import type { TreasuryFlow, TreasurySettings } from "@/lib/products/treasury";

type StoredTreasurySettings = TreasurySettings & { id: "primary" };

class TreasuryDatabase extends Dexie {
  settings!: Table<StoredTreasurySettings, "primary">;
  flows!: Table<TreasuryFlow, string>;

  constructor() {
    super("sadesk-treasury-v1");
    this.version(1).stores({
      settings: "id",
      flows: "id, date, status, type",
    });
  }
}

export const treasuryDb = new TreasuryDatabase();

function dateKey(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export async function seedTreasuryData() {
  await treasuryDb.transaction("rw", treasuryDb.settings, treasuryDb.flows, async () => {
    const hasSettings = await treasuryDb.settings.get("primary");
    if (hasSettings) {
      if (hasSettings.activity === undefined) {
        await treasuryDb.settings.update("primary", {
          activity: "",
          contactName: "",
          isOnboarded: hasSettings.companyName !== "Mon entreprise",
        });
      }
      return;
    }

    await treasuryDb.settings.put({
      id: "primary",
      companyName: "Mon entreprise",
      activity: "",
      contactName: "",
      isOnboarded: false,
      initialBalance: 25000,
      initialBalanceDate: dateKey(0),
      safetyThreshold: 10000,
    });
    await treasuryDb.flows.bulkPut([
      { id: "seed-payment", date: dateKey(-2), type: "income", category: "Ventes", label: "Règlement facture Atelier Nord", amount: 4200, status: "completed" },
      { id: "seed-supplies", date: dateKey(2), type: "expense", category: "Fournisseurs", label: "Commande matériaux", amount: 1800, status: "planned" },
      { id: "seed-salaries", date: dateKey(7), type: "expense", category: "Salaires", label: "Salaires équipe", amount: 6400, status: "planned" },
      { id: "seed-project", date: dateKey(12), type: "income", category: "Prestations", label: "Facture projet Rivage", amount: 5800, status: "planned" },
      { id: "seed-vat", date: dateKey(20), type: "expense", category: "TVA", label: "Échéance TVA", amount: 3100, status: "planned" },
    ]);
  });
}