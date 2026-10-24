import { buildPayment, buildSalesInvoice } from "@/lib/finance/documents";
import { postEntry, reverseEntry } from "@/lib/finance/ledger";
import type { Cents, FinanceConfig, JournalEntry } from "@/lib/finance/types";

export type Customer = {
  id: string;
  /** Code tiers : sert de clé de lettrage dans la comptabilité clients (compte 411). */
  code: string;
  name: string;
  email: string;
  address: string;
  vatNumber: string;
  paymentTermsDays: number;
  active: boolean;
};

export type SalesLine = {
  id: string;
  label: string;
  quantity: number;
  unitPrice: Cents;
  /** Remise en points de base : 1000 = 10 %. */
  discountBp: number;
  taxCode: string;
  account: string;
  costCenter?: string;
};

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired" | "invoiced";
export type Quote = { id: string; number: string; customerId: string; date: string; validUntil: string; status: QuoteStatus; lines: SalesLine[]; notes: string };

export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "cancelled";
export type Payment = { id: string; date: string; amount: Cents; entryId: string };
export type Invoice = {
  id: string;
  /** Attribué uniquement à l'émission : numérotation continue sans trou. */
  number?: string;
  quoteId?: string;
  customerId: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: SalesLine[];
  notes: string;
  /** Écriture comptable générée à l'émission. */
  entryId?: string;
  payments: Payment[];
};

const DAY = 86_400_000;
export const addDays = (date: string, days: number) => new Date(Date.parse(date) + days * DAY).toISOString().slice(0, 10);

export const lineNet = (line: SalesLine) => Math.round((line.quantity * line.unitPrice * (10_000 - line.discountBp)) / 10_000);

function vatOf(config: FinanceConfig, code: string) {
  const vat = config.vatCodes.find((item) => item.code === code);
  if (!vat) throw new Error(`Code TVA inconnu : ${code}`);
  return vat;
}

/** Totaux calculés ligne par ligne, avec la même règle d'arrondi que la comptabilisation. */
export function documentTotals(lines: SalesLine[], config: FinanceConfig) {
  let net = 0;
  let tax = 0;
  for (const line of lines) {
    const amount = lineNet(line);
    net += amount;
    tax += Math.round((amount * vatOf(config, line.taxCode).rateBp) / 10_000);
  }
  return { net, tax, total: net + tax };
}

export function validateLines(lines: SalesLine[], config: FinanceConfig): string[] {
  const errors: string[] = [];
  if (lines.length === 0) errors.push("Au moins une ligne est requise.");
  lines.forEach((line, index) => {
    const n = index + 1;
    const account = config.accounts.find((item) => item.code === line.account);
    if (!line.label.trim()) errors.push(`Ligne ${n} : libellé requis.`);
    if (!(line.quantity > 0)) errors.push(`Ligne ${n} : quantité > 0 requise.`);
    if (!Number.isInteger(line.unitPrice) || line.unitPrice < 0) errors.push(`Ligne ${n} : prix unitaire invalide.`);
    if (!Number.isInteger(line.discountBp) || line.discountBp < 0 || line.discountBp > 10_000) errors.push(`Ligne ${n} : remise invalide.`);
    if (!config.vatCodes.some((code) => code.code === line.taxCode)) errors.push(`Ligne ${n} : code TVA inconnu.`);
    if (!account || account.type !== "revenue" || !account.active) errors.push(`Ligne ${n} : compte de produit invalide.`);
    if (line.costCenter && !config.costCenters.some((center) => center.code === line.costCenter && center.active)) errors.push(`Ligne ${n} : centre inconnu.`);
  });
  return errors;
}

const assert = (errors: string[]) => {
  if (errors.length) throw new Error(errors.join(" "));
};

export function nextDocNumber(prefix: string, date: string, existing: (string | undefined)[], pad = 5) {
  const head = `${prefix}-${date.slice(0, 4)}-`;
  const used = existing.filter((value): value is string => !!value?.startsWith(head)).map((value) => Number(value.slice(head.length))).filter(Number.isFinite);
  return `${head}${String((used.length ? Math.max(...used) : 0) + 1).padStart(pad, "0")}`;
}

/* ---------- Clients (données de base) ---------- */

