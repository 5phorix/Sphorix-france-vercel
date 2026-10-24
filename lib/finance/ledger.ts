import { accountMap } from "./config";
import type { Account, Cents, EntryLine, FinanceConfig, JournalEntry } from "./types";

export const periodOf = (date: string) => date.slice(0, 7);

/** Exercice comptable contenant la date, selon le mois de début configuré. */
export function fiscalYearOf(date: string, startMonth: number) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const startYear = month >= startMonth ? year : year - 1;
  const endYear = startMonth === 1 ? startYear : startYear + 1;
  const endMonth = startMonth === 1 ? 12 : startMonth - 1;
  const pad = (value: number) => String(value).padStart(2, "0");
  const lastDay = new Date(Date.UTC(endYear, endMonth, 0)).getUTCDate();
  return {
    label: startMonth === 1 ? String(startYear) : `${startYear}-${endYear}`,
    start: `${startYear}-${pad(startMonth)}-01`,
    end: `${endYear}-${pad(endMonth)}-${pad(lastDay)}`,
  };
}

export const sumDebit = (lines: EntryLine[]) => lines.reduce((total, line) => total + line.debit, 0);
export const sumCredit = (lines: EntryLine[]) => lines.reduce((total, line) => total + line.credit, 0);

/** Retourne la liste des anomalies bloquant la comptabilisation (vide = pièce valide). */
export function validateEntry(entry: JournalEntry, config: FinanceConfig): string[] {
  const errors: string[] = [];
  const accounts = accountMap(config);
  const centers = new Map(config.costCenters.map((center) => [center.code, center]));
  const vat = new Set(config.vatCodes.map((code) => code.code));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || Number.isNaN(Date.parse(entry.date))) errors.push("Date de pièce invalide.");
  else if (config.lockedPeriods.includes(periodOf(entry.date))) errors.push(`La période ${periodOf(entry.date)} est clôturée.`);
  if (entry.lines.length < 2) errors.push("Une pièce comporte au minimum deux lignes.");

  entry.lines.forEach((line, index) => {
    const n = index + 1;
    const account: Account | undefined = accounts.get(line.accountCode);
    if (!account) errors.push(`Ligne ${n} : compte ${line.accountCode} inconnu.`);
    else {
      if (!account.active) errors.push(`Ligne ${n} : compte ${line.accountCode} inactif.`);
      if (account.reconciliation && account.reconciliation !== "bank" && !line.partnerId) errors.push(`Ligne ${n} : tiers obligatoire sur le compte ${line.accountCode}.`);
      if (account.requiresCostCenter && !line.costCenter) errors.push(`Ligne ${n} : centre de coûts obligatoire sur le compte ${line.accountCode}.`);
    }
    if (!Number.isInteger(line.debit) || !Number.isInteger(line.credit) || line.debit < 0 || line.credit < 0) errors.push(`Ligne ${n} : montants en centimes entiers et positifs requis.`);
    if (line.debit > 0 && line.credit > 0) errors.push(`Ligne ${n} : une ligne ne peut être à la fois au débit et au crédit.`);
    if (line.debit === 0 && line.credit === 0) errors.push(`Ligne ${n} : montant nul.`);
    if (line.costCenter && !centers.get(line.costCenter)?.active) errors.push(`Ligne ${n} : centre ${line.costCenter} inconnu ou inactif.`);
    if (line.taxCode && !vat.has(line.taxCode)) errors.push(`Ligne ${n} : code TVA ${line.taxCode} inconnu.`);
  });

  const debit = sumDebit(entry.lines);
  const credit = sumCredit(entry.lines);
  if (debit !== credit) errors.push(`Pièce déséquilibrée : débit ${debit} ≠ crédit ${credit}.`);
  return errors;
}

