import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "@/lib/finance/config";
import { openItems } from "@/lib/finance/echeancier-gestion";
import { buildPilotage } from "@/lib/finance/pilotage";
import { trialBalance } from "@/lib/finance/ledger";
import { vatReturn } from "@/lib/finance/reports";
import { missingDependencies } from "@/lib/suite/modules";
import {
  cancelInvoice, convertQuoteToInvoice, createInvoice, createQuote, deleteInvoice, deleteQuote, documentTrail, documentTotals, expireQuotes,
  invoiceBalance, issueInvoice, recordPayment, removeCustomer, saveCustomer, transitionQuote, updateInvoice, updateQuote,
  saveProduct, type Customer, type SalesLine, type SalesProduct,
} from "@/lib/ventes/ventes";
import type { JournalEntry } from "@/lib/finance/types";

const config = createDefaultConfig();
const customer: Customer = { id: "c1", code: "CLI001", name: "Atelier Martin", email: "a@b.fr", address: "", vatNumber: "", paymentTermsDays: 30, active: true };
const lines: SalesLine[] = [
  { id: "l1", label: "Conseil", quantity: 2, unitPrice: 25_000, discountBp: 1000, taxCode: "TVA20", account: "706000", costCenter: "GEN" },
  { id: "l2", label: "Licence", quantity: 1, unitPrice: 10_000, discountBp: 0, taxCode: "TVA10", account: "706000" },
];

describe("clients", () => {
  it("garantit l'unicité du code et protège les clients utilisés", () => {
    const list = saveCustomer([], customer);
    expect(() => saveCustomer(list, { ...customer, id: "c2" })).toThrow(/existe déjà/);
    expect(saveCustomer(list, { ...customer, name: "Nouveau" })[0].name).toBe("Nouveau");
    const quote = createQuote([], { id: "q", customer, date: "2026-03-01", validUntil: "2026-03-31", lines }, config);
    expect(() => removeCustomer(list, "c1", [quote], [])).toThrow(/archivez/);
    expect(removeCustomer(list, "c1", [], [])).toEqual([]);
    expect(saveCustomer([], { ...customer, creditLimit: 125_000 })[0].creditLimit).toBe(125_000);
    expect(() => saveCustomer([], { ...customer, creditLimit: -1 })).toThrow(/Plafond/);
  });
});

describe("catalogue des ventes", () => {
  const product: SalesProduct = { id: "p1", code: "SRV001", label: "Conseil", unit: "heure", unitPrice: 12_000, taxCode: "TVA20", account: "706000", active: true };

  it("enregistre un article avec ses paramètres comptables et refuse les références en double", () => {
    expect(saveProduct([], product, config)).toEqual([product]);
    expect(saveProduct([product], { ...product, label: "Conseil spécialisé" }, config)[0].label).toBe("Conseil spécialisé");
    expect(() => saveProduct([product], { ...product, id: "p2" }, config)).toThrow(/existe déjà/);
  });

  it("refuse un prix, un taux de TVA ou un compte de vente invalide", () => {
    expect(() => saveProduct([], { ...product, unitPrice: -1 }, config)).toThrow(/Prix unitaire/);
    expect(() => saveProduct([], { ...product, taxCode: "UNKNOWN" }, config)).toThrow(/TVA/);
    expect(() => saveProduct([], { ...product, account: "613000" }, config)).toThrow(/Compte de produit/);
  });
});

describe("devis", () => {
  it("calcule les totaux avec remise et TVA multi-taux", () => {
    expect(documentTotals(lines, config)).toEqual({ net: 55_000, tax: 9_000 + 1_000, total: 65_000 });
  });

  it("suit le cycle de vie et verrouille hors brouillon", () => {
    let quote = createQuote([], { id: "q", customer, date: "2026-03-01", validUntil: "2026-03-31", lines }, config);
    expect(quote.number).toBe("DEV-2026-00001");
    quote = updateQuote(quote, { notes: "ok" }, config);
    expect(() => transitionQuote(quote, "accepted")).toThrow();
    quote = transitionQuote(transitionQuote(quote, "sent"), "accepted");
    expect(() => updateQuote(quote, { notes: "x" }, config)).toThrow(/brouillon/);
    expect(() => deleteQuote([quote], "q")).toThrow();
    expect(expireQuotes([{ ...quote, status: "sent" }], "2026-04-01")[0].status).toBe("expired");
  });

  it("rejette les lignes invalides", () => {
    expect(() => createQuote([], { id: "q", customer, date: "2026-03-01", validUntil: "2026-03-31", lines: [{ ...lines[0], account: "613000" }] }, config)).toThrow(/compte de produit/);
  });
});

