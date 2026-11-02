"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Archive, Ban, Check, FilePlus2, PackagePlus, Pencil, Plus, Receipt, Send, Trash2, Users, X } from "lucide-react";

import { enregistrerVentes, loadFinance, chargerVentes } from "@/lib/finance/db";
import { autoMatch } from "@/lib/finance/echeancier-gestion";
import type { FinanceConfig, JournalEntry } from "@/lib/finance/types";
import { formatDate, formatMoney, parseDecimal, todayISO } from "@/lib/suite/format";
import {
  addDays, cancelInvoice, convertQuoteToInvoice, createInvoice, createQuote, deleteInvoice, deleteQuote, documentTrail, documentTotals, expireQuotes,
  invoiceBalance, isOverdue, issueInvoice, recordPayment, removeCustomer, saveCustomer, saveProduct, transitionQuote, updateInvoice, updateQuote,
  type Customer, type Invoice, type Quote, type QuoteStatus, type SalesLine, type SalesProduct,
} from "@/lib/ventes/ventes";

import { Badge, Button, Card, DecimalInput, EmptyState, Field, Kpi, PageHeader, Tabs, TextInput, type Tone } from "@/components/suite/ui";

type Tab = "invoices" | "quotes" | "customers" | "catalog";
type Draft = { kind: "quote" | "invoice"; id?: string; customerId: string; date: string; secondDate: string; notes: string; lines: SalesLine[] };

const uid = () => crypto.randomUUID();
const statusLabel: Record<string, string> = { draft: "Brouillon", sent: "Envoyé", accepted: "Accepté", rejected: "Refusé", expired: "Expiré", invoiced: "Facturé", issued: "Émise", partially_paid: "Partiellement payée", paid: "Payée", cancelled: "Annulée" };
const statusTone: Record<string, Tone> = { draft: "neutral", sent: "info", accepted: "ok", rejected: "danger", expired: "warn", invoiced: "ok", issued: "info", partially_paid: "warn", paid: "ok", cancelled: "danger" };
const emptyLine = (config: FinanceConfig): SalesLine => ({ id: uid(), label: "", quantity: 1, unitPrice: 0, discountBp: 0, taxCode: config.vatCodes[0]?.code ?? "", account: config.accounts.find((a) => a.type === "revenue" && a.active)?.code ?? "", costCenter: config.costCenters.find((c) => c.active)?.code });
const emptyCustomer = (): Customer => ({ id: uid(), code: "", name: "", email: "", address: "", vatNumber: "", paymentTermsDays: 30, active: true, contacts: [] });
const emptyProduct = (config: FinanceConfig): SalesProduct => ({ id: uid(), code: "", label: "", unit: "unité", unitPrice: 0, taxCode: config.vatCodes[0]?.code ?? "", account: config.accounts.find((a) => a.type === "revenue" && a.active)?.code ?? "", active: true });

