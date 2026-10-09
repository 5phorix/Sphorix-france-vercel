import { describe, expect, it } from "vitest";

import {
  analyzeBudget,
  buildDashboardSnapshot,
  calculateDocumentTotals,
  convertQuoteToInvoice,
  type BusinessBudget,
  type Quote,
} from "@/lib/products/business-suite";

const lines = [{ id: "line-1", label: "Développement", quantity: 2, unitPrice: 100, taxRate: 20 }];
const quote: Quote = {
  id: "quote-1",
  number: "DEV-2026-001",
  customerName: "Atelier Martin",
  customerEmail: "contact@example.com",
  issueDate: "2026-09-21",
  validUntil: "2026-10-21",
  status: "accepted",
  lines,
  notes: "",
};
const budget: BusinessBudget = {
  id: "budget-1",
  period: "2026-09",
  lines: [{ id: "budget-line-1", category: "Marketing", planned: 500, actual: 650 }],
};

describe("business suite", () => {
  it("calcule les totaux HT, TVA et TTC", () => {
    expect(calculateDocumentTotals(lines)).toEqual({ subtotal: 200, tax: 40, total: 240 });
  });

  it("convertit un devis accepté en brouillon de facture", () => {
    const invoice = convertQuoteToInvoice(quote, "FAC-2026-001", "2026-09-21", "2026-10-21");
    expect(invoice).toMatchObject({ quoteId: "quote-1", number: "FAC-2026-001", customerName: "Atelier Martin", status: "draft" });
    expect(invoice.lines).toHaveLength(1);
  });

  it("analyse les écarts budgétaires et le tableau de bord", () => {
    expect(analyzeBudget(budget)).toMatchObject({ planned: 500, actual: 650, variance: 150, utilizationRate: 1.3 });
    const snapshot = buildDashboardSnapshot([quote], [{ ...convertQuoteToInvoice(quote, "FAC-2026-001", "2026-09-21", "2026-10-21"), status: "issued" }], budget);
    expect(snapshot.quotes).toMatchObject({ total: 1, accepted: 1 });
    expect(snapshot.invoices.outstanding).toBe(240);
  });
});