function issued() {
  let quote = createQuote([], { id: "q", customer, date: "2026-03-01", validUntil: "2026-03-31", lines }, config);
  quote = transitionQuote(transitionQuote(quote, "sent"), "accepted");
  const converted = convertQuoteToInvoice(quote, customer, "i1", "2026-03-05");
  const entries: JournalEntry[] = [];
  const result = issueInvoice(converted.invoice, customer, [], entries, config, "e1");
  return { quote: converted.quote, ...result, entries: [result.entry] };
}

describe("facturation et intégration comptable", () => {
  it("convertit un devis accepté une seule fois", () => {
    const { quote, invoice } = issued();
    expect(quote.status).toBe("invoiced");
    expect(invoice).toMatchObject({ number: "FAC-2026-00001", status: "issued", dueDate: "2026-04-04", quoteId: "q" });
    expect(() => convertQuoteToInvoice(quote, customer, "i2", "2026-03-06")).toThrow(/accepté/);
  });

  it("comptabilise automatiquement à l'émission (411 / 706 / TVA)", () => {
    const { entry, entries } = issued();
    expect(entry.number).toBe("VT-2026-00001");
    expect(entry.lines[0]).toMatchObject({ accountCode: "411000", debit: 65_000, partnerId: "CLI001" });
    expect(trialBalance(entries, config).balanced).toBe(true);
    expect(vatReturn(entries, config, "2026-03-01", "2026-03-31")).toMatchObject({ collected: 10_000, reconciliationGap: 0 });
    expect(openItems(entries, config, "customer", "2026-06-01")[0]).toMatchObject({ amount: 65_000, partnerId: "CLI001" });
    expect(buildPilotage(entries, config, [], "2026-03-31").kpis).toMatchObject({ revenue: 55_000, receivables: 65_000 });
  });

  it("rend la facture émise immuable", () => {
    const { invoice } = issued();
    expect(() => updateInvoice(invoice, { notes: "x" }, config)).toThrow(/immuable/);
    expect(() => deleteInvoice([invoice], invoice.id)).toThrow();
    expect(() => issueInvoice(invoice, customer, [invoice], [], config, "e9")).toThrow(/déjà émise/);
  });

  it("enregistre règlements partiels puis total, sans trop-perçu", () => {
    const { invoice, entries } = issued();
    const part = recordPayment(invoice, customer, entries, config, { id: "p1", entryId: "e2", date: "2026-03-20", amount: 25_000 });
    expect(part.invoice.status).toBe("partially_paid");
    expect(invoiceBalance(part.invoice, config)).toBe(40_000);
    const all = [...entries, part.entry];
    expect(() => recordPayment(part.invoice, customer, all, config, { id: "p2", entryId: "e3", date: "2026-03-21", amount: 40_001 })).toThrow(/dépasse/);
    const full = recordPayment(part.invoice, customer, all, config, { id: "p2", entryId: "e3", date: "2026-03-21", amount: 40_000 });
    expect(full.invoice.status).toBe("paid");
    expect(openItems([...all, full.entry], config, "customer", "2026-04-30").reduce((total, item) => total + item.amount, 0)).toBe(0);
    expect(documentTrail(full.invoice, [], [...all, full.entry]).map((step) => step.type)).toEqual(["invoice", "accounting", "payment", "payment"]);
  });

  it("annule une facture par extourne comptable", () => {
    const { invoice, entries } = issued();
    const result = cancelInvoice(invoice, entries, config, "2026-03-10", "r1");
    expect(result.invoice.status).toBe("cancelled");
    const all = [result.original, result.reversal];
    expect(openItems(all, config, "customer", "2026-06-01").reduce((total, item) => total + item.amount, 0)).toBe(0);
    expect(buildPilotage(all, config, [], "2026-03-31").kpis.revenue).toBe(0);
  });

  it("bloque l'émission sur une période clôturée", () => {
    const draft = createInvoice({ id: "i", customer, date: "2026-03-05", lines }, config);
    expect(() => issueInvoice(draft, customer, [], [], { ...config, lockedPeriods: ["2026-03"] }, "e")).toThrow(/clôturée/);
  });
});

describe("registre des modules", () => {
  it("signale les modules requis non disponibles", () => {
    expect(missingDependencies(["compta", "ventes"])).toEqual([]);
    expect(missingDependencies(["compta", "achats", "logistique"])).toEqual(["achats", "logistique"]);
  });
});
