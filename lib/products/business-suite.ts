export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";
export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue";
export type QuoteTemplate = "classique" | "moderne" | "compact";

export type QuoteLine = {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export type Quote = {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  validUntil: string;
  status: QuoteStatus;
  template?: QuoteTemplate;
  lines: QuoteLine[];
  notes: string;
};

export type Invoice = {
  id: string;
  number: string;
  quoteId?: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: QuoteLine[];
  template: "classique" | "sobre" | "acompte";
  notes: string;
};

export type BudgetLine = {
  id: string;
  category: string;
  planned: number;
  actual: number;
};

export type BusinessBudget = {
  id: string;
  period: string;
  lines: BudgetLine[];
};

export type QuoteTotals = {
  subtotal: number;
  tax: number;
  total: number;
};

export type BudgetAnalysis = {
  planned: number;
  actual: number;
  variance: number;
  utilizationRate: number | null;
  lines: (BudgetLine & { variance: number; isOverBudget: boolean })[];
};

export type DashboardSnapshot = {
  quotes: { total: number; accepted: number; pipeline: number };
  invoices: { total: number; issued: number; paid: number; outstanding: number };
  budget: BudgetAnalysis;
};

export function calculateDocumentTotals(lines: QuoteLine[]): QuoteTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const tax = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice * (line.taxRate / 100), 0);
  return { subtotal, tax, total: subtotal + tax };
}

export function convertQuoteToInvoice(quote: Quote, invoiceNumber: string, issueDate: string, dueDate: string): Invoice {
  return {
    id: crypto.randomUUID(),
    number: invoiceNumber,
    quoteId: quote.id,
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    issueDate,
    dueDate,
    status: "draft",
    lines: quote.lines.map((line) => ({ ...line, id: crypto.randomUUID() })),
    template: "classique",
    notes: quote.notes,
  };
}

export function analyzeBudget(budget: BusinessBudget): BudgetAnalysis {
  const lines = budget.lines.map((line) => ({
    ...line,
    variance: line.actual - line.planned,
    isOverBudget: line.actual > line.planned,
  }));
  const planned = lines.reduce((sum, line) => sum + line.planned, 0);
  const actual = lines.reduce((sum, line) => sum + line.actual, 0);
  return {
    planned,
    actual,
    variance: actual - planned,
    utilizationRate: planned > 0 ? actual / planned : null,
    lines,
  };
}

export function buildDashboardSnapshot(quotes: Quote[], invoices: Invoice[], budget: BusinessBudget): DashboardSnapshot {
  const budgetAnalysis = analyzeBudget(budget);
  return {
    quotes: {
      total: quotes.length,
      accepted: quotes.filter((quote) => quote.status === "accepted").length,
      pipeline: quotes.filter((quote) => quote.status === "sent").reduce((sum, quote) => sum + calculateDocumentTotals(quote.lines).total, 0),
    },
    invoices: {
      total: invoices.length,
      issued: invoices.filter((invoice) => invoice.status === "issued").length,
      paid: invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + calculateDocumentTotals(invoice.lines).total, 0),
      outstanding: invoices.filter((invoice) => invoice.status === "issued" || invoice.status === "overdue").reduce((sum, invoice) => sum + calculateDocumentTotals(invoice.lines).total, 0),
    },
    budget: budgetAnalysis,
  };
}