export default function VentesApp({ initialTab = "invoices" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [config, setConfig] = useState<FinanceConfig | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<SalesProduct[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [customerForm, setCustomerForm] = useState<Customer | null>(null);
  const [productForm, setProductForm] = useState<SalesProduct | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [paying, setPaying] = useState<{ id: string; amount: number } | null>(null);
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "draft" | "issued" | "partially_paid" | "paid" | "late">("all");
  const [quoteFilter, setQuoteFilter] = useState<"all" | QuoteStatus>("all");
  const [customerFilter, setCustomerFilter] = useState<"active" | "archived" | "all">("active");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [finance, ventes] = await Promise.all([loadFinance(), chargerVentes()]);
      setConfig(finance.config);
      setEntries(finance.entries);
      setCustomers(ventes.customers.sort((a, b) => a.code.localeCompare(b.code)));
      setQuotes(ventes.quotes.sort((a, b) => b.number.localeCompare(a.number)));
      setInvoices(ventes.invoices.sort((a, b) => (b.number ?? "~").localeCompare(a.number ?? "~") || b.date.localeCompare(a.date)));
      setProducts(ventes.products.sort((a, b) => a.code.localeCompare(b.code)));
      setLoadError("");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Erreur inconnue.";
      setLoadError(`Impossible de charger les données des ventes : ${detail}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial depuis IndexedDB
    void refresh().catch(() => undefined);
  }, [refresh]);

  const byId = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  if (!config) {
    return <main className="space-y-3"><p className={loadError ? "text-[var(--sd-danger)]" : "sd-muted"} role={loadError ? "alert" : "status"}>{loadError || (loading ? "Chargement des données des ventes…" : "Initialisation des ventes…")}</p>{loadError && <Button onClick={() => void refresh().catch(() => undefined)}>Réessayer</Button>}</main>;
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

  const openDraft = (kind: Draft["kind"], source?: Quote | Invoice, duplicate = false) => {
    setTab(kind === "quote" ? "quotes" : "invoices");
    setDraft({
      kind,
      id: duplicate ? undefined : source?.id,
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
  const shownInvoices = invoices.filter((i) => {
    const matchesSearch = !needle || `${i.number ?? ""} ${customerName(i.customerId)}`.toLowerCase().includes(needle);
    const matchesStatus = invoiceFilter === "all" || (invoiceFilter === "late" ? isOverdue(i, today) : i.status === invoiceFilter);
    return matchesSearch && matchesStatus;
  });
  const shownQuotes = quotes.filter((q) => (quoteFilter === "all" || q.status === quoteFilter) && (!needle || `${q.number} ${customerName(q.customerId)}`.toLowerCase().includes(needle)));
  const shownCustomers = customers.filter((c) => (customerFilter === "all" || (customerFilter === "active" ? c.active : !c.active)) && (!needle || `${c.code} ${c.name} ${c.email} ${c.contactName ?? ""} ${c.city ?? ""}`.toLowerCase().includes(needle)));
  const shownProducts = products.filter((product) => !needle || `${product.code} ${product.label}`.toLowerCase().includes(needle));
  const pageSize = 10;
  const pages = Math.max(1, Math.ceil((tab === "invoices" ? shownInvoices.length : tab === "quotes" ? shownQuotes.length : tab === "customers" ? shownCustomers.length : shownProducts.length) / pageSize));
  const first = (page - 1) * pageSize;
  const pageInvoices = shownInvoices.slice(first, first + pageSize);
  const pageQuotes = shownQuotes.slice(first, first + pageSize);
  const pageCustomers = shownCustomers.slice(first, first + pageSize);
  const pageProducts = shownProducts.slice(first, first + pageSize);
  const outstandingInvoices = invoices.filter((invoice) => invoice.status === "issued" || invoice.status === "partially_paid");
  const overdueInvoices = outstandingInvoices.filter((invoice) => isOverdue(invoice, today));
  const invoiceTotal = (invoice: Invoice) => documentTotals(invoice.lines, config).total;

  const tabs: { id: Tab; label: string }[] = [
    { id: "invoices", label: `Factures · ${invoices.length}` },
    { id: "quotes", label: `Devis · ${quotes.length}` },
    { id: "customers", label: `Clients · ${customers.length}` },
    { id: "catalog", label: `Articles · ${products.length}` },
  ];
  const searchBox = <TextInput type="search" placeholder="Rechercher…" aria-label="Rechercher" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />;
  const noCustomer = customers.length === 0;

  return (
    <main className="sd-sales space-y-6">
      <PageHeader
        icon="ventes"
        eyebrow="Module 1 · Ventes"
        title="Ventes"
        description="Suivez le cycle commercial, du client et du devis jusqu'à la facture et son encaissement."
        actions={
          <>
            <Button icon={Users} onClick={() => { setTab("customers"); setCustomerForm(emptyCustomer()); }} aria-label="Créer un client">Nouveau client</Button>
            <Button icon={FilePlus2} onClick={() => openDraft("quote")} disabled={noCustomer}>Nouveau devis</Button>
            <Button variant="primary" icon={Receipt} onClick={() => openDraft("invoice")} disabled={noCustomer}>Nouvelle facture</Button>
          </>
        }
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs des ventes">
        <Kpi icon="ventes" label="Total facturé" value={formatMoney(invoices.filter((invoice) => invoice.status !== "draft" && invoice.status !== "cancelled").reduce((sum, invoice) => sum + invoiceTotal(invoice), 0))} hint={`${invoices.filter((invoice) => invoice.status !== "draft" && invoice.status !== "cancelled").length} facture(s) émise(s)`} />
        <Kpi icon="clients" label="Reste à encaisser" value={formatMoney(outstandingInvoices.reduce((sum, invoice) => sum + invoiceBalance(invoice, config), 0))} hint={`${outstandingInvoices.length} facture(s) ouverte(s)`} tone={outstandingInvoices.length ? "warn" : "ok"} />
        <Kpi icon="fiscalite" label="Factures en retard" value={formatMoney(overdueInvoices.reduce((sum, invoice) => sum + invoiceBalance(invoice, config), 0))} hint={`${overdueInvoices.length} facture(s) échue(s)`} tone={overdueInvoices.length ? "danger" : "ok"} />
        <Kpi icon="clients" label="Devis à suivre" value={String(quotes.filter((quote) => quote.status === "sent" || quote.status === "accepted").length)} hint={`${customers.filter((customer) => customer.active).length} client(s) actif(s)`} />
      </section>
      <Tabs tabs={tabs} value={tab} onChange={(id) => { setTab(id); setDraft(null); setSearch(""); setPage(1); }} label="Sections des ventes" />
      {message && <p role="alert" className="rounded-xl border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]">{message}</p>}
      {notice && !message && <p role="status" className="rounded-xl border border-[var(--sd-ok)] bg-[var(--sd-ok-soft)] p-3 text-sm text-[var(--sd-ok)]">{notice}</p>}
      {noCustomer && !customerForm && <p className="rounded-xl border border-[var(--sd-warn)] bg-[var(--sd-warn-soft)] p-3 text-sm text-[var(--sd-warn)]">Créez d&apos;abord un client pour pouvoir établir un devis ou une facture.</p>}

      {draft && <SalesDialog title={`${draft.id ? "Modifier" : "Nouveau"} ${draft.kind === "quote" ? "devis" : "facture"} · brouillon`} wide onClose={() => setDraft(null)}>
        <DocEditor key={draft.id ?? "new"} initial={draft} config={config} customers={customers.filter((c) => c.active || c.id === draft.customerId)} products={products.filter((product) => product.active)} onCancel={() => setDraft(null)} onSubmit={submitDraft} />
      </SalesDialog>}

      {tab === "invoices" && !draft && (
        <Card title="Factures clients" flush actions={<><Field label="Statut"><select className="sd-input" value={invoiceFilter} onChange={(event) => { setInvoiceFilter(event.target.value as typeof invoiceFilter); setPage(1); }}><option value="all">Tous les statuts</option><option value="draft">Brouillon</option><option value="issued">À encaisser</option><option value="partially_paid">Partiellement payée</option><option value="paid">Payée</option><option value="late">En retard</option></select></Field>{searchBox}</>}>
          {shownInvoices.length === 0 ? (
            <EmptyState icon="ventes" title={invoices.length === 0 ? "Aucune facture" : "Aucun résultat"} text={invoices.length === 0 ? "Créez une facture ou transformez un devis accepté." : "Modifiez votre recherche."} />
          ) : (
            <div className="sd-table-wrap">
              <table className="sd-table">
                <thead><tr><th>N° pièce</th><th>Client</th><th>Date</th><th>Échéance</th><th className="sd-num">Total TTC</th><th className="sd-num">Reste dû</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {pageInvoices.map((invoice) => {
                    const live = invoice.status !== "draft" && invoice.status !== "cancelled";
                    const late = isOverdue(invoice, today);
                    return (
                      <tr key={invoice.id}>
                        <td><button type="button" className="font-semibold text-[var(--sd-brand)] hover:underline" onClick={() => setSelectedInvoice(invoice)}>{invoice.number ?? "Brouillon"}</button></td>
                        <td>{customerName(invoice.customerId)}</td>
                        <td>{formatDate(invoice.date)}</td>
                        <td style={late ? { color: "var(--sd-danger)", fontWeight: 600 } : undefined}>{formatDate(invoice.dueDate)}</td>
                        <td className="sd-num">{formatMoney(documentTotals(invoice.lines, config).total)}</td>
                        <td className="sd-num">{live ? formatMoney(invoiceBalance(invoice, config)) : "—"}</td>
                        <td><Badge tone={statusTone[invoice.status]}>{statusLabel[invoice.status]}</Badge> {late && <Badge tone="danger">En retard</Badge>}</td>
                        <td>
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(invoice)}>Consulter</Button>
                            {invoice.status === "draft" && (
                              <>
                                <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openDraft("invoice", invoice)}>Modifier</Button>
                                <Button size="sm" variant="primary" icon={Send} onClick={() => confirmThen("Émettre la facture ? Elle sera numérotée, comptabilisée et ne pourra plus être modifiée.", () => issue(invoice))}>Émettre</Button>
                                <Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label="Supprimer le brouillon" onClick={() => confirmThen("Supprimer ce brouillon ?", () => void run(() => enregistrerVentes({ invoices: { delete: [deleteInvoice(invoices, invoice.id) && invoice.id] } })))} />
                              </>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => openDraft("invoice", invoice, true)}>Dupliquer</Button>
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
          <TablePagination page={page} pages={pages} count={shownInvoices.length} pageSize={pageSize} onChange={setPage} />
        </Card>
      )}

      {tab === "quotes" && !draft && (
        <Card title="Devis" flush actions={<><Field label="Statut"><select className="sd-input" value={quoteFilter} onChange={(event) => { setQuoteFilter(event.target.value as typeof quoteFilter); setPage(1); }}><option value="all">Tous les statuts</option><option value="draft">Brouillon</option><option value="sent">Envoyé</option><option value="accepted">Accepté</option><option value="rejected">Refusé</option><option value="expired">Expiré</option><option value="invoiced">Facturé</option></select></Field>{searchBox}<Button size="sm" onClick={expire}>Mettre à jour les expirations</Button></>}>
          {shownQuotes.length === 0 ? (
            <EmptyState icon="ventes" title={quotes.length === 0 ? "Aucun devis" : "Aucun résultat"} text={quotes.length === 0 ? "Un devis accepté peut être transformé en facture en un clic." : "Modifiez votre recherche."} />
          ) : (
            <div className="sd-table-wrap">
              <table className="sd-table">
                <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Valable jusqu&apos;au</th><th className="sd-num">Total TTC</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {pageQuotes.map((quote) => (
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
                          <Button size="sm" variant="ghost" onClick={() => openDraft("quote", quote, true)}>Dupliquer</Button>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedQuote(quote)}>Consulter</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <TablePagination page={page} pages={pages} count={shownQuotes.length} pageSize={pageSize} onChange={setPage} />
        </Card>
      )}

      {tab === "customers" && (
        <>
          {customerForm && <CustomerDialog
            customer={customerForm}
            existing={customers.some((customer) => customer.id === customerForm.id)}
            onClose={() => setCustomerForm(null)}
            onSave={(customer) => void run(async () => {
              await enregistrerVentes({ customers: { put: saveCustomer(customers, customer).filter((item) => item.id === customer.id) } });
              setCustomerForm(null);
            }, "Fiche client enregistrée.")}
          />}
          {selectedCustomer && <CustomerDetails customer={selectedCustomer} invoices={invoices.filter((invoice) => invoice.customerId === selectedCustomer.id)} config={config} onClose={() => setSelectedCustomer(null)} onEdit={() => { setCustomerForm(selectedCustomer); setSelectedCustomer(null); }} />}
          <Card title="Fichier clients" flush actions={<><Field label="Afficher"><select className="sd-input" value={customerFilter} onChange={(event) => { setCustomerFilter(event.target.value as typeof customerFilter); setPage(1); }}><option value="active">Clients actifs</option><option value="archived">Clients archivés</option><option value="all">Tous</option></select></Field>{searchBox}<Button size="sm" variant="primary" icon={Plus} onClick={() => setCustomerForm(emptyCustomer())}>Nouveau client</Button></>}>
            {shownCustomers.length === 0 ? (
              <EmptyState icon="clients" title={customers.length === 0 ? "Aucun client" : "Aucun résultat"} text={customers.length === 0 ? "Ajoutez votre premier client pour établir devis et factures." : "Modifiez votre recherche."} action={customers.length === 0 && <Button variant="primary" icon={Users} onClick={() => setCustomerForm(emptyCustomer())}>Ajouter un client</Button>} />
            ) : (
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead><tr><th>Code tiers</th><th>Raison sociale</th><th>Contact</th><th>Ville</th><th className="sd-num">Encours</th><th className="sd-num">Plafond</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {pageCustomers.map((customer) => {
                      const balance = invoices.filter((invoice) => invoice.customerId === customer.id && ["issued", "partially_paid"].includes(invoice.status)).reduce((sum, invoice) => sum + invoiceBalance(invoice, config), 0);
                      return (
                      <tr key={customer.id}>
                        <td><button type="button" className="font-semibold text-[var(--sd-brand)] hover:underline" onClick={() => setSelectedCustomer(customer)}>{customer.code}</button></td>
                        <td><button type="button" className="text-left font-medium hover:underline" onClick={() => setSelectedCustomer(customer)}>{customer.name}</button></td>
                        <td>{customer.contactName || customer.email || "—"}</td>
                        <td>{customer.city || "—"}</td>
                        <td className="sd-num">{formatMoney(balance)}</td>
                        <td className="sd-num">{customer.creditLimit === undefined ? "—" : formatMoney(customer.creditLimit)}</td>
                        <td><Badge tone={customer.active ? "ok" : "neutral"}>{customer.active ? "Actif" : "Archivé"}</Badge></td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedCustomer(customer)}>Consulter</Button>
                            <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setCustomerForm(customer)}>Modifier</Button>
                            <Button size="sm" variant="ghost" icon={Archive} onClick={() => run(() => enregistrerVentes({ customers: { put: [{ ...customer, active: !customer.active }] } }))}>{customer.active ? "Archiver" : "Réactiver"}</Button>
                            <Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label="Supprimer le client" onClick={() => confirmThen("Supprimer ce client ?", () => void run(() => enregistrerVentes({ customers: { delete: [removeCustomer(customers, customer.id, quotes, invoices) && customer.id] } })))} />
                          </div>
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            )}
            <TablePagination page={page} pages={pages} count={shownCustomers.length} pageSize={pageSize} onChange={setPage} />
          </Card>
        </>
      )}

      {tab === "catalog" && (
        <>
          {productForm && <ProductDialog product={productForm} config={config} existing={products.some((product) => product.id === productForm.id)} onClose={() => setProductForm(null)} onSave={(product) => void run(async () => {
            await enregistrerVentes({ products: { put: saveProduct(products, product, config) } });
            setProductForm(null);
          }, "Article enregistré dans le catalogue.")} />}
          <Card title="Articles et prestations" flush actions={<>{searchBox}<Button size="sm" variant="primary" icon={PackagePlus} onClick={() => setProductForm(emptyProduct(config))}>Nouvel article</Button></>}>
            {shownProducts.length === 0 ? <EmptyState icon="ventes" title={products.length ? "Aucun résultat" : "Catalogue vide"} text={products.length ? "Modifiez votre recherche." : "Ajoutez des articles et prestations pour les sélectionner rapidement dans vos devis et factures."} action={!products.length && <Button variant="primary" icon={PackagePlus} onClick={() => setProductForm(emptyProduct(config))}>Créer un article</Button>} /> : (
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead><tr><th>Référence</th><th>Désignation</th><th>Unité</th><th>TVA</th><th className="sd-num">Prix HT</th><th>Compte de produit</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>{pageProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="font-semibold">{product.code}</td><td>{product.label}</td><td>{product.unit}</td>
                      <td>{config.vatCodes.find((vat) => vat.code === product.taxCode)?.label ?? product.taxCode}</td>
                      <td className="sd-num">{formatMoney(product.unitPrice)}</td>
                      <td>{product.account}</td><td><Badge tone={product.active ? "ok" : "neutral"}>{product.active ? "Actif" : "Archivé"}</Badge></td>
                      <td><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" icon={Pencil} onClick={() => setProductForm(product)}>Modifier</Button><Button size="sm" variant="ghost" icon={Archive} onClick={() => void run(() => enregistrerVentes({ products: { put: products.map((item) => item.id === product.id ? { ...item, active: !item.active } : item) } }))}>{product.active ? "Archiver" : "Réactiver"}</Button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            <TablePagination page={page} pages={pages} count={shownProducts.length} pageSize={pageSize} onChange={setPage} />
          </Card>
        </>
      )}

      {selectedInvoice && <InvoiceDetails invoice={selectedInvoice} customer={customerName(selectedInvoice.customerId)} quotes={quotes} entries={entries} config={config} onClose={() => setSelectedInvoice(null)} />}
      {selectedQuote && <QuoteDetails quote={selectedQuote} customer={customerName(selectedQuote.customerId)} config={config} onClose={() => setSelectedQuote(null)} />}
    </main>
  );
}

function SalesDialog({ title, children, wide = false, onClose }: { title: string; children: ReactNode; wide?: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const ignoreClose = useRef(false);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) {
        ignoreClose.current = true;
        dialog.close();
      }
    };
  }, []);
  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={() => {
      if (ignoreClose.current) ignoreClose.current = false;
      else onClose();
    }} onClick={(event) => { if (event.target === ref.current) ref.current?.close(); }} className={`sd-dialog max-h-[90vh] overflow-y-auto ${wide ? "sd-dialog-wide" : ""}`}>
      <header className="flex items-center justify-between gap-4 border-b border-[var(--sd-border)] px-5 py-4">
        <h2 id={titleId} className="sd-h2">{title}</h2>
        <Button variant="ghost" size="sm" icon={X} aria-label="Fermer la fenêtre" onClick={() => ref.current?.close()} />
      </header>
      <div className="p-5">{children}</div>
    </dialog>
  );
}

function CustomerDialog({ customer: initial, existing, onClose, onSave }: { customer: Customer; existing: boolean; onClose: () => void; onSave: (customer: Customer) => void }) {
  const [customer, setCustomer] = useState(initial);
  const patch = (fields: Partial<Customer>) => setCustomer((current) => ({ ...current, ...fields }));
  const contacts = customer.contacts ?? [];
  const patchContact = (index: number, fields: Partial<(typeof contacts)[number]>) => patch({ contacts: contacts.map((contact, contactIndex) => contactIndex === index ? { ...contact, ...fields } : contact) });
  return (
    <SalesDialog title={existing ? `Fiche client · ${initial.code || initial.name}` : "Nouveau client"} wide onClose={onClose}>
      <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); onSave(customer); }}>
        <section className="grid gap-3 md:grid-cols-3">
          <Field label="Code tiers"><TextInput required placeholder="CLI001" value={customer.code} onChange={(event) => patch({ code: event.target.value.toUpperCase() })} /></Field>
          <Field label="Raison sociale"><TextInput required value={customer.name} onChange={(event) => patch({ name: event.target.value })} /></Field>
          <Field label="Contact principal"><TextInput value={customer.contactName ?? ""} onChange={(event) => patch({ contactName: event.target.value })} /></Field>
          <Field label="E-mail"><TextInput type="email" value={customer.email} onChange={(event) => patch({ email: event.target.value })} /></Field>
          <Field label="Téléphone"><TextInput type="tel" value={customer.phone ?? ""} onChange={(event) => patch({ phone: event.target.value })} /></Field>
          <Field label="N° de TVA intracommunautaire"><TextInput value={customer.vatNumber} onChange={(event) => patch({ vatNumber: event.target.value.toUpperCase() })} /></Field>
        </section>
        <section className="space-y-3 border-t border-[var(--sd-border)] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="sd-h2">Contacts complémentaires</h3><Button size="sm" icon={Plus} onClick={() => patch({ contacts: [...contacts, { name: "", email: "", phone: "" }] })}>Ajouter un contact</Button></div>
          {contacts.map((contact, index) => <div key={`${customer.id}-contact-${index}`} className="grid items-end gap-3 rounded-lg border border-[var(--sd-border)] p-3 sm:grid-cols-[1fr_1.3fr_1fr_auto]">
            <Field label="Nom"><TextInput value={contact.name} onChange={(event) => patchContact(index, { name: event.target.value })} /></Field>
            <Field label="E-mail"><TextInput type="email" value={contact.email} onChange={(event) => patchContact(index, { email: event.target.value })} /></Field>
            <Field label="Téléphone"><TextInput type="tel" value={contact.phone} onChange={(event) => patchContact(index, { phone: event.target.value })} /></Field>
            <Button variant="ghost" icon={Trash2} aria-label={`Supprimer le contact ${index + 1}`} onClick={() => patch({ contacts: contacts.filter((_, contactIndex) => contactIndex !== index) })}>Retirer</Button>
          </div>)}
        </section>
        <section className="grid gap-3 border-t border-[var(--sd-border)] pt-4 md:grid-cols-3">
          <h3 className="sd-h2 md:col-span-3">Adresse de facturation</h3>
          <Field label="Adresse"><TextInput value={customer.address} onChange={(event) => patch({ address: event.target.value })} /></Field>
          <Field label="Code postal"><TextInput value={customer.postalCode ?? ""} onChange={(event) => patch({ postalCode: event.target.value })} /></Field>
          <Field label="Ville"><TextInput value={customer.city ?? ""} onChange={(event) => patch({ city: event.target.value })} /></Field>
          <Field label="Pays"><TextInput value={customer.country ?? "France"} onChange={(event) => patch({ country: event.target.value })} /></Field>
        </section>
        <section className="grid gap-3 border-t border-[var(--sd-border)] pt-4 md:grid-cols-3">
          <h3 className="sd-h2 md:col-span-3">Livraison et conditions commerciales</h3>
          <Field label="Adresse de livraison"><TextInput value={customer.deliveryAddress ?? ""} onChange={(event) => patch({ deliveryAddress: event.target.value })} /></Field>
          <Field label="Délai de paiement (jours)"><TextInput type="number" min={0} step={1} value={customer.paymentTermsDays} onChange={(event) => patch({ paymentTermsDays: Number(event.target.value) })} /></Field>
          <Field label="Plafond d’encours client" hint="Information de suivi ; aucun blocage automatique n’est appliqué."><TextInput type="number" min={0} step="0.01" value={customer.creditLimit === undefined ? "" : customer.creditLimit / 100} onChange={(event) => {
            const raw = event.target.value;
            const creditLimit = raw === "" ? undefined : parseDecimal(raw, 100);
            if (creditLimit !== null) patch({ creditLimit });
          }} /></Field>
        </section>
        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--sd-border)] pt-4">
          <Button onClick={onClose}>Annuler</Button><Button type="submit" variant="primary">Enregistrer la fiche</Button>
        </div>
      </form>
    </SalesDialog>
  );
}

function ProductDialog({ product: initial, existing, config, onClose, onSave }: { product: SalesProduct; existing: boolean; config: FinanceConfig; onClose: () => void; onSave: (product: SalesProduct) => void }) {
  const [product, setProduct] = useState(initial);
  const patch = (fields: Partial<SalesProduct>) => setProduct((current) => ({ ...current, ...fields }));
  const revenueAccounts = config.accounts.filter((account) => account.active && account.type === "revenue");
  return (
    <SalesDialog title={existing ? `Article · ${initial.code}` : "Nouvel article ou prestation"} onClose={onClose}>
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSave(product); }}>
        <Field label="Référence"><TextInput required value={product.code} onChange={(event) => patch({ code: event.target.value.toUpperCase() })} /></Field>
        <Field label="Désignation"><TextInput required value={product.label} onChange={(event) => patch({ label: event.target.value })} /></Field>
        <Field label="Unité"><TextInput required value={product.unit} onChange={(event) => patch({ unit: event.target.value })} /></Field>
        <Field label="Prix unitaire HT"><DecimalInput value={product.unitPrice} onChange={(unitPrice) => patch({ unitPrice })} suffix="€" /></Field>
        <Field label="Taux de TVA"><select className="sd-input" required value={product.taxCode} onChange={(event) => patch({ taxCode: event.target.value })}>{config.vatCodes.map((vat) => <option key={vat.code} value={vat.code}>{vat.label}</option>)}</select></Field>
        <Field label="Compte de produit"><select className="sd-input" required value={product.account} onChange={(event) => patch({ account: event.target.value })}>{revenueAccounts.map((account) => <option key={account.code} value={account.code}>{account.code} · {account.label}</option>)}</select></Field>
        <Field label="Centre de coûts par défaut"><select className="sd-input" value={product.costCenter ?? ""} onChange={(event) => patch({ costCenter: event.target.value || undefined })}><option value="">Aucun centre</option>{config.costCenters.filter((center) => center.active).map((center) => <option key={center.code} value={center.code}>{center.label}</option>)}</select></Field>
        <div className="flex justify-end gap-2 border-t border-[var(--sd-border)] pt-4"><Button onClick={onClose}>Annuler</Button><Button type="submit" variant="primary">Enregistrer</Button></div>
      </form>
    </SalesDialog>
  );
}

function CustomerDetails({ customer, invoices, config, onClose, onEdit }: { customer: Customer; invoices: Invoice[]; config: FinanceConfig; onClose: () => void; onEdit: () => void }) {
  const openInvoices = invoices.filter((invoice) => ["issued", "partially_paid"].includes(invoice.status));
  const balance = openInvoices.reduce((sum, invoice) => sum + invoiceBalance(invoice, config), 0);
  const overdue = openInvoices.filter((invoice) => isOverdue(invoice, todayISO()));
  return (
    <SalesDialog title={`${customer.code} · ${customer.name}`} wide onClose={onClose}>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Kpi icon="clients" label="Encours actuel" value={formatMoney(balance)} tone={customer.creditLimit !== undefined && balance > customer.creditLimit ? "danger" : "neutral"} />
          <Kpi icon="fiscalite" label="Plafond indicatif" value={customer.creditLimit === undefined ? "Non défini" : formatMoney(customer.creditLimit)} />
          <Kpi icon="ventes" label="Factures en retard" value={String(overdue.length)} tone={overdue.length ? "danger" : "ok"} />
        </div>
        <section className="grid gap-4 rounded-xl border border-[var(--sd-border)] p-4 sm:grid-cols-2">
          <div><p className="sd-muted text-xs uppercase">Coordonnées</p><p className="font-semibold">{customer.contactName || customer.name}</p><p>{customer.email || "—"} · {customer.phone || "—"}</p></div>
          <div><p className="sd-muted text-xs uppercase">Facturation</p><p>{[customer.address, customer.postalCode, customer.city, customer.country].filter(Boolean).join(", ") || "Adresse non renseignée"}</p><p className="sd-muted">TVA : {customer.vatNumber || "—"} · Délai : {customer.paymentTermsDays} jours</p></div>
          {customer.deliveryAddress && <div className="sm:col-span-2"><p className="sd-muted text-xs uppercase">Livraison</p><p>{customer.deliveryAddress}</p></div>}
        </section>
        <Card title="Historique des factures" flush>
          {invoices.length === 0 ? <p className="sd-muted p-4 text-sm">Aucun document de vente pour ce client.</p> : <div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Pièce</th><th>Date</th><th>Échéance</th><th className="sd-num">Total TTC</th><th className="sd-num">Reste dû</th><th>Statut</th></tr></thead><tbody>{invoices.toSorted((a, b) => b.date.localeCompare(a.date)).map((invoice) => <tr key={invoice.id}><td>{invoice.number ?? "Brouillon"}</td><td>{formatDate(invoice.date)}</td><td>{formatDate(invoice.dueDate)}</td><td className="sd-num">{formatMoney(documentTotals(invoice.lines, config).total)}</td><td className="sd-num">{["issued", "partially_paid"].includes(invoice.status) ? formatMoney(invoiceBalance(invoice, config)) : "—"}</td><td><Badge tone={statusTone[invoice.status]}>{statusLabel[invoice.status]}</Badge></td></tr>)}</tbody></table></div>}
        </Card>
        <div className="flex justify-end"><Button variant="primary" icon={Pencil} onClick={onEdit}>Modifier la fiche client</Button></div>
      </div>
    </SalesDialog>
  );
}

function InvoiceDetails({ invoice, customer, quotes, entries, config, onClose }: { invoice: Invoice; customer: string; quotes: Quote[]; entries: JournalEntry[]; config: FinanceConfig; onClose: () => void }) {
  const totals = documentTotals(invoice.lines, config);
  const trail = documentTrail(invoice, quotes, entries);
  return (
    <SalesDialog title={invoice.number ? `Facture · ${invoice.number}` : "Facture brouillon"} wide onClose={onClose}>
      <div className="space-y-5">
        <dl className="grid gap-4 rounded-xl border border-[var(--sd-border)] p-4 text-sm sm:grid-cols-3">
          <div><dt className="sd-muted">Client</dt><dd className="font-semibold">{customer}</dd></div>
          <div><dt className="sd-muted">Date</dt><dd className="font-semibold">{formatDate(invoice.date)}</dd></div>
          <div><dt className="sd-muted">Échéance</dt><dd className="font-semibold">{formatDate(invoice.dueDate)}</dd></div>
          <div><dt className="sd-muted">Statut</dt><dd><Badge tone={statusTone[invoice.status]}>{statusLabel[invoice.status]}</Badge></dd></div>
          <div><dt className="sd-muted">Total TTC</dt><dd className="font-semibold">{formatMoney(totals.total)}</dd></div>
          <div><dt className="sd-muted">Reste dû</dt><dd className="font-semibold">{["issued", "partially_paid"].includes(invoice.status) ? formatMoney(invoiceBalance(invoice, config)) : "—"}</dd></div>
        </dl>
        <Card title="Lignes du document" flush><div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Désignation</th><th className="sd-num">Quantité</th><th className="sd-num">Prix unitaire HT</th><th className="sd-num">Total HT</th></tr></thead><tbody>{invoice.lines.map((line) => <tr key={line.id}><td>{line.label}</td><td className="sd-num">{line.quantity}</td><td className="sd-num">{formatMoney(line.unitPrice)}</td><td className="sd-num">{formatMoney(Math.round(line.quantity * line.unitPrice * (10_000 - line.discountBp) / 10_000))}</td></tr>)}</tbody><tfoot><tr><td colSpan={3}>Total HT · TVA · TTC</td><td className="sd-num">{formatMoney(totals.net)}<br />{formatMoney(totals.tax)}<br /><strong>{formatMoney(totals.total)}</strong></td></tr></tfoot></table></div></Card>
        {invoice.payments.length > 0 && <Card title="Règlements" flush><div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Date</th><th>Référence comptable</th><th className="sd-num">Montant</th></tr></thead><tbody>{invoice.payments.map((payment) => <tr key={payment.id}><td>{formatDate(payment.date)}</td><td>{entries.find((entry) => entry.id === payment.entryId)?.number ?? payment.id}</td><td className="sd-num">{formatMoney(payment.amount)}</td></tr>)}</tbody></table></div></Card>}
        <section className="rounded-xl border border-[var(--sd-border)] p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--sd-muted)]">Piste documentaire</p><ol className="flex flex-wrap gap-2 text-sm">{trail.map((step, index) => <li key={`${step.type}-${index}`} className="rounded-lg bg-[var(--sd-surface-2)] px-3 py-2"><span className="sd-muted mr-2">{index + 1}.</span>{step.reference}</li>)}</ol></section>
        {invoice.notes && <p className="whitespace-pre-wrap text-sm">{invoice.notes}</p>}
      </div>
    </SalesDialog>
  );
}

function QuoteDetails({ quote, customer, config, onClose }: { quote: Quote; customer: string; config: FinanceConfig; onClose: () => void }) {
  const totals = documentTotals(quote.lines, config);
  return (
    <SalesDialog title={`Devis · ${quote.number}`} wide onClose={onClose}>
      <div className="space-y-5">
        <dl className="grid gap-4 rounded-xl border border-[var(--sd-border)] p-4 text-sm sm:grid-cols-3">
          <div><dt className="sd-muted">Client</dt><dd className="font-semibold">{customer}</dd></div>
          <div><dt className="sd-muted">Date</dt><dd className="font-semibold">{formatDate(quote.date)}</dd></div>
          <div><dt className="sd-muted">Valable jusqu’au</dt><dd className="font-semibold">{formatDate(quote.validUntil)}</dd></div>
          <div><dt className="sd-muted">Statut</dt><dd><Badge tone={statusTone[quote.status]}>{statusLabel[quote.status]}</Badge></dd></div>
          <div><dt className="sd-muted">Total TTC</dt><dd className="font-semibold">{formatMoney(totals.total)}</dd></div>
        </dl>
        <Card title="Lignes du devis" flush><div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Désignation</th><th className="sd-num">Quantité</th><th className="sd-num">Prix unitaire HT</th><th className="sd-num">Total HT</th></tr></thead><tbody>{quote.lines.map((line) => <tr key={line.id}><td>{line.label}</td><td className="sd-num">{line.quantity}</td><td className="sd-num">{formatMoney(line.unitPrice)}</td><td className="sd-num">{formatMoney(Math.round(line.quantity * line.unitPrice * (10_000 - line.discountBp) / 10_000))}</td></tr>)}</tbody><tfoot><tr><td colSpan={3}>Total HT · TVA · TTC</td><td className="sd-num">{formatMoney(totals.net)}<br />{formatMoney(totals.tax)}<br /><strong>{formatMoney(totals.total)}</strong></td></tr></tfoot></table></div></Card>
        {quote.notes && <p className="whitespace-pre-wrap text-sm">{quote.notes}</p>}
      </div>
    </SalesDialog>
  );
}

function TablePagination({ page, pages, count, pageSize, onChange }: { page: number; pages: number; count: number; pageSize: number; onChange: (page: number) => void }) {
  if (count <= pageSize) return null;
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--sd-border)] px-4 py-3 text-sm">
    <p className="sd-muted">Affichage {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, count)} sur {count}</p>
    <div className="flex gap-2"><Button size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Précédent</Button><span className="px-2 py-1 font-semibold" aria-live="polite">Page {page} / {pages}</span><Button size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Suivant</Button></div>
  </div>;
}

function DocEditor({ initial, config, customers, products, onSubmit, onCancel }: { initial: Draft; config: FinanceConfig; customers: Customer[]; products: SalesProduct[]; onSubmit: (draft: Draft) => void; onCancel: () => void }) {
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
            <thead><tr><th>Désignation</th><th>Catalogue</th><th>Qté</th><th>Prix unitaire HT</th><th>Remise</th><th>TVA</th><th>Compte de produit</th><th>Centre</th><th><span className="sr-only">Supprimer</span></th></tr></thead>
            <tbody>
              {draft.lines.map((line) => (
                <tr key={line.id}>
                  <td className="min-w-48"><TextInput required aria-label="Désignation" value={line.label} onChange={(e) => patchLine(line.id, { label: e.target.value })} /></td>
                  <td className="min-w-40"><select className="sd-input" aria-label="Insérer depuis le catalogue" value="" onChange={(event) => {
                    const product = products.find((item) => item.id === event.target.value);
                    if (product) patchLine(line.id, { label: product.label, unitPrice: product.unitPrice, taxCode: product.taxCode, account: product.account, costCenter: product.costCenter });
                  }}><option value="">Catalogue…</option>{products.map((product) => <option key={product.id} value={product.id}>{product.code} · {product.label}</option>)}</select></td>
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
