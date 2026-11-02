import { describe, expect, it } from "vitest";

import { createDefaultConfig, lockPeriod, upsertAccount } from "@/lib/finance/config";
import { buildPurchaseInvoice, buildPayment, buildSalesInvoice } from "@/lib/finance/documents";
import { parseOcrInvoiceText } from "@/lib/finance/einvoice";
import { accountsInLedgerRange, fiscalYearOf, generalLedger, generalLedgerByAccounts, postEntry, reverseEntry, trialBalance, validateEntry } from "@/lib/finance/ledger";
import { autoMatch, controllingReport, openItems } from "@/lib/finance/echeancier-gestion";
import { buildPilotage } from "@/lib/finance/pilotage";
import { balanceSheet, closingTaxEntry, corporateTax, incomeStatement, vatReturn } from "@/lib/finance/reports";
import type { JournalEntry } from "@/lib/finance/types";

const config = createDefaultConfig({ costCenters: [{ code: "GEN", label: "Général", kind: "cost", active: true }, { code: "VTE", label: "Ventes", kind: "profit", active: true }] });

function ledgerWithActivity() {
  const entries: JournalEntry[] = [];
  const push = (draft: JournalEntry) => entries.push(postEntry(entries, draft, config));
  push({ id: "cap", journal: "OD", date: "2026-01-02", label: "Capital", status: "draft", lines: [{ accountCode: "512000", debit: 1_000_000, credit: 0 }, { accountCode: "101000", debit: 0, credit: 1_000_000 }] });
  push(buildSalesInvoice(config, { id: "s1", date: "2026-02-10", dueDate: "2026-03-10", customerId: "C1", reference: "F1", lines: [{ label: "Conseil", amountHT: 500_000, taxCode: "TVA20", account: "706000", costCenter: "VTE" }] }));
  push(buildPurchaseInvoice(config, { id: "p1", date: "2026-02-15", dueDate: "2026-03-15", supplierId: "F1", reference: "A1", lines: [{ label: "Loyer", amountHT: 100_000, taxCode: "TVA20", account: "613000", costCenter: "GEN" }] }));
  return entries;
}

