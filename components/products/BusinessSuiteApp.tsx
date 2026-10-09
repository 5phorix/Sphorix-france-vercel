"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, FilePlus2, FileText, LayoutDashboard, Plus, Receipt, Save, WalletCards } from "lucide-react";

import {
  analyzeBudget,
  buildDashboardSnapshot,
  calculateDocumentTotals,
  convertQuoteToInvoice,
  type BusinessBudget,
  type Invoice,
  type Quote,
  type QuoteLine,
} from "@/lib/products/business-suite";

type Module = "quotes" | "invoices" | "budget" | "dashboard";

const storageKeys = {
  quotes: "sadesk:quotes",
  invoices: "sadesk:invoices",
  budget: "sadesk:budget",
};

const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
const defaultLine = (): QuoteLine => ({ id: crypto.randomUUID(), label: "", quantity: 1, unitPrice: 0, taxRate: 20 });
const defaultBudget = (): BusinessBudget => ({ id: "primary", period: today().slice(0, 7), lines: [{ id: crypto.randomUUID(), category: "Marketing", planned: 0, actual: 0 }] });

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function BusinessSuiteApp({ module }: { module: Module }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [budget, setBudget] = useState<BusinessBudget>(defaultBudget);
  const [ready, setReady] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [line, setLine] = useState<QuoteLine>(defaultLine);
  const [template, setTemplate] = useState<Invoice["template"]>("classique");

  const refresh = () => {
    setQuotes(readStorage(storageKeys.quotes, []));
    setInvoices(readStorage(storageKeys.invoices, []));
    setBudget(readStorage(storageKeys.budget, defaultBudget()));
    setReady(true);
  };

  useEffect(() => { queueMicrotask(refresh); }, []);

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#f5f0ea] text-sm font-semibold text-slate-700">Préparation de votre espace Sadesk...</main>;

  const createQuote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerName.trim() || !line.label.trim() || line.unitPrice <= 0) return;
    const next: Quote = { id: crypto.randomUUID(), number: `DEV-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, "0")}`, customerName: customerName.trim(), customerEmail: customerEmail.trim(), issueDate: today(), validUntil: `${today().slice(0, 8)}28`, status: "draft", lines: [{ ...line, id: crypto.randomUUID(), label: line.label.trim() }], notes: "" };
    const updated = [next, ...quotes];
    setQuotes(updated);
    saveStorage(storageKeys.quotes, updated);
    setCustomerName(""); setCustomerEmail(""); setLine(defaultLine());
  };

  const updateQuoteStatus = (id: string, status: Quote["status"]) => {
    const updated = quotes.map((quote) => quote.id === id ? { ...quote, status } : quote);
    setQuotes(updated); saveStorage(storageKeys.quotes, updated);
  };

  const createInvoiceFromQuote = (quote: Quote) => {
    const next = { ...convertQuoteToInvoice(quote, `FAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`, today(), `${today().slice(0, 8)}28`), template };
    const updated = [next, ...invoices];
    setInvoices(updated); saveStorage(storageKeys.invoices, updated);
    updateQuoteStatus(quote.id, "accepted");
  };

  const updateInvoiceStatus = (id: string, status: Invoice["status"]) => {
    const updated = invoices.map((invoice) => invoice.id === id ? { ...invoice, status } : invoice);
    setInvoices(updated); saveStorage(storageKeys.invoices, updated);
  };

  const updateBudgetLine = (id: string, field: "category" | "planned" | "actual", value: string) => {
    const updated = { ...budget, lines: budget.lines.map((lineItem) => lineItem.id === id ? { ...lineItem, [field]: field === "category" ? value : Number(value) } : lineItem) };
    setBudget(updated); saveStorage(storageKeys.budget, updated);
  };

  const addBudgetLine = () => {
    const updated = { ...budget, lines: [...budget.lines, { id: crypto.randomUUID(), category: "Nouvelle catégorie", planned: 0, actual: 0 }] };
    setBudget(updated); saveStorage(storageKeys.budget, updated);
  };

  const snapshot = buildDashboardSnapshot(quotes, invoices, budget);
  const titles: Record<Module, [string, string]> = {
    quotes: ["Sadesk Devis", "Préparez des propositions claires et transformez les acceptées en factures."],
    invoices: ["Sadesk Facturation", "Gérez vos modèles, échéances et règlements depuis une base commune."],
    budget: ["Sadesk Budget", "Comparez le prévu au réalisé pour décider avec plus de visibilité."],
    dashboard: ["Sadesk Tableaux de bord", "Les indicateurs des modules complémentaires réunis au même endroit."],
  };
  const [title, subtitle] = titles[module];

  return (
    <main className="min-h-screen bg-[#f5f0ea] text-slate-950">
        <header className="border-b border-[#d8c9bb] bg-[#fffdf9]"><div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4 px-4 py-5 sm:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a2672c]">Espace de gestion autonome</p><h1 className="mt-1 text-xl font-bold text-[#422c1c]">{title}</h1></div><span className="hidden items-center gap-2 text-xs font-bold text-[#6e5744] sm:inline-flex"><span className="h-2 w-2 rounded-full bg-emerald-600" />Données locales exportables</span></div></header>
      <div className="mx-auto grid max-w-[1450px] lg:grid-cols-[230px_1fr]"><aside className="border-b border-[#d8c9bb] bg-[#fbf7f0] p-3 lg:min-h-[calc(100vh-78px)] lg:border-b-0 lg:border-r lg:p-5"><nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Navigation des outils"><a className={`inline-flex items-center gap-3 px-3 py-3 text-sm font-bold ${module === "dashboard" ? "bg-[#f1dfc8] text-[#422c1c]" : "text-[#755a43]"}`} href="/produits/tableaux-de-bord"><LayoutDashboard className="h-4 w-4" />Tableaux de bord</a><a className={`inline-flex items-center gap-3 px-3 py-3 text-sm font-bold ${module === "quotes" ? "bg-[#f1dfc8] text-[#422c1c]" : "text-[#755a43]"}`} href="/produits/devis"><FileText className="h-4 w-4" />Devis</a><a className={`inline-flex items-center gap-3 px-3 py-3 text-sm font-bold ${module === "invoices" ? "bg-[#f1dfc8] text-[#422c1c]" : "text-[#755a43]"}`} href="/produits/facturation"><Receipt className="h-4 w-4" />Facturation</a><a className={`inline-flex items-center gap-3 px-3 py-3 text-sm font-bold ${module === "budget" ? "bg-[#f1dfc8] text-[#422c1c]" : "text-[#755a43]"}`} href="/produits/budget"><WalletCards className="h-4 w-4" />Budget</a></nav><p className="mt-8 hidden border-l-2 border-[#c58d58] pl-3 text-xs leading-relaxed text-[#755a43] lg:block">Chaque outil fonctionne seul et exporte ses données au format JSON.</p></aside>
        <section className="min-w-0 px-4 py-8 sm:px-8"><div className="border-b border-[#d8c9bb] pb-6"><p className="max-w-2xl text-sm leading-relaxed text-[#755a43]">{subtitle}</p></div>
          {module === "quotes" && <section className="mt-7 grid gap-7 xl:grid-cols-[0.75fr_1.25fr]"><form onSubmit={createQuote} className="border border-[#d8c9bb] bg-[#fffdf9] p-5"><h2 className="flex items-center gap-2 text-lg font-bold text-[#422c1c]"><FilePlus2 className="h-5 w-5 text-[#a2672c]" />Nouveau devis</h2><div className="mt-5 grid gap-3"><input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nom du client" className="border border-[#d8c9bb] bg-white px-3 py-3 text-sm" /><input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="Email du client" className="border border-[#d8c9bb] bg-white px-3 py-3 text-sm" /><input required value={line.label} onChange={(event) => setLine({ ...line, label: event.target.value })} placeholder="Prestation ou produit" className="border border-[#d8c9bb] bg-white px-3 py-3 text-sm" /><div className="grid grid-cols-2 gap-3"><input required min="0" type="number" value={line.quantity} onChange={(event) => setLine({ ...line, quantity: Number(event.target.value) })} placeholder="Quantité" className="border border-[#d8c9bb] bg-white px-3 py-3 text-sm" /><input required min="0" type="number" value={line.unitPrice} onChange={(event) => setLine({ ...line, unitPrice: Number(event.target.value) })} placeholder="Prix unitaire HT" className="border border-[#d8c9bb] bg-white px-3 py-3 text-sm" /></div></div><button className="mt-5 inline-flex items-center gap-2 bg-[#422c1c] px-4 py-3 text-sm font-bold text-white"><Save className="h-4 w-4" />Enregistrer le devis</button></form><div className="space-y-3">{quotes.length === 0 ? <EmptyState text="Aucun devis pour le moment." /> : quotes.map((quote) => <article key={quote.id} className="border border-[#d8c9bb] bg-[#fffdf9] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a2672c]">{quote.number}</p><h3 className="mt-1 text-lg font-bold text-[#422c1c]">{quote.customerName}</h3></div><select value={quote.status} onChange={(event) => updateQuoteStatus(quote.id, event.target.value as Quote["status"])} className="border border-[#d8c9bb] bg-white px-3 py-2 text-sm font-semibold"><option value="draft">Brouillon</option><option value="sent">Envoyé</option><option value="accepted">Accepté</option><option value="rejected">Refusé</option></select></div><div className="mt-4 flex items-center justify-between gap-3 text-sm text-[#755a43]"><span>{quote.lines[0]?.label}</span><strong className="text-[#422c1c]">{money(calculateDocumentTotals(quote.lines).total)}</strong></div>{quote.status === "accepted" && !invoices.some((invoice) => invoice.quoteId === quote.id) && <button onClick={() => createInvoiceFromQuote(quote)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#a2672c]">Créer la facture<ArrowRight className="h-4 w-4" /></button>}</article>)}</div></section>}
          {module === "invoices" && <section className="mt-7 space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold text-[#422c1c]">Vos factures</h2><label className="flex items-center gap-2 text-sm font-semibold text-[#755a43]">Modèle par défaut<select value={template} onChange={(event) => setTemplate(event.target.value as Invoice["template"])} className="border border-[#d8c9bb] bg-white px-3 py-2"><option value="classique">Classique</option><option value="sobre">Sobre</option><option value="acompte">Acompte</option></select></label></div>{invoices.length === 0 ? <EmptyState text="Acceptez un devis pour créer votre première facture." /> : invoices.map((invoice) => <article key={invoice.id} className="border border-[#d8c9bb] bg-[#fffdf9] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a2672c]">{invoice.number} · Modèle {invoice.template}</p><h3 className="mt-1 text-lg font-bold text-[#422c1c]">{invoice.customerName}</h3></div><select value={invoice.status} onChange={(event) => updateInvoiceStatus(invoice.id, event.target.value as Invoice["status"])} className="border border-[#d8c9bb] bg-white px-3 py-2 text-sm font-semibold"><option value="draft">Brouillon</option><option value="issued">Émise</option><option value="paid">Payée</option><option value="overdue">En retard</option></select></div><div className="mt-4 flex justify-between text-sm text-[#755a43]"><span>Échéance : {invoice.dueDate}</span><strong className="text-[#422c1c]">{money(calculateDocumentTotals(invoice.lines).total)}</strong></div></article>)}</section>}
          {module === "budget" && <section className="mt-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold text-[#422c1c]">Budget {budget.period}</h2><p className="mt-1 text-sm text-[#755a43]">{money(analyzeBudget(budget).actual)} réalisés sur {money(analyzeBudget(budget).planned)} prévus.</p></div><div className="flex gap-2"><input type="month" value={budget.period} onChange={(event) => { const updated = { ...budget, period: event.target.value }; setBudget(updated); saveStorage(storageKeys.budget, updated); }} className="border border-[#d8c9bb] bg-white px-3 py-2 text-sm" /><button onClick={addBudgetLine} className="inline-flex items-center gap-2 bg-[#422c1c] px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" />Catégorie</button></div></div><div className="mt-6 overflow-x-auto border border-[#d8c9bb] bg-[#fffdf9]"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-[#d8c9bb] text-xs uppercase tracking-[0.12em] text-[#755a43]"><tr><th className="p-4">Catégorie</th><th className="p-4">Prévu</th><th className="p-4">Réalisé</th><th className="p-4">Écart</th></tr></thead><tbody>{analyzeBudget(budget).lines.map((lineItem) => <tr key={lineItem.id} className="border-b border-[#eee4da]"><td className="p-3"><input value={lineItem.category} onChange={(event) => updateBudgetLine(lineItem.id, "category", event.target.value)} className="w-full bg-transparent px-1 py-2 font-semibold" /></td><td className="p-3"><input type="number" value={lineItem.planned} onChange={(event) => updateBudgetLine(lineItem.id, "planned", event.target.value)} className="w-28 border border-[#d8c9bb] px-2 py-2" /></td><td className="p-3"><input type="number" value={lineItem.actual} onChange={(event) => updateBudgetLine(lineItem.id, "actual", event.target.value)} className="w-28 border border-[#d8c9bb] px-2 py-2" /></td><td className={`p-3 font-bold ${lineItem.isOverBudget ? "text-red-700" : "text-emerald-700"}`}>{money(lineItem.variance)}</td></tr>)}</tbody></table></div></section>}
          {module === "dashboard" && <section className="mt-7"><div className="grid gap-4 md:grid-cols-3"><Metric icon={FileText} label="Devis acceptés" value={`${snapshot.quotes.accepted} / ${snapshot.quotes.total}`} /><Metric icon={Receipt} label="Factures à encaisser" value={money(snapshot.invoices.outstanding)} /><Metric icon={BarChart3} label="Écart budget" value={money(snapshot.budget.variance)} tone={snapshot.budget.variance > 0 ? "red" : "green"} /></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><article className="border border-[#d8c9bb] bg-[#fffdf9] p-5"><h2 className="font-bold text-[#422c1c]">Activité commerciale</h2><dl className="mt-4 space-y-3 text-sm"><Row label="Pipeline de devis envoyés" value={money(snapshot.quotes.pipeline)} /><Row label="Factures émises" value={String(snapshot.invoices.issued)} /><Row label="Factures payées" value={money(snapshot.invoices.paid)} /></dl></article><article className="border border-[#d8c9bb] bg-[#fffdf9] p-5"><h2 className="font-bold text-[#422c1c]">Budget</h2><dl className="mt-4 space-y-3 text-sm"><Row label="Prévu" value={money(snapshot.budget.planned)} /><Row label="Réalisé" value={money(snapshot.budget.actual)} /><Row label="Utilisation" value={snapshot.budget.utilizationRate === null ? "-" : `${Math.round(snapshot.budget.utilizationRate * 100)} %`} /></dl></article></div></section>}
        </section>
      </div>
    </main>
  );
}

function EmptyState({ text }: { text: string }) { return <div className="border border-dashed border-[#cdb9a6] bg-[#fffdf9] p-10 text-center text-sm font-semibold text-[#755a43]">{text}</div>; }
function Metric({ icon: Icon, label, value, tone = "normal" }: { icon: typeof FileText; label: string; value: string; tone?: "normal" | "red" | "green" }) { return <article className="border border-[#d8c9bb] bg-[#fffdf9] p-5"><Icon className={tone === "red" ? "text-red-700" : tone === "green" ? "text-emerald-700" : "text-[#a2672c]"} /><p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-[#755a43]">{label}</p><p className="mt-2 text-2xl font-bold text-[#422c1c]">{value}</p></article>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-[#eee4da] pb-3"><dt className="text-[#755a43]">{label}</dt><dd className="font-bold text-[#422c1c]">{value}</dd></div>; }