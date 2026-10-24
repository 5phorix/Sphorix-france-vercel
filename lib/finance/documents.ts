import type { Cents, FinanceConfig, JournalEntry } from "./types";

export type DocumentLine = { label: string; amountHT: Cents; taxCode: string; account: string; costCenter?: string };

const rate = (config: FinanceConfig, code: string) => {
  const vat = config.vatCodes.find((item) => item.code === code);
  if (!vat) throw new Error(`Code TVA inconnu : ${code}`);
  return vat;
};

/** Facture client : 411 au débit, produits (HT) et TVA collectée au crédit. */
export function buildSalesInvoice(config: FinanceConfig, input: { id: string; date: string; dueDate: string; customerId: string; reference: string; lines: DocumentLine[] }): JournalEntry {
  const lines: JournalEntry["lines"] = [];
  let total = 0;
  for (const line of input.lines) {
    const vat = rate(config, line.taxCode);
    const tax = Math.round((line.amountHT * vat.rateBp) / 10000);
    total += line.amountHT + tax;
    lines.push({ accountCode: line.account, debit: 0, credit: line.amountHT, label: line.label, taxCode: line.taxCode, costCenter: line.costCenter });
    if (tax) lines.push({ accountCode: vat.collectedAccount, debit: 0, credit: tax, label: `TVA ${line.label}`, costCenter: line.costCenter });
  }
  return { id: input.id, journal: "VT", date: input.date, reference: input.reference, label: `Facture ${input.reference}`, status: "draft", lines: [{ accountCode: "411000", debit: total, credit: 0, partnerId: input.customerId, dueDate: input.dueDate, label: `Facture ${input.reference}` }, ...lines] };
}

/** Facture fournisseur : charges (HT) et TVA déductible au débit, 401 au crédit. */
export function buildPurchaseInvoice(config: FinanceConfig, input: { id: string; date: string; dueDate: string; supplierId: string; reference: string; lines: DocumentLine[] }): JournalEntry {
  const lines: JournalEntry["lines"] = [];
  let total = 0;
  for (const line of input.lines) {
    const vat = rate(config, line.taxCode);
    const tax = Math.round((line.amountHT * vat.rateBp) / 10000);
    total += line.amountHT + tax;
    lines.push({ accountCode: line.account, debit: line.amountHT, credit: 0, label: line.label, taxCode: line.taxCode, costCenter: line.costCenter });
    if (tax) lines.push({ accountCode: vat.deductibleAccount, debit: tax, credit: 0, label: `TVA ${line.label}`, costCenter: line.costCenter });
  }
  return { id: input.id, journal: "AC", date: input.date, reference: input.reference, label: `Facture fournisseur ${input.reference}`, status: "draft", lines: [...lines, { accountCode: "401000", debit: 0, credit: total, partnerId: input.supplierId, dueDate: input.dueDate, label: `Facture ${input.reference}` }] };
}

/** Règlement : encaissement client (kind = "customer") ou paiement fournisseur (kind = "supplier"). */
export function buildPayment(input: { id: string; date: string; kind: "customer" | "supplier"; partnerId: string; amount: Cents; reference: string }): JournalEntry {
  const customer = input.kind === "customer";
  return {
    id: input.id,
    journal: "BQ",
    date: input.date,
    reference: input.reference,
    label: customer ? `Encaissement ${input.reference}` : `Paiement ${input.reference}`,
    status: "draft",
    lines: [
      { accountCode: "512000", debit: customer ? input.amount : 0, credit: customer ? 0 : input.amount, label: input.reference },
      { accountCode: customer ? "411000" : "401000", debit: customer ? 0 : input.amount, credit: customer ? input.amount : 0, partnerId: input.partnerId, label: input.reference },
    ],
  };
}