describe("Comptabilité - écritures", () => {
  it("rejette une pièce déséquilibrée ou incomplète", () => {
    const errors = validateEntry({ id: "x", journal: "OD", date: "2026-01-01", label: "x", status: "draft", lines: [{ accountCode: "411000", debit: 100, credit: 0 }, { accountCode: "706000", debit: 0, credit: 90 }] }, config);
    expect(errors.join(" ")).toMatch(/déséquilibrée/);
    expect(errors.join(" ")).toMatch(/tiers obligatoire/);
  });

  it("numérote en continu et interdit les périodes clôturées", () => {
    const entries = ledgerWithActivity();
    expect(entries.map((entry) => entry.number)).toEqual(["OD-2026-00001", "VT-2026-00001", "AC-2026-00001"]);
    const locked = lockPeriod(config, "2026-02");
    expect(() => postEntry(entries, { ...entries[1], status: "draft" }, locked)).toThrow(/clôturée/);
  });

  it("extourne une pièce par une pièce inverse", () => {
    const entries = ledgerWithActivity();
    const { reversal, original } = reverseEntry(entries, entries[2], "2026-03-01", config, "r1");
    expect(original.status).toBe("reversed");
    const all = [entries[0], entries[1], original, reversal];
    expect(trialBalance(all, config).balanced).toBe(true);
    expect(incomeStatement(all, config).operatingExpense).toBe(0);
  });

  it("gère les exercices décalés", () => {
    expect(fiscalYearOf("2026-02-10", 4)).toEqual({ label: "2025-2026", start: "2025-04-01", end: "2026-03-31" });
    expect(fiscalYearOf("2026-02-10", 1)).toMatchObject({ label: "2026", end: "2026-12-31" });
  });

  it("produit le grand livre avec solde cumulé", () => {
    const rows = generalLedger(ledgerWithActivity(), "512000");
    expect(rows.at(-1)?.balance).toBe(1_000_000);
  });

  it("conserve le solde antérieur au début de la période du grand livre", () => {
    const entries = ledgerWithActivity();
    entries.push(postEntry(entries, buildPayment({ id: "pay", date: "2026-03-01", kind: "customer", partnerId: "C1", amount: 600_000, reference: "R1" }), config));
    const rows = generalLedger(entries, "512000", "2026-02-01", "2026-12-31");
    expect(rows).toHaveLength(1);
    expect(rows[0].balance).toBe(1_600_000);
  });

  it("calcule les soldes d'ouverture et de clôture de plusieurs comptes sur la même période", () => {
    const ledgers = generalLedgerByAccounts(ledgerWithActivity(), ["512000", "411000", "706000"], "2026-02-01", "2026-02-28");
    expect(ledgers).toEqual([
      { accountCode: "512000", rows: [], openingBalance: 1_000_000, closingBalance: 1_000_000 },
      { accountCode: "411000", rows: [expect.objectContaining({ debit: 600_000, balance: 600_000 })], openingBalance: 0, closingBalance: 600_000 },
      { accountCode: "706000", rows: [expect.objectContaining({ credit: 500_000, balance: -500_000 })], openingBalance: 0, closingBalance: -500_000 },
    ]);
  });

  it("filtre le plan comptable par plages de racines et de comptes", () => {
    const rootsOneToFive = accountsInLedgerRange(config.accounts, { mode: "root", from: "1", to: "5" });
    expect(rootsOneToFive.map((account) => account.code)).toContain("512000");
    expect(rootsOneToFive.map((account) => account.code)).not.toContain("601000");

    const accounts101To512 = accountsInLedgerRange(config.accounts, { mode: "account", from: "101", to: "512" });
    expect(accounts101To512.map((account) => account.code)).toContain("101000");
    expect(accounts101To512.map((account) => account.code)).toContain("512000");
    expect(accounts101To512.map((account) => account.code)).not.toContain("530000");
    expect(accounts101To512.map((account) => account.code)).not.toContain("601000");
    expect(accountsInLedgerRange(config.accounts, { mode: "account", from: "512", to: "101" })).toEqual([]);
  });

  it("présente les soldes initiaux et finaux de la balance autour des mouvements de période", () => {
    const result = trialBalance(ledgerWithActivity(), config, "2026-02-01", "2026-02-28");
    expect(result.rows.find((row) => row.code === "512000")).toMatchObject({
      openingBalance: 1_000_000,
      debit: 0,
      credit: 0,
      closingBalance: 1_000_000,
    });
    expect(result.rows.find((row) => row.code === "101000")).toMatchObject({
      openingBalance: -1_000_000,
      closingBalance: -1_000_000,
    });
    expect(result.rows.find((row) => row.code === "706000")).toMatchObject({
      openingBalance: 0,
      debit: 0,
      credit: 500_000,
      closingBalance: -500_000,
    });
    expect(result.openingDebit).toBe(result.openingCredit);
    expect(result.debit).toBe(result.credit);
    expect(result.closingDebit).toBe(result.closingCredit);
  });
});

describe("états financiers et fiscalité", () => {
  it("équilibre balance et bilan, calcule le résultat", () => {
    const entries = ledgerWithActivity();
    expect(trialBalance(entries, config).balanced).toBe(true);
    expect(incomeStatement(entries, config)).toMatchObject({ operatingIncome: 500_000, operatingExpense: 100_000, netResult: 400_000 });
    expect(balanceSheet(entries, config)).toMatchObject({ balanced: true, result: 400_000 });
  });

  it("calcule la TVA à décaisser et la réconciliation", () => {
    const vat = vatReturn(ledgerWithActivity(), config, "2026-01-01", "2026-12-31");
    expect(vat).toMatchObject({ collected: 100_000, deductible: 20_000, payable: 80_000, reconciliationGap: 0 });
    expect(vat.byCode.find((row) => row.code === "TVA20")?.base).toBe(500_000 + 100_000);
  });

  it("applique le barème IS progressif et génère l'écriture de clôture", () => {
    expect(corporateTax(5_000_000, config)).toBe(637_500 + 187_500);
    expect(corporateTax(-1, config)).toBe(0);
    const entry = closingTaxEntry(ledgerWithActivity(), config, "2026-12-31", "is");
    expect(entry?.lines[0]).toMatchObject({ accountCode: "695000", debit: 60_000 });
  });
});

