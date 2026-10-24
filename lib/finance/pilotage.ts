import { accountMap } from "./config";
import { fiscalYearOf, trialBalance } from "./ledger";
import { agingSummary, controllingReport, openItems } from "./echeancier-gestion";
import { balanceSheet, corporateTax, incomeStatement, vatReturn } from "./reports";
import type { Budget, Cents, FinanceConfig, JournalEntry } from "./types";

export type CheckLevel = "ok" | "warning" | "error";
export type Check = { id: string; level: CheckLevel; message: string };

/** Tableau de pilotage : une seule source (les écritures) alimente les quatre domaines. */
export function buildPilotage(entries: JournalEntry[], config: FinanceConfig, budgets: Budget[], asOf: string) {
  const year = fiscalYearOf(asOf, config.fiscalYearStartMonth);
  const income = incomeStatement(entries, config, year.start, asOf);
  const sheet = balanceSheet(entries, config, asOf);
  const balance = trialBalance(entries, config, undefined, asOf);
  const vat = vatReturn(entries, config, year.start, asOf);
  const receivables = openItems(entries, config, "customer", asOf);
  const payables = openItems(entries, config, "supplier", asOf);
  const centers = controllingReport(entries, config, budgets, year.start, asOf);
  const accounts = accountMap(config);

  const cash = balance.rows.filter((row) => accounts.get(row.code)?.reconciliation === "bank" || row.code.startsWith("53")).reduce((total, row) => total + row.balance, 0);
  const receivable = agingSummary(receivables);
  const payable = agingSummary(payables);
  const estimatedTax = corporateTax(income.preTaxResult, config);
  const revenue = income.operatingIncome;

  const checks: Check[] = [];
  const add = (id: string, ok: boolean, level: CheckLevel, message: string) => checks.push({ id, level: ok ? "ok" : level, message });
  const drafts = entries.filter((entry) => entry.status === "draft").length;
  const overBudget = centers.filter((center) => center.budget > 0 && center.variance > 0);

  add("trial-balance", balance.balanced, "error", balance.balanced ? "Balance équilibrée : débit = crédit." : "Balance déséquilibrée : intégrité comptable compromise.");
  add("balance-sheet", sheet.balanced, "error", sheet.balanced ? "Bilan équilibré : actif = passif." : "Bilan déséquilibré : actif ≠ passif.");
  add("vat-reconciliation", vat.reconciliationGap === 0, "warning", vat.reconciliationGap === 0 ? "TVA comptabilisée conforme aux bases déclarables." : `Écart TVA de ${vat.reconciliationGap} centimes entre comptes et bases.`);
  add("drafts", drafts === 0, "warning", drafts === 0 ? "Aucune pièce en brouillon." : `${drafts} pièce(s) non comptabilisée(s).`);
  add("overdue-customers", receivable.d90plus === 0, "warning", receivable.d90plus === 0 ? "Aucune créance client à plus de 90 jours." : "Créances clients à plus de 90 jours de retard.");
  add("budget", overBudget.length === 0, "warning", overBudget.length === 0 ? "Budgets respectés." : `Dépassement budgétaire : ${overBudget.map((center) => center.costCenter).join(", ")}.`);
  add("cash", cash >= 0, "error", cash >= 0 ? "Trésorerie positive." : "Trésorerie négative.");

  return {
    fiscalYear: year,
    kpis: {
      revenue,
      netResult: income.netResult,
      margin: revenue > 0 ? income.netResult / revenue : null,
      cash,
      receivables: receivable.total,
      overdueReceivables: receivable.total - receivable.notDue,
      payables: payable.total,
      workingCapital: cash + receivable.total - payable.total,
      vatPayable: vat.payable,
      estimatedCorporateTax: estimatedTax,
    },
    income,
    sheet,
    vat,
    receivable,
    payable,
    centers,
    checks,
    healthy: checks.every((check) => check.level !== "error"),
  } satisfies Record<string, unknown> & { kpis: Record<string, Cents | number | null> };
}
