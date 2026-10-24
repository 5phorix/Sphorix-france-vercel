"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Check, FilePlus2, Pencil, Plus, Receipt, Send, Trash2, Users, X } from "lucide-react";

import { enregistrerVentes, loadFinance, chargerVentes } from "@/lib/finance/db";
import { autoMatch } from "@/lib/finance/echeancier-gestion";
import type { FinanceConfig, JournalEntry } from "@/lib/finance/types";
import { formatDate, formatMoney, todayISO } from "@/lib/suite/format";
import {
  addDays, cancelInvoice, convertQuoteToInvoice, createInvoice, createQuote, deleteInvoice, deleteQuote, documentTrail, documentTotals, expireQuotes,
  invoiceBalance, isOverdue, issueInvoice, recordPayment, removeCustomer, saveCustomer, transitionQuote, updateInvoice, updateQuote,
  type Customer, type Invoice, type Quote, type SalesLine,
} from "@/lib/ventes/ventes";

import { Badge, Button, Card, DecimalInput, EmptyState, Field, PageHeader, Tabs, TextInput, type Tone } from "@/components/suite/ui";

type Tab = "invoices" | "quotes" | "customers";
type Draft = { kind: "quote" | "invoice"; id?: string; customerId: string; date: string; secondDate: string; notes: string; lines: SalesLine[] };

const uid = () => crypto.randomUUID();
const statusLabel: Record<string, string> = { draft: "Brouillon", sent: "Envoyé", accepted: "Accepté", rejected: "Refusé", expired: "Expiré", invoiced: "Facturé", issued: "Émise", partially_paid: "Partiellement payée", paid: "Payée", cancelled: "Annulée" };
const statusTone: Record<string, Tone> = { draft: "neutral", sent: "info", accepted: "ok", rejected: "danger", expired: "warn", invoiced: "ok", issued: "info", partially_paid: "warn", paid: "ok", cancelled: "danger" };
const emptyLine = (config: FinanceConfig): SalesLine => ({ id: uid(), label: "", quantity: 1, unitPrice: 0, discountBp: 0, taxCode: config.vatCodes[0]?.code ?? "", account: config.accounts.find((a) => a.type === "revenue" && a.active)?.code ?? "", costCenter: config.costCenters.find((c) => c.active)?.code });
const emptyCustomer = (): Customer => ({ id: uid(), code: "", name: "", email: "", address: "", vatNumber: "", paymentTermsDays: 30, active: true });