describe("tiers et contrôle de gestion", () => {
  it("lettre un règlement complet et classe les retards", () => {
    let entries = ledgerWithActivity();
    expect(openItems(entries, config, "customer", "2026-06-30")[0]).toMatchObject({ amount: 600_000, bucket: "d90plus" });
    entries = [...entries, postEntry(entries, buildPayment({ id: "pay", date: "2026-03-05", kind: "customer", partnerId: "C1", amount: 600_000, reference: "R1" }), config)];
    entries = autoMatch(entries, config);
    expect(openItems(entries, config, "customer", "2026-06-30")).toHaveLength(0);
  });

  it("compare réalisé et budget par centre", () => {
    const report = controllingReport(ledgerWithActivity(), config, [{ costCenter: "GEN", accountPrefix: "6", period: "2026-02", amount: 80_000 }], "2026-01-01", "2026-12-31");
    expect(report.find((row) => row.costCenter === "GEN")).toMatchObject({ costs: 100_000, variance: 20_000, utilization: 1.25 });
    expect(report.find((row) => row.costCenter === "VTE")?.revenue).toBe(500_000);
  });
});

describe("personnalisation et pilotage", () => {
  it("ajoute un compte personnalisé sans altérer le standard", () => {
    const custom = upsertAccount(config, { code: "706100", label: "Formations", type: "revenue" });
    expect(custom.accounts.find((account) => account.code === "706100")?.custom).toBe(true);
    expect(config.accounts.some((account) => account.code === "706100")).toBe(false);
    expect(() => upsertAccount(config, { code: "AB", label: "x", type: "asset" })).toThrow();
  });

  it("agrège KPI et contrôles de cohérence", () => {
    const pilot = buildPilotage(ledgerWithActivity(), config, [], "2026-06-30");
    expect(pilot.healthy).toBe(true);
    expect(pilot.kpis).toMatchObject({ revenue: 500_000, netResult: 400_000, cash: 1_000_000, receivables: 600_000, payables: 120_000, vatPayable: 80_000 });
    expect(pilot.checks.find((check) => check.id === "overdue-customers")?.level).toBe("warning");
  });
});

describe("extraction OCR de factures", () => {
  it("extrait les champs courants d’une facture et conserve les montants en centimes", () => {
    const invoice = parseOcrInvoiceText(
      "ACME SAS\nFacture n° INV-2026-15\nDate facture : 12/03/2026\nEcheance : 11/04/2026\nTVA 20 %\nTotal HT : 1 234,50 €\nTotal TTC : 1 481,40 €\nFR12345678901",
      "Image/OCR",
    );

    expect(invoice).toMatchObject({
      number: "INV-2026-15",
      date: "2026-03-12",
      dueDate: "2026-04-11",
      supplierName: "ACME SAS",
      supplierId: "FR12345678901",
      totalTTC: 148_140,
      sourceFormat: "Image/OCR",
    });
    expect(invoice.lines[0]).toMatchObject({ amountHT: 123_450, taxRate: 20 });
  });

  it("laisse les champs incertains à compléter au lieu d’inventer des valeurs", () => {
    const invoice = parseOcrInvoiceText("Document scanné sans texte comptable", "PDF/OCR");

    expect(invoice).toMatchObject({ number: "", date: "", dueDate: "", supplierName: "", supplierId: "", sourceFormat: "PDF/OCR" });
    expect(invoice.lines[0].amountHT).toBe(0);
    expect(Number.isNaN(invoice.lines[0].taxRate)).toBe(true);
  });

  it("reconnaît aussi les séparateurs de milliers anglais", () => {
    const invoice = parseOcrInvoiceText(
      "ACME\nInvoice No: INV-2\nInvoice date: 2026-03-12\nVAT 20%\nTotal HT: 1,234.50\nTotal TTC: 1,481.40",
      "PDF/OCR",
    );

    expect(invoice.lines[0].amountHT).toBe(123_450);
    expect(invoice.totalTTC).toBe(148_140);
  });
});