export function saveCustomer(customers: Customer[], customer: Customer): Customer[] {
  if (!customer.code.trim() || !customer.name.trim()) throw new Error("Code et nom du client requis.");
  if (customers.some((item) => item.id !== customer.id && item.code.toLowerCase() === customer.code.toLowerCase())) throw new Error(`Le code client ${customer.code} existe déjà.`);
  if (!Number.isInteger(customer.paymentTermsDays) || customer.paymentTermsDays < 0) throw new Error("Délai de paiement invalide.");
  return customers.some((item) => item.id === customer.id) ? customers.map((item) => (item.id === customer.id ? customer : item)) : [...customers, customer];
}

/** Un client référencé par un document ne se supprime pas : il s'archive (intégrité comptable). */
export function removeCustomer(customers: Customer[], id: string, quotes: Quote[], invoices: Invoice[]): Customer[] {
  if (quotes.some((item) => item.customerId === id) || invoices.some((item) => item.customerId === id)) throw new Error("Client utilisé par des documents : archivez-le plutôt que de le supprimer.");
  return customers.filter((item) => item.id !== id);
}

/* ---------- Devis ---------- */

export function createQuote(quotes: Quote[], input: { id: string; customer: Customer; date: string; validUntil: string; lines: SalesLine[]; notes?: string }, config: FinanceConfig): Quote {
  assert(validateLines(input.lines, config));
  if (!input.customer.active) throw new Error("Client archivé.");
  if (input.validUntil < input.date) throw new Error("La validité précède la date du devis.");
  return { id: input.id, number: nextDocNumber("DEV", input.date, quotes.map((item) => item.number)), customerId: input.customer.id, date: input.date, validUntil: input.validUntil, status: "draft", lines: input.lines, notes: input.notes ?? "" };
}

export function updateQuote(quote: Quote, patch: Partial<Pick<Quote, "date" | "validUntil" | "lines" | "notes" | "customerId">>, config: FinanceConfig): Quote {
  if (quote.status !== "draft") throw new Error("Seul un devis brouillon est modifiable.");
  const next = { ...quote, ...patch };
  assert(validateLines(next.lines, config));
  if (next.validUntil < next.date) throw new Error("La validité précède la date du devis.");
  return next;
}

export function deleteQuote(quotes: Quote[], id: string): Quote[] {
  const quote = quotes.find((item) => item.id === id);
  if (quote && quote.status !== "draft") throw new Error("Seul un devis brouillon est supprimable.");
  return quotes.filter((item) => item.id !== id);
}

const quoteTransitions: Record<QuoteStatus, QuoteStatus[]> = { draft: ["sent"], sent: ["accepted", "rejected"], accepted: [], rejected: [], expired: [], invoiced: [] };

export function transitionQuote(quote: Quote, to: QuoteStatus): Quote {
  if (!quoteTransitions[quote.status].includes(to)) throw new Error(`Transition impossible : ${quote.status} → ${to}.`);
  return { ...quote, status: to };
}

export const expireQuotes = (quotes: Quote[], asOf: string): Quote[] => quotes.map((quote) => (quote.status === "sent" && quote.validUntil < asOf ? { ...quote, status: "expired" } : quote));

/** Chaîne de documents : un devis accepté génère une facture brouillon et se verrouille. */
export function convertQuoteToInvoice(quote: Quote, customer: Customer, id: string, date: string): { quote: Quote; invoice: Invoice } {
  if (quote.status !== "accepted") throw new Error("Seul un devis accepté peut être facturé.");
  return {
    quote: { ...quote, status: "invoiced" },
    invoice: { id, quoteId: quote.id, customerId: customer.id, date, dueDate: addDays(date, customer.paymentTermsDays), status: "draft", lines: quote.lines.map((line) => ({ ...line })), notes: quote.notes, payments: [] },
  };
}

/* ---------- Factures ---------- */

export function createInvoice(input: { id: string; customer: Customer; date: string; lines: SalesLine[]; notes?: string }, config: FinanceConfig): Invoice {
  assert(validateLines(input.lines, config));
  if (!input.customer.active) throw new Error("Client archivé.");
  return { id: input.id, customerId: input.customer.id, date: input.date, dueDate: addDays(input.date, input.customer.paymentTermsDays), status: "draft", lines: input.lines, notes: input.notes ?? "", payments: [] };
}

export function updateInvoice(invoice: Invoice, patch: Partial<Pick<Invoice, "date" | "dueDate" | "lines" | "notes">>, config: FinanceConfig): Invoice {
  if (invoice.status !== "draft") throw new Error("Une facture émise est immuable : annulez-la par un avoir.");
  const next = { ...invoice, ...patch };
  assert(validateLines(next.lines, config));
  if (next.dueDate < next.date) throw new Error("L'échéance précède la date de facture.");
  return next;
}

