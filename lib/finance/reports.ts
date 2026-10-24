import { accountMap } from "./config";
import { fiscalYearOf, periodOf, postedOnly, trialBalance } from "./ledger";
import type { Cents, EntryLine, FinanceConfig, JournalEntry } from "./types";

const classOf = (code: string) => code[0];
const startsWith = (code: string, prefixes: string[]) => prefixes.some((prefix) => code.startsWith(prefix));

/** Compte de résultat : exploitation, financier, exceptionnel, impôt. */
export function incomeStatement(entries: JournalEntry[], config: FinanceConfig, from?: string, to?: string) {
  const { rows } = trialBalance(entries, config, from, to);
  const revenue = (prefixes: string[]) => rows.filter((row) => startsWith(row.code, prefixes)).reduce((total, row) => total - row.balance, 0);
  const expense = (prefixes: string[]) => rows.filter((row) => startsWith(row.code, prefixes)).reduce((total, row) => total + row.balance, 0);
  const operatingIncome = revenue(["70", "71", "72", "74", "75"]);
  const operatingExpense = expense(["60", "61", "62", "63", "64", "65", "68"]);
  const financial = revenue(["76"]) - expense(["66"]);
  const exceptional = revenue(["77"]) - expense(["67"]);
  const tax = expense(["69"]);
  const operatingResult = operatingIncome - operatingExpense;
  const preTaxResult = operatingResult + financial + exceptional;
  return { operatingIncome, operatingExpense, operatingResult, financial, exceptional, preTaxResult, tax, netResult: preTaxResult - tax };
}

/** Bilan : actif (soldes débiteurs 2-5) = passif (capitaux propres, dettes, résultat en cours). */
export function balanceSheet(entries: JournalEntry[], config: FinanceConfig, to?: string) {
  const { rows } = trialBalance(entries, config, undefined, to);
  const assets = rows.filter((row) => classOf(row.code) >= "2" && classOf(row.code) <= "5" && row.balance > 0);
  const creditBalances = rows.filter((row) => classOf(row.code) >= "2" && classOf(row.code) <= "5" && row.balance < 0);
  const equity = rows.filter((row) => classOf(row.code) === "1");
  const result = -rows.filter((row) => classOf(row.code) === "6" || classOf(row.code) === "7").reduce((total, row) => total + row.balance, 0);
  const totalAssets = assets.reduce((total, row) => total + row.balance, 0);
  const equityTotal = -equity.reduce((total, row) => total + row.balance, 0) + result;
  const debts = -creditBalances.reduce((total, row) => total + row.balance, 0);
  return { assets, equity, debts: creditBalances, result, totalAssets, equityTotal, totalDebts: debts, totalLiabilities: equityTotal + debts, balanced: totalAssets === equityTotal + debts };
}

export type VatReturn = {
  collected: Cents;
  deductible: Cents;
  /** Positif : TVA à décaisser ; négatif : crédit de TVA. */
  payable: Cents;
  byCode: { code: string; base: Cents; theoretical: Cents }[];
  /** Écart entre TVA comptabilisée et TVA théorique calculée sur les bases : doit être nul. */
  reconciliationGap: Cents;
};

/** Déclaration de TVA (CA3) sur une période, construite uniquement depuis les écritures. */
export function vatReturn(entries: JournalEntry[], config: FinanceConfig, from: string, to: string): VatReturn {
  const collectedAccounts = new Set(config.vatCodes.map((code) => code.collectedAccount));
  const deductibleAccounts = new Set(config.vatCodes.map((code) => code.deductibleAccount));
  const accounts = accountMap(config);
  let collected = 0;
  let deductible = 0;
  const bases = new Map<string, number>();
  const signed = new Map<string, number>();

  for (const entry of postedOnly(entries).filter((item) => item.date >= from && item.date <= to)) {
    for (const line of entry.lines) {
      if (collectedAccounts.has(line.accountCode)) collected += line.credit - line.debit;
      if (deductibleAccounts.has(line.accountCode)) deductible += line.debit - line.credit;
      const type = accounts.get(line.accountCode)?.type;
      if (line.taxCode && (type === "revenue" || type === "expense")) {
        const base = type === "revenue" ? line.credit - line.debit : line.debit - line.credit;
        bases.set(line.taxCode, (bases.get(line.taxCode) ?? 0) + base);
        signed.set(line.taxCode, (signed.get(line.taxCode) ?? 0) + (type === "revenue" ? base : -base));
      }
    }
  }

  const byCode = config.vatCodes.map((code) => ({ code: code.code, base: bases.get(code.code) ?? 0, theoretical: Math.round(((signed.get(code.code) ?? 0) * code.rateBp) / 10000) }));
  const theoreticalNet = byCode.reduce((total, row) => total + row.theoretical, 0);
  return { collected, deductible, payable: collected - deductible, byCode, reconciliationGap: collected - deductible - theoreticalNet };
}

/** Impôt sur les sociétés selon le barème progressif configurable. */
export function corporateTax(preTaxResult: Cents, config: FinanceConfig): Cents {
  if (preTaxResult <= 0) return 0;
  let tax = 0;
  let floor = 0;
  for (const bracket of config.taxBrackets) {
    const ceiling = bracket.upTo ?? Number.POSITIVE_INFINITY;
    const slice = Math.min(preTaxResult, ceiling) - floor;
    if (slice > 0) tax += (slice * bracket.rateBp) / 10000;
    floor = ceiling;
    if (preTaxResult <= ceiling) break;
  }
  return Math.round(tax);
}

/** Clôture fiscale de l'exercice : impôt dû et pièce d'écriture correspondante. */
export function closingTaxEntry(entries: JournalEntry[], config: FinanceConfig, closingDate: string, id: string): JournalEntry | null {
  const year = fiscalYearOf(closingDate, config.fiscalYearStartMonth);
  const result = incomeStatement(entries, config, year.start, year.end);
  const due = corporateTax(result.preTaxResult, config) - result.tax;
  if (due === 0) return null;
  const lines: EntryLine[] =
    due > 0
      ? [
          { accountCode: "695000", debit: due, credit: 0, label: "Impôt sur les sociétés" },
          { accountCode: "444000", debit: 0, credit: due, label: "Impôt sur les sociétés" },
        ]
      : [
          { accountCode: "444000", debit: -due, credit: 0, label: "Régularisation IS" },
          { accountCode: "695000", debit: 0, credit: -due, label: "Régularisation IS" },
        ];
  return { id, journal: "OD", date: closingDate, label: `Impôt sur les sociétés ${year.label}`, lines, status: "draft" };
}

export { periodOf };
