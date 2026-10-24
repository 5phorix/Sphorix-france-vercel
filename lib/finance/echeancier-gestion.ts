import { accountMap } from "./config";
import { postedOnly } from "./ledger";
import type { Budget, Cents, FinanceConfig, JournalEntry } from "./types";

export type AgingBucket = "notDue" | "d0_30" | "d31_60" | "d61_90" | "d90plus";
export type OpenItem = { partnerId: string; entryNumber?: string; reference?: string; dueDate: string; amount: Cents; daysOverdue: number; bucket: AgingBucket };

const DAY = 86_400_000;
const daysBetween = (from: string, to: string) => Math.floor((Date.parse(to) - Date.parse(from)) / DAY);
const bucketOf = (days: number): AgingBucket => (days <= 0 ? "notDue" : days <= 30 ? "d0_30" : days <= 60 ? "d31_60" : days <= 90 ? "d61_90" : "d90plus");

/**
 * Lettrage automatique : solde ensemble débit et crédit d'un même tiers
 * lorsque leur somme est nulle (règlement complet).
 */
export function autoMatch(entries: JournalEntry[], config: FinanceConfig): JournalEntry[] {
  const accounts = accountMap(config);
  const groups = new Map<string, { entryIdx: number; lineIdx: number; amount: Cents }[]>();
  entries.forEach((entry, entryIdx) => {
    if (entry.status === "draft") return;
    entry.lines.forEach((line, lineIdx) => {
      const kind = accounts.get(line.accountCode)?.reconciliation;
      if (!kind || kind === "bank" || !line.partnerId || line.matchId) return;
      const key = `${line.accountCode}|${line.partnerId}`;
      const list = groups.get(key) ?? [];
      list.push({ entryIdx, lineIdx, amount: line.debit - line.credit });
      groups.set(key, list);
    });
  });
  const next = entries.map((entry) => ({ ...entry, lines: entry.lines.map((line) => ({ ...line })) }));
  for (const [key, items] of groups) {
    if (items.reduce((total, item) => total + item.amount, 0) !== 0) continue;
    items.forEach((item) => (next[item.entryIdx].lines[item.lineIdx].matchId = `L-${key}`));
  }
  return next;
}

/** Échéancier tiers : postes non lettrés, classés par ancienneté de retard. */
export function openItems(entries: JournalEntry[], config: FinanceConfig, kind: "customer" | "supplier", asOf: string): OpenItem[] {
  const accounts = accountMap(config);
  const items: OpenItem[] = [];
  for (const entry of postedOnly(entries)) {
    for (const line of entry.lines) {
      if (accounts.get(line.accountCode)?.reconciliation !== kind || line.matchId || !line.partnerId) continue;
      const amount = kind === "customer" ? line.debit - line.credit : line.credit - line.debit;
      const dueDate = line.dueDate ?? entry.date;
      const daysOverdue = daysBetween(dueDate, asOf);
      items.push({ partnerId: line.partnerId, entryNumber: entry.number, reference: entry.reference, dueDate, amount, daysOverdue, bucket: bucketOf(daysOverdue) });
    }
  }
  return items.sort((x, y) => y.daysOverdue - x.daysOverdue);
}

export function agingSummary(items: OpenItem[]): Record<AgingBucket | "total", Cents> {
  const summary = { notDue: 0, d0_30: 0, d31_60: 0, d61_90: 0, d90plus: 0, total: 0 };
  for (const item of items) {
    summary[item.bucket] += item.amount;
    summary.total += item.amount;
  }
  return summary;
}

export type CenterReport = { costCenter: string; label: string; kind: "cost" | "profit"; revenue: Cents; costs: Cents; result: Cents; budget: Cents; variance: Cents; utilization: number | null };

/** Contrôle de gestion : réalisé issu des écritures vs budget, par centre de coûts/profit. */
export function controllingReport(entries: JournalEntry[], config: FinanceConfig, budgets: Budget[], from: string, to: string): CenterReport[] {
  const actual = new Map<string, { revenue: Cents; costs: Cents }>();
  for (const entry of postedOnly(entries).filter((item) => item.date >= from && item.date <= to)) {
    for (const line of entry.lines) {
      if (!line.costCenter) continue;
      const current = actual.get(line.costCenter) ?? { revenue: 0, costs: 0 };
      if (line.accountCode.startsWith("7")) current.revenue += line.credit - line.debit;
      if (line.accountCode.startsWith("6")) current.costs += line.debit - line.credit;
      actual.set(line.costCenter, current);
    }
  }
  const fromPeriod = from.slice(0, 7);
  const toPeriod = to.slice(0, 7);
  return config.costCenters.map((center) => {
    const { revenue, costs } = actual.get(center.code) ?? { revenue: 0, costs: 0 };
    const budget = budgets.filter((item) => item.costCenter === center.code && item.period >= fromPeriod && item.period <= toPeriod).reduce((total, item) => total + item.amount, 0);
    const reference = center.kind === "profit" ? revenue : costs;
    return { costCenter: center.code, label: center.label, kind: center.kind, revenue, costs, result: revenue - costs, budget, variance: reference - budget, utilization: budget > 0 ? reference / budget : null };
  });
}