export default function VentesApp({ initialTab = "invoices" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [config, setConfig] = useState<FinanceConfig | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [customerForm, setCustomerForm] = useState<Customer | null>(null);
  const [paying, setPaying] = useState<{ id: string; amount: number } | null>(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    const [finance, ventes] = await Promise.all([loadFinance(), chargerVentes()]);
    setConfig(finance.config);
    setEntries(finance.entries);
    setCustomers(ventes.customers.sort((a, b) => a.code.localeCompare(b.code)));
    setQuotes(ventes.quotes.sort((a, b) => b.number.localeCompare(a.number)));
    setInvoices(ventes.invoices.sort((a, b) => (b.number ?? "~").localeCompare(a.number ?? "~") || b.date.localeCompare(a.date)));
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial depuis IndexedDB
    void refresh();
  }, [refresh]);

  const byId = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  if (!config) {
    return <p className="sd-muted" role="status">Chargement des données…</p>;
  }

  const today = todayISO();
  const run = async (action: () => Promise<void>, success?: string) => {
    try {
      await action();
      setMessage("");
      setNotice(success ?? "");
      await refresh();
    } catch (error) {
      setNotice("");
      setMessage(error instanceof Error ? error.message : "Opération impossible.");
    }
  };
  const confirmThen = (question: string, action: () => void) => { if (window.confirm(question)) action(); };
  const customerOf = (id: string) => {
    const customer = byId.get(id);
    if (!customer) throw new Error("Client introuvable.");
    return customer;
  };
  const customerName = (id: string) => byId.get(id)?.name ?? "—";

  const openDraft = (kind: Draft["kind"], source?: Quote | Invoice) => {
    setTab(kind === "quote" ? "quotes" : "invoices");
    setDraft({
      kind,
      id: source?.id,
      customerId: source?.customerId ?? customers.find((c) => c.active)?.id ?? "",
      date: source?.date ?? today,
      secondDate: source ? ("validUntil" in source ? source.validUntil : source.dueDate) : kind === "quote" ? addDays(today, 30) : "",
      notes: source?.notes ?? "",
      lines: source ? source.lines.map((line) => ({ ...line })) : [emptyLine(config)],
    });
  };

  const submitDraft = (values: Draft) =>
    run(async () => {
      const customer = customerOf(values.customerId);
      if (values.kind === "quote") {
        const existing = quotes.find((q) => q.id === values.id);
        const quote = existing ? updateQuote(existing, { customerId: customer.id, date: values.date, validUntil: values.secondDate, lines: values.lines, notes: values.notes }, config) : createQuote(quotes, { id: uid(), customer, date: values.date, validUntil: values.secondDate, lines: values.lines, notes: values.notes }, config);
        await enregistrerVentes({ quotes: { put: [quote] } });
      } else {
        const existing = invoices.find((i) => i.id === values.id);
        const invoice = existing ? updateInvoice(existing, { date: values.date, dueDate: values.secondDate || addDays(values.date, customer.paymentTermsDays), lines: values.lines, notes: values.notes }, config) : { ...createInvoice({ id: uid(), customer, date: values.date, lines: values.lines, notes: values.notes }, config), ...(values.secondDate ? { dueDate: values.secondDate } : {}) };
        await enregistrerVentes({ invoices: { put: [invoice] } });
      }
      setDraft(null);
    }, "Brouillon enregistré.");

  const issue = (invoice: Invoice) => run(async () => {
    const result = issueInvoice(invoice, customerOf(invoice.customerId), invoices, entries, config, uid());
    await enregistrerVentes({ invoices: { put: [result.invoice] }, entries: [result.entry] });
  }, "Facture émise et comptabilisée.");
  const pay = (invoice: Invoice, amount: number) => run(async () => {
    const result = recordPayment(invoice, customerOf(invoice.customerId), entries, config, { id: uid(), entryId: uid(), date: today, amount });
    await enregistrerVentes({ invoices: { put: [result.invoice] }, entries: autoMatch([...entries, result.entry], config) });
    setPaying(null);
  }, "Règlement enregistré.");
  const cancel = (invoice: Invoice) => run(async () => {
    const result = cancelInvoice(invoice, entries, config, today, uid());
    await enregistrerVentes({ invoices: { put: [result.invoice] }, entries: [result.original, result.reversal] });
  }, "Facture annulée par extourne.");
  const quoteAction = (quote: Quote, to: Quote["status"]) => run(() => enregistrerVentes({ quotes: { put: [transitionQuote(quote, to)] } }));
  const invoiceQuote = (quote: Quote) => run(async () => {
    const result = convertQuoteToInvoice(quote, customerOf(quote.customerId), uid(), today);
    await enregistrerVentes({ quotes: { put: [result.quote] }, invoices: { put: [result.invoice] } });
    setTab("invoices");
  }, "Devis transformé en facture brouillon.");
  const expire = () => run(() => enregistrerVentes({ quotes: { put: expireQuotes(quotes, today) } }));

  const needle = search.trim().toLowerCase();
  const shownInvoices = invoices.filter((i) => !needle || `${i.number ?? ""} ${customerName(i.customerId)}`.toLowerCase().includes(needle));
  const shownQuotes = quotes.filter((q) => !needle || `${q.number} ${customerName(q.customerId)}`.toLowerCase().includes(needle));
  const shownCustomers = customers.filter((c) => !needle || `${c.code} ${c.name} ${c.email}`.toLowerCase().includes(needle));

  const tabs: { id: Tab; label: string }[] = [
    { id: "invoices", label: `Factures (${invoices.length})` },
    { id: "quotes", label: `Devis (${quotes.length})` },
    { id: "customers", label: `Clients (${customers.length})` },
  ];
  const searchBox = <TextInput type="search" placeholder="Rechercher…" aria-label="Rechercher" value={search} onChange={(e) => setSearch(e.target.value)} />;
  const noCustomer = customers.length === 0;

  return (
    <main className="space-y-6">
      <PageHeader
        icon="ventes"
        eyebrow="Commerce · relié aux Comptes"
        title="Commerce"
        description="Clients, devis et factures. Chaque facture émise est comptabilisée automatiquement, et chaque règlement est lettré."
        actions={
          <>
            <Button icon={FilePlus2} onClick={() => openDraft("quote")} disabled={noCustomer}>Nouveau devis</Button>
            <Button variant="primary" icon={Receipt} onClick={() => openDraft("invoice")} disabled={noCustomer}>Nouvelle facture</Button>
          </>
        }
      />
      <Tabs tabs={tabs} value={tab} onChange={(id) => { setTab(id); setDraft(null); setSearch(""); }} label="Sections du commerce" />
      {message && <p role="alert" className="rounded-xl border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]">{message}</p>}
      {notice && !message && <p role="status" className="rounded-xl border border-[var(--sd-ok)] bg-[var(--sd-ok-soft)] p-3 text-sm text-[var(--sd-ok)]">{notice}</p>}
      {noCustomer && !customerForm && <p className="rounded-xl border border-[var(--sd-warn)] bg-[var(--sd-warn-soft)] p-3 text-sm text-[var(--sd-warn)]">Créez d&apos;abord un client pour pouvoir établir un devis ou une facture.</p>}

      {draft && <DocEditor key={draft.id ?? "new"} initial={draft} config={config} customers={customers.filter((c) => c.active || c.id === draft.customerId)} onCancel={() => setDraft(null)} onSubmit={submitDraft} />}

      {tab === "invoices" && !draft && (
        <Card title="Factures" flush actions={searchBox}>
          {shownInvoices.length === 0 ? (
            <EmptyState icon="ventes" title={invoices.length === 0 ? "Aucune facture" : "Aucun résultat"} text={invoices.length === 0 ? "Créez une facture ou transformez un devis accepté." : "Modifiez votre recherche."} />
          ) : (
            <div className="sd-table-wrap">
              <table className="sd-table">
                <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Échéance</th><th className="sd-num">Total TTC</th><th className="sd-num">Reste dû</th><th>Statut</th><th>Pièces liées</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {shownInvoices.map((invoice) => {
                    const live = invoice.status !== "draft" && invoice.status !== "cancelled";
                    const late = isOverdue(invoice, today);
                    return (
                      <tr key={invoice.id}>
                        <td>{invoice.number ?? "—"}</td>
                        <td>{customerName(invoice.customerId)}</td>
                        <td>{formatDate(invoice.date)}</td>
                        <td style={late ? { color: "var(--sd-danger)", fontWeight: 600 } : undefined}>{formatDate(invoice.dueDate)}</td>
                        <td className="sd-num">{formatMoney(documentTotals(invoice.lines, config).total)}</td>
                        <td className="sd-num">{live ? formatMoney(invoiceBalance(invoice, config)) : "—"}</td>
                        <td><Badge tone={statusTone[invoice.status]}>{statusLabel[invoice.status]}</Badge> {late && <Badge tone="danger">En retard</Badge>}</td>
                        <td className="sd-muted text-xs">{documentTrail(invoice, quotes, entries).map((s) => s.reference).join(" → ")}</td>
                        <td>
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            {invoice.status === "draft" && (
                              <>
                                <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openDraft("invoice", invoice)}>Modifier</Button>
                                <Button size="sm" variant="primary" icon={Send} onClick={() => confirmThen("Émettre la facture ? Elle sera numérotée, comptabilisée et ne pourra plus être modifiée.", () => issue(invoice))}>Émettre</Button>
                                <Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label="Supprimer le brouillon" onClick={() => confirmThen("Supprimer ce brouillon ?", () => void run(() => enregistrerVentes({ invoices: { delete: [deleteInvoice(invoices, invoice.id) && invoice.id] } })))} />
                              </>
                            )}
                            {(invoice.status === "issued" || invoice.status === "partially_paid") &&
                              (paying?.id === invoice.id ? (
                                <span className="inline-flex items-center gap-1">
                                  <span className="w-28"><DecimalInput value={paying.amount} onChange={(amount) => setPaying({ id: invoice.id, amount })} aria-label="Montant du règlement" suffix="€" /></span>
                                  <Button size="sm" variant="primary" iconOnly icon={Check} aria-label="Valider le règlement" disabled={paying.amount <= 0} onClick={() => pay(invoice, paying.amount)} />
                                  <Button size="sm" iconOnly icon={X} aria-label="Fermer" onClick={() => setPaying(null)} />
                                </span>
                              ) : (
                                <Button size="sm" onClick={() => setPaying({ id: invoice.id, amount: invoiceBalance(invoice, config) })}>Encaisser</Button>
                              ))}
                            {invoice.status === "issued" && <Button size="sm" variant="ghost" icon={Ban} onClick={() => confirmThen("Annuler cette facture ? Une écriture d'extourne sera comptabilisée.", () => cancel(invoice))}>Annuler</Button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "quotes" && !draft && (
        <Card title="Devis" flush actions={<>{searchBox}<Button size="sm" onClick={expire}>Marquer les devis expirés</Button></>}>
          {shownQuotes.length === 0 ? (
            <EmptyState icon="ventes" title={quotes.length === 0 ? "Aucun devis" : "Aucun résultat"} text={quotes.length === 0 ? "Un devis accepté peut être transformé en facture en un clic." : "Modifiez votre recherche."} />
          ) : (
            <div className="sd-table-wrap">
              <table className="sd-table">
                <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Valable jusqu&apos;au</th><th className="sd-num">Total TTC</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {shownQuotes.map((quote) => (
                    <tr key={quote.id}>
                      <td>{quote.number}</td>
                      <td>{customerName(quote.customerId)}</td>
                      <td>{formatDate(quote.date)}</td>
                      <td>{formatDate(quote.validUntil)}</td>
                      <td className="sd-num">{formatMoney(documentTotals(quote.lines, config).total)}</td>
                      <td><Badge tone={statusTone[quote.status]}>{statusLabel[quote.status]}</Badge></td>
                      <td>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {quote.status === "draft" && (
                            <>
                              <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openDraft("quote", quote)}>Modifier</Button>
                              <Button size="sm" variant="primary" icon={Send} onClick={() => quoteAction(quote, "sent")}>Envoyer</Button>
                              <Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label="Supprimer le devis" onClick={() => confirmThen("Supprimer ce devis ?", () => void run(() => enregistrerVentes({ quotes: { delete: [deleteQuote(quotes, quote.id) && quote.id] } })))} />
                            </>
                          )}
                          {quote.status === "sent" && (
                            <>
                              <Button size="sm" onClick={() => quoteAction(quote, "accepted")}>Accepté</Button>
                              <Button size="sm" variant="ghost" onClick={() => quoteAction(quote, "rejected")}>Refusé</Button>
                            </>
                          )}
                          {quote.status === "accepted" && <Button size="sm" variant="primary" onClick={() => invoiceQuote(quote)}>Transformer en facture</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "customers" && (
        <>
          {customerForm && (
            <Card title={customers.some((c) => c.id === customerForm.id) ? "Modifier le client" : "Nouveau client"}>
              <form
                className="grid gap-3 md:grid-cols-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    await enregistrerVentes({ customers: { put: saveCustomer(customers, customerForm).filter((c) => c.id === customerForm.id) } });
                    setCustomerForm(null);
                  }, "Client enregistré.");
                }}
              >
                <Field label="Code client"><TextInput required placeholder="CLI001" value={customerForm.code} onChange={(e) => setCustomerForm({ ...customerForm, code: e.target.value.toUpperCase() })} /></Field>
                <Field label="Raison sociale"><TextInput required value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} /></Field>
                <Field label="E-mail"><TextInput type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} /></Field>
                <Field label="Adresse"><TextInput value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} /></Field>
                <Field label="N° de TVA intracommunautaire"><TextInput value={customerForm.vatNumber} onChange={(e) => setCustomerForm({ ...customerForm, vatNumber: e.target.value })} /></Field>
                <Field label="Délai de paiement (jours)"><TextInput type="number" min={0} value={customerForm.paymentTermsDays} onChange={(e) => setCustomerForm({ ...customerForm, paymentTermsDays: Number(e.target.value) })} /></Field>
                <div className="flex gap-2 md:col-span-3">
                  <Button type="submit" variant="primary">Enregistrer</Button>
                  <Button onClick={() => setCustomerForm(null)}>Annuler</Button>
                </div>
              </form>
            </Card>
          )}
          <Card title="Clients" flush actions={<>{searchBox}<Button size="sm" variant="primary" icon={Plus} onClick={() => setCustomerForm(emptyCustomer())}>Nouveau client</Button></>}>
            {shownCustomers.length === 0 ? (
              <EmptyState icon="clients" title={customers.length === 0 ? "Aucun client" : "Aucun résultat"} text={customers.length === 0 ? "Ajoutez votre premier client pour établir devis et factures." : "Modifiez votre recherche."} action={customers.length === 0 && <Button variant="primary" icon={Users} onClick={() => setCustomerForm(emptyCustomer())}>Ajouter un client</Button>} />
            ) : (
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead><tr><th>Code</th><th>Nom</th><th>E-mail</th><th>Paiement</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {shownCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.code}</td><td>{customer.name}</td><td>{customer.email}</td><td>{customer.paymentTermsDays} j</td>
                        <td><Badge tone={customer.active ? "ok" : "neutral"}>{customer.active ? "Actif" : "Archivé"}</Badge></td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setCustomerForm(customer)}>Modifier</Button>
                            <Button size="sm" variant="ghost" onClick={() => run(() => enregistrerVentes({ customers: { put: [{ ...customer, active: !customer.active }] } }))}>{customer.active ? "Archiver" : "Réactiver"}</Button>
                            <Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label="Supprimer le client" onClick={() => confirmThen("Supprimer ce client ?", () => void run(() => enregistrerVentes({ customers: { delete: [removeCustomer(customers, customer.id, quotes, invoices) && customer.id] } })))} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </main>
  );
}

function DocEditor({ initial, config, customers, onSubmit, onCancel }: { initial: Draft; config: FinanceConfig; customers: Customer[]; onSubmit: (draft: Draft) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(initial);
  const isQuote = draft.kind === "quote";
  const totals = (() => { try { return documentTotals(draft.lines, config); } catch { return { net: 0, tax: 0, total: 0 }; } })();
  const patchLine = (id: string, patch: Partial<SalesLine>) => setDraft({ ...draft, lines: draft.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)) });
  const revenue = config.accounts.filter((a) => a.type === "revenue" && a.active);

  return (
    <Card title={`${draft.id ? "Modifier" : "Nouveau"} ${isQuote ? "devis" : "facture"} (brouillon)`}>
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onSubmit(draft); }}>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Client">
            <select className="sd-input" required value={draft.customerId} disabled={!isQuote && !!draft.id} onChange={(e) => setDraft({ ...draft, customerId: e.target.value })}>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name}</option>)}
            </select>
          </Field>
          <Field label="Date"><TextInput type="date" required value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
          <Field label={isQuote ? "Valable jusqu'au" : "Échéance"} hint={isQuote ? undefined : "Vide : selon le délai du client"}><TextInput type="date" required={isQuote} value={draft.secondDate} onChange={(e) => setDraft({ ...draft, secondDate: e.target.value })} /></Field>
          <Field label="Notes"><TextInput value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></Field>
        </div>

        <div className="sd-table-wrap">
          <table className="sd-table">
            <thead><tr><th>Désignation</th><th>Qté</th><th>Prix unitaire HT</th><th>Remise</th><th>TVA</th><th>Compte de produit</th><th>Centre</th><th><span className="sr-only">Supprimer</span></th></tr></thead>
            <tbody>
              {draft.lines.map((line) => (
                <tr key={line.id}>
                  <td className="min-w-48"><TextInput required aria-label="Désignation" value={line.label} onChange={(e) => patchLine(line.id, { label: e.target.value })} /></td>
                  <td className="w-24"><TextInput type="number" min="0" step="any" aria-label="Quantité" value={line.quantity} onChange={(e) => patchLine(line.id, { quantity: Number(e.target.value) })} /></td>
                  <td className="w-32"><DecimalInput aria-label="Prix unitaire HT" value={line.unitPrice} onChange={(unitPrice) => patchLine(line.id, { unitPrice })} suffix="€" /></td>
                  <td className="w-24"><DecimalInput aria-label="Remise en pourcentage" value={line.discountBp} onChange={(discountBp) => patchLine(line.id, { discountBp: Math.min(discountBp, 10000) })} suffix="%" trim /></td>
                  <td><select className="sd-input" aria-label="Taux de TVA" value={line.taxCode} onChange={(e) => patchLine(line.id, { taxCode: e.target.value })}>{config.vatCodes.map((v) => <option key={v.code} value={v.code}>{v.label}</option>)}</select></td>
                  <td><select className="sd-input" aria-label="Compte de produit" value={line.account} onChange={(e) => patchLine(line.id, { account: e.target.value })}>{revenue.map((a) => <option key={a.code} value={a.code}>{a.code} {a.label}</option>)}</select></td>
                  <td><select className="sd-input" aria-label="Centre de coûts" value={line.costCenter ?? ""} onChange={(e) => patchLine(line.id, { costCenter: e.target.value || undefined })}><option value="">Sans centre</option>{config.costCenters.filter((c) => c.active).map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}</select></td>
                  <td><Button variant="ghost" size="sm" iconOnly icon={Trash2} aria-label="Supprimer la ligne" disabled={draft.lines.length === 1} onClick={() => setDraft({ ...draft, lines: draft.lines.filter((l) => l.id !== line.id) })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setDraft({ ...draft, lines: [...draft.lines, emptyLine(config)] })}>Ajouter une ligne</Button>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--sd-border)] pt-4">
          <p className="sd-num text-sm" style={{ textAlign: "left" }}>HT {formatMoney(totals.net)} · TVA {formatMoney(totals.tax)} · <strong>TTC {formatMoney(totals.total)}</strong></p>
          <div className="flex gap-2"><Button type="submit" variant="primary">Enregistrer le brouillon</Button><Button onClick={onCancel}>Annuler</Button></div>
        </div>
      </form>
    </Card>
  );
}