function nextNumber(posted: JournalEntry[], entry: JournalEntry, config: FinanceConfig) {
  const year = fiscalYearOf(entry.date, config.fiscalYearStartMonth).label;
  const prefix = (seq: string) => config.numberPattern.replace("{JNL}", entry.journal).replace("{YYYY}", year).replace("{SEQ}", seq);
  const [head, tail = ""] = prefix("\u0000").split("\u0000");
  const used = posted
    .filter((item) => item.number?.startsWith(head) && item.number.endsWith(tail))
    .map((item) => Number(item.number!.slice(head.length, item.number!.length - tail.length)))
    .filter(Number.isFinite);
  return prefix(String((used.length ? Math.max(...used) : 0) + 1).padStart(config.seqPadding, "0"));
}

/** Comptabilise une pièce : contrôle, numérotation continue et statut « posted » (immuable). */
export function postEntry(existing: JournalEntry[], draft: JournalEntry, config: FinanceConfig): JournalEntry {
  if (draft.status === "posted") throw new Error("Pièce déjà comptabilisée.");
  const errors = validateEntry(draft, config);
  if (errors.length) throw new Error(errors.join(" "));
  return { ...draft, status: "posted", number: nextNumber(existing, draft, config) };
}

/** Une pièce comptabilisée ne se modifie pas : on l'extourne par une pièce inverse. */
export function reverseEntry(existing: JournalEntry[], target: JournalEntry, date: string, config: FinanceConfig, id: string): { reversal: JournalEntry; original: JournalEntry } {
  if (target.status !== "posted") throw new Error("Seule une pièce comptabilisée peut être extournée.");
  const reversal = postEntry(
    existing,
    {
      id,
      journal: "OD",
      date,
      label: `Extourne ${target.number}`,
      reversalOf: target.id,
      status: "draft",
      lines: target.lines.map((line) => ({ ...line, debit: line.credit, credit: line.debit, matchId: undefined })),
    },
    config,
  );
  return { reversal, original: { ...target, status: "reversed" } };
}

export const postedOnly = (entries: JournalEntry[]) => entries.filter((entry) => entry.status !== "draft");
const inRange = (entry: JournalEntry, from?: string, to?: string) => (!from || entry.date >= from) && (!to || entry.date <= to);

export type LedgerRow = { date: string; number?: string; label: string; debit: Cents; credit: Cents; balance: Cents; partnerId?: string; costCenter?: string };

/** Grand livre d'un compte avec solde cumulé (débit - crédit). */
export function generalLedger(entries: JournalEntry[], accountCode: string, from?: string, to?: string): LedgerRow[] {
  let balance = 0;
  return postedOnly(entries)
    .filter((entry) => inRange(entry, from, to))
    .sort((x, y) => x.date.localeCompare(y.date) || (x.number ?? "").localeCompare(y.number ?? ""))
    .flatMap((entry) =>
      entry.lines
        .filter((line) => line.accountCode === accountCode)
        .map((line) => {
          balance += line.debit - line.credit;
          return { date: entry.date, number: entry.number, label: line.label ?? entry.label, debit: line.debit, credit: line.credit, balance, partnerId: line.partnerId, costCenter: line.costCenter };
        }),
    );
}

export type TrialBalanceRow = { code: string; label: string; type: Account["type"]; debit: Cents; credit: Cents; balance: Cents };

export function trialBalance(entries: JournalEntry[], config: FinanceConfig, from?: string, to?: string) {
  const accounts = accountMap(config);
  const totals = new Map<string, { debit: Cents; credit: Cents }>();
  for (const entry of postedOnly(entries).filter((item) => inRange(item, from, to))) {
    for (const line of entry.lines) {
      const current = totals.get(line.accountCode) ?? { debit: 0, credit: 0 };
      current.debit += line.debit;
      current.credit += line.credit;
      totals.set(line.accountCode, current);
    }
  }
  const rows: TrialBalanceRow[] = [...totals.entries()]
    .map(([code, value]) => ({ code, label: accounts.get(code)?.label ?? "Compte inconnu", type: accounts.get(code)?.type ?? ("asset" as const), ...value, balance: value.debit - value.credit }))
    .sort((x, y) => x.code.localeCompare(y.code));
  const debit = rows.reduce((total, row) => total + row.debit, 0);
  const credit = rows.reduce((total, row) => total + row.credit, 0);
  return { rows, debit, credit, balanced: debit === credit };
}