export function deleteInvoice(invoices: Invoice[], id: string): Invoice[] {
  const invoice = invoices.find((item) => item.id === id);
  if (invoice && invoice.status !== "draft") throw new Error("Seule une facture brouillon est supprimable.");
  return invoices.filter((item) => item.id !== id);
}

export const paidAmount = (invoice: Invoice) => invoice.payments.reduce((total, payment) => total + payment.amount, 0);
export const invoiceBalance = (invoice: Invoice, config: FinanceConfig) => documentTotals(invoice.lines, config).total - paidAmount(invoice);
export const isOverdue = (invoice: Invoice, asOf: string) => (invoice.status === "issued" || invoice.status === "partially_paid") && invoice.dueDate < asOf;

/** Émission : numérote, comptabilise (411 / 7xx / TVA) et verrouille la facture. */
export function issueInvoice(invoice: Invoice, customer: Customer, invoices: Invoice[], entries: JournalEntry[], config: FinanceConfig, entryId: string): { invoice: Invoice; entry: JournalEntry } {
  if (invoice.status !== "draft") throw new Error("Facture déjà émise.");
  assert(validateLines(invoice.lines, config));
  const number = nextDocNumber("FAC", invoice.date, invoices.map((item) => item.number));
  const draft = buildSalesInvoice(config, { id: entryId, date: invoice.date, dueDate: invoice.dueDate, customerId: customer.code, reference: number, lines: invoice.lines.map((line) => ({ label: line.label, amountHT: lineNet(line), taxCode: line.taxCode, account: line.account, costCenter: line.costCenter })) });
  const entry = postEntry(entries, draft, config);
  return { invoice: { ...invoice, number, status: "issued", entryId }, entry };
}

export function recordPayment(invoice: Invoice, customer: Customer, entries: JournalEntry[], config: FinanceConfig, input: { id: string; entryId: string; date: string; amount: Cents }): { invoice: Invoice; entry: JournalEntry } {
  if (invoice.status !== "issued" && invoice.status !== "partially_paid") throw new Error("Règlement impossible sur cette facture.");
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new Error("Montant de règlement invalide.");
  const balance = invoiceBalance(invoice, config);
  if (input.amount > balance) throw new Error("Le règlement dépasse le solde de la facture.");
  const entry = postEntry(entries, buildPayment({ id: input.entryId, date: input.date, kind: "customer", partnerId: customer.code, amount: input.amount, reference: invoice.number ?? invoice.id }), config);
  const payments = [...invoice.payments, { id: input.id, date: input.date, amount: input.amount, entryId: input.entryId }];
  return { invoice: { ...invoice, payments, status: input.amount === balance ? "paid" : "partially_paid" }, entry };
}

/** Annulation d'une facture non réglée : extourne de l'écriture comptable (le numéro reste consommé). */
export function cancelInvoice(invoice: Invoice, entries: JournalEntry[], config: FinanceConfig, date: string, reversalId: string): { invoice: Invoice; original: JournalEntry; reversal: JournalEntry } {
  if (invoice.status !== "issued") throw new Error("Seule une facture émise et non réglée peut être annulée.");
  const entry = entries.find((item) => item.id === invoice.entryId);
  if (!entry) throw new Error("Pièce comptable introuvable.");
  const { reversal, original } = reverseEntry(entries, entry, date, config, reversalId);
  return { invoice: { ...invoice, status: "cancelled" }, original, reversal };
}

/** Piste documentaire : devis → facture → écriture comptable → règlements. */
export function documentTrail(invoice: Invoice, quotes: Quote[], entries: JournalEntry[]) {
  const flow: { type: "quote" | "invoice" | "accounting" | "payment"; reference: string }[] = [];
  const quote = quotes.find((item) => item.id === invoice.quoteId);
  if (quote) flow.push({ type: "quote", reference: quote.number });
  flow.push({ type: "invoice", reference: invoice.number ?? "Brouillon" });
  const entry = entries.find((item) => item.id === invoice.entryId);
  if (entry?.number) flow.push({ type: "accounting", reference: entry.number });
  for (const payment of invoice.payments) {
    const paymentEntry = entries.find((item) => item.id === payment.entryId);
    flow.push({ type: "payment", reference: paymentEntry?.number ?? payment.id });
  }
  return flow;
}
