"use client";

import Dexie, { type Table } from "dexie";

import { createDefaultConfig } from "@/lib/finance/config";
import type { Budget, FinanceConfig, JournalEntry } from "@/lib/finance/types";
import type { Customer, Invoice, Quote } from "@/lib/ventes/ventes";

type StoredConfig = FinanceConfig & { id: "primary" };
type StoredBudget = Budget & { id: string };

class FinanceDatabase extends Dexie {
  config!: Table<StoredConfig, "primary">;
  entries!: Table<JournalEntry, string>;
  budgets!: Table<StoredBudget, string>;
  customers!: Table<Customer, string>;
  quotes!: Table<Quote, string>;
  invoices!: Table<Invoice, string>;

  constructor() {
    super("sadesk-finance-v1");
    this.version(1).stores({ config: "id", entries: "id, date, journal, status", budgets: "id, costCenter, period" });
    // Le module Ventes partage la base du noyau comptable pour garantir des transactions atomiques.
    this.version(2).stores({ customers: "id, code", quotes: "id, customerId, status", invoices: "id, customerId, status" });
  }
}

export const financeDb = new FinanceDatabase();

export async function loadFinance() {
  const stored = await financeDb.config.get("primary");
  const config = stored ? (({ id, ...rest }) => (void id, rest))(stored) : createDefaultConfig();
  if (!stored) await financeDb.config.put({ ...config, id: "primary" });
  const [entries, budgets] = await Promise.all([financeDb.entries.toArray(), financeDb.budgets.toArray()]);
  return { config: config as FinanceConfig, entries, budgets: budgets.map(({ id, ...budget }) => (void id, budget)) };
}

export const saveConfig = (config: FinanceConfig) => financeDb.config.put({ ...config, id: "primary" });
export const saveEntries = (entries: JournalEntry[]) => financeDb.entries.bulkPut(entries);
export const saveBudget = (budget: Budget) => financeDb.budgets.put({ ...budget, id: `${budget.costCenter}:${budget.accountPrefix}:${budget.period}` });

export async function chargerVentes() {
  const [customers, quotes, invoices] = await Promise.all([financeDb.customers.toArray(), financeDb.quotes.toArray(), financeDb.invoices.toArray()]);
  return { customers, quotes, invoices };
}

/** Écrit un document commercial et ses pièces comptables en une seule transaction. */
export function enregistrerVentes(changes: { customers?: { put?: Customer[]; delete?: string[] }; quotes?: { put?: Quote[]; delete?: string[] }; invoices?: { put?: Invoice[]; delete?: string[] }; entries?: JournalEntry[] }) {
  return financeDb.transaction("rw", [financeDb.customers, financeDb.quotes, financeDb.invoices, financeDb.entries], async () => {
    if (changes.customers?.put) await financeDb.customers.bulkPut(changes.customers.put);
    if (changes.customers?.delete) await financeDb.customers.bulkDelete(changes.customers.delete);
    if (changes.quotes?.put) await financeDb.quotes.bulkPut(changes.quotes.put);
    if (changes.quotes?.delete) await financeDb.quotes.bulkDelete(changes.quotes.delete);
    if (changes.invoices?.put) await financeDb.invoices.bulkPut(changes.invoices.put);
    if (changes.invoices?.delete) await financeDb.invoices.bulkDelete(changes.invoices.delete);
    if (changes.entries) await financeDb.entries.bulkPut(changes.entries);
  });
}
