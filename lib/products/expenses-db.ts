"use client";

import Dexie, { type Table } from "dexie";

import type { Expense, ExpenseBudget, ExpenseSettings } from "@/lib/products/expenses";

type StoredSettings = ExpenseSettings & { id: "primary" };

class ExpensesDatabase extends Dexie {
  settings!: Table<StoredSettings, "primary">;
  expenses!: Table<Expense, string>;
  budgets!: Table<ExpenseBudget, string>;

  constructor() {
    super("sadesk-expenses-v1");
    this.version(1).stores({ settings: "id", expenses: "id, date, category, status", budgets: "category" });
  }
}

export const expensesDb = new ExpensesDatabase();

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function day(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export async function seedExpensesData() {
  await expensesDb.transaction("rw", expensesDb.settings, expensesDb.expenses, expensesDb.budgets, async () => {
    if (await expensesDb.settings.get("primary")) return;
    await expensesDb.settings.put({ id: "primary", companyName: "Mon entreprise", activity: "", contactName: "", isOnboarded: false, period: currentMonth() });
    await expensesDb.budgets.bulkPut([
      { category: "Achats", monthlyBudget: 1500 }, { category: "Sous-traitance", monthlyBudget: 1200 },
      { category: "Salaires", monthlyBudget: 5000 }, { category: "Loyer", monthlyBudget: 900 },
      { category: "Logiciels", monthlyBudget: 300 }, { category: "Transport", monthlyBudget: 350 },
    ]);
    await expensesDb.expenses.bulkPut([
      { id: "seed-materials", date: day(-5), supplier: "Matériaux Dupont", category: "Achats", label: "Fournitures atelier", amount: 820, status: "paid" },
      { id: "seed-software", date: day(-3), supplier: "Suite pro", category: "Logiciels", label: "Abonnements logiciels", amount: 210, status: "paid" },
      { id: "seed-rent", date: day(2), supplier: "SCI Centre", category: "Loyer", label: "Loyer mensuel", amount: 900, status: "planned", recurrence: "monthly" },
      { id: "seed-subcontract", date: day(8), supplier: "Atelier partenaire", category: "Sous-traitance", label: "Intervention chantier", amount: 1100, status: "planned" },
    ]);
  });
}