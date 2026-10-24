"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileUp, Lock, Plus, RotateCcw, Trash2, Undo2, X, XCircle } from "lucide-react";

import { lockPeriod, upsertAccount } from "@/lib/finance/config";
import { financeDb, loadFinance, saveBudget, saveConfig, saveEntries } from "@/lib/finance/db";
import { buildPayment, buildPurchaseInvoice, buildSalesInvoice } from "@/lib/finance/documents";
import { extractInvoiceFromFile, parseElectronicInvoiceXml, type ElectronicInvoice } from "@/lib/finance/einvoice";
import { autoMatch } from "@/lib/finance/echeancier-gestion";
import { postEntry, reverseEntry } from "@/lib/finance/ledger";
import { buildPilotage } from "@/lib/finance/pilotage";
import { closingTaxEntry } from "@/lib/finance/reports";
import type { AccountType, Budget, FinanceConfig, JournalEntry } from "@/lib/finance/types";
import { formatDate, formatMoney, formatPercent, todayISO } from "@/lib/suite/format";

import { Badge, Button, Card, DecimalInput, EmptyState, Field, Kpi, PageHeader, Tabs, TextInput } from "@/components/suite/ui";

type Tab = "pilotage" | "ecritures" | "fiscalite" | "gestion" | "parametrage";
const tabs: { id: Tab; label: string }[] = [
  { id: "pilotage", label: "Tableau de bord" },
  { id: "ecritures", label: "Écritures" },
  { id: "fiscalite", label: "TVA et impôts" },
  { id: "gestion", label: "Centres et budgets" },
  { id: "parametrage", label: "Paramétrage" },
];

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "asset", label: "Actif" },
  { value: "liability", label: "Passif" },
  { value: "equity", label: "Capitaux" },
  { value: "revenue", label: "Produit" },
  { value: "expense", label: "Charge" },
];

type Pilot = ReturnType<typeof buildPilotage>;

export default function PilotageApp({ initialTab = "pilotage" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [config, setConfig] = useState<FinanceConfig | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    const data = await loadFinance();
    setConfig(data.config);
    setEntries(data.entries);
    setBudgets(data.budgets);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial depuis IndexedDB
    void refresh();
  }, [refresh]);

  const asOf = todayISO();
  const pilot = useMemo(() => (config ? buildPilotage(entries, config, budgets, asOf) : null), [config, entries, budgets, asOf]);

  if (!config || !pilot) {
    return <p className="sd-muted" role="status">Chargement des données…</p>;
  }

  const run = async (action: () => Promise<void> | void, success?: string): Promise<boolean> => {
    try {
      await action();
      setMessage("");
      setNotice(success ?? "");
      await refresh();
      return true;
    } catch (error) {
      setNotice("");
      setMessage(error instanceof Error ? error.message : "Opération impossible.");
      return false;
    }
  };

  const post = (draft: JournalEntry) => run(async () => { await saveEntries([postEntry(entries, draft, config)]); }, "Pièce comptabilisée.");
  const postDraft = (draft: JournalEntry) => run(async () => { await saveEntries([postEntry(entries, draft, config)]); }, "Brouillon comptabilisé.");

  return (
    <main className="space-y-6">
      <PageHeader
        icon={tab === "ecritures" ? "compta" : tab === "fiscalite" ? "fiscalite" : "gestion"}
        eyebrow={tab === "ecritures" ? "Comptabilité" : tab === "fiscalite" ? "Fiscalité" : "Gestion & Finance"}
        title={tab === "ecritures" ? "Journal comptable" : config.companyName}
        description={`${config.companyName} · Exercice ${pilot.fiscalYear.label} : du ${formatDate(pilot.fiscalYear.start)} au ${formatDate(pilot.fiscalYear.end)}. Une seule source de vérité : les écritures comptables.`}
      />
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Sections du pilotage" />
      {message && <p role="alert" className="rounded-xl border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]">{message}</p>}
      {notice && !message && <p role="status" className="rounded-xl border border-[var(--sd-ok)] bg-[var(--sd-ok-soft)] p-3 text-sm text-[var(--sd-ok)]">{notice}</p>}

      {tab === "pilotage" && <Dashboard pilot={pilot} />}
      {tab === "ecritures" && (
        <Accounting
          config={config}
          entries={entries}
          onPost={post}
          onApproveDraft={postDraft}
          onReverse={(entry) => run(async () => { const { reversal, original } = reverseEntry(entries, entry, todayISO(), config, crypto.randomUUID()); await saveEntries([original, reversal]); }, "Pièce extournée.")}
          onMatch={() => run(async () => { await saveEntries(autoMatch(entries, config)); }, "Lettrage effectué.")}
        />
      )}
      {tab === "fiscalite" && <Tax pilot={pilot} onClose={() => { const draft = closingTaxEntry(entries, config, pilot.fiscalYear.end, crypto.randomUUID()); if (!draft) { setNotice(""); return setMessage("Aucun impôt à constater."); } void post(draft); }} />}
      {tab === "gestion" && <Controlling pilot={pilot} config={config} onBudget={(budget) => run(() => saveBudget(budget).then(() => undefined), "Budget enregistré.")} />}
      {tab === "parametrage" && (
        <Settings
          config={config}
          onSave={(next) => run(async () => { await saveConfig(next); }, "Paramètres enregistrés.")}
          onReset={() => run(async () => { await Promise.all([financeDb.entries.clear(), financeDb.budgets.clear(), financeDb.config.clear(), financeDb.customers.clear(), financeDb.quotes.clear(), financeDb.invoices.clear()]); }, "Données effacées.")}
        />
      )}
    </main>
  );
}

function Dashboard({ pilot }: { pilot: Pilot }) {
  const k = pilot.kpis;
  const icon = {
    ok: <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--sd-ok)]" aria-label="Conforme" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--sd-warn)]" aria-label="Attention" />,
    error: <XCircle className="h-4 w-4 shrink-0 text-[var(--sd-danger)]" aria-label="Erreur" />,
  };
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon="finance" label="Chiffre d'affaires" value={formatMoney(k.revenue)} />
        <Kpi icon="gestion" label="Résultat net" value={formatMoney(k.netResult)} tone={k.netResult < 0 ? "danger" : "ok"} hint={k.margin === null ? undefined : `Marge ${formatPercent(k.margin)}`} />
        <Kpi icon="tresorerie" label="Trésorerie" value={formatMoney(k.cash)} tone={k.cash < 0 ? "danger" : "neutral"} />
        <Kpi icon="compta" label="Besoin en fonds de roulement" value={formatMoney(k.receivables - k.payables)} hint="Créances − dettes" />
        <Kpi icon="clients" label="Créances clients" value={formatMoney(k.receivables)} tone={k.overdueReceivables > 0 ? "warn" : "neutral"} hint={`dont en retard : ${formatMoney(k.overdueReceivables)}`} />
        <Kpi icon="achats" label="Dettes fournisseurs" value={formatMoney(k.payables)} />
        <Kpi icon="fiscalite" label="TVA à décaisser" value={formatMoney(k.vatPayable)} />
        <Kpi icon="fiscalite" label="Impôt sur les sociétés estimé" value={formatMoney(k.estimatedCorporateTax)} />
      </div>
      <Card title="Contrôles de cohérence">
        <ul className="space-y-2 text-sm">
          {pilot.checks.map((check) => (
            <li key={check.id} className="flex items-center gap-2">{icon[check.level]}{check.message}</li>
          ))}
        </ul>
      </Card>
    </>
  );
}

type Kind = "sale" | "purchase" | "in" | "out";

function Accounting({ config, entries, onPost, onApproveDraft, onReverse, onMatch }: { config: FinanceConfig; entries: JournalEntry[]; onPost: (entry: JournalEntry) => Promise<boolean>; onApproveDraft: (entry: JournalEntry) => Promise<boolean>; onReverse: (entry: JournalEntry) => void; onMatch: () => void }) {
  const [kind, setKind] = useState<Kind>("sale");
  const [partner, setPartner] = useState("");
  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState("706000");
  const [taxCode, setTaxCode] = useState("TVA20");
  const [center, setCenter] = useState(config.costCenters[0]?.code ?? "");
  const [date, setDate] = useState(todayISO());
  const [due, setDue] = useState(todayISO());
  const [reference, setReference] = useState("");
  const [search, setSearch] = useState("");
  const [showJournal, setShowJournal] = useState(true);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importedInvoice, setImportedInvoice] = useState<ElectronicInvoice | null>(null);
  const [importAccounts, setImportAccounts] = useState<string[]>([]);
  const [importTaxCodes, setImportTaxCodes] = useState<string[]>([]);
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isValidatingImport, setIsValidatingImport] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const invoice = kind === "sale" || kind === "purchase";

  const entryDraft = useMemo(() => {
    const id = "preview";
    const lines = [{ label: reference || (kind === "purchase" ? "Achat" : "Prestation"), amountHT: amount, taxCode, account, costCenter: center }];
    if (kind === "sale") return { ...buildSalesInvoice(config, { id, date, dueDate: due, customerId: partner, reference, lines }), source: "manual" as const };
    if (kind === "purchase") return { ...buildPurchaseInvoice(config, { id, date, dueDate: due, supplierId: partner, reference, lines }), source: "manual" as const };
    return { ...buildPayment({ id, date, kind: kind === "in" ? "customer" : "supplier", partnerId: partner, amount, reference }), source: "manual" as const };
  }, [account, amount, center, config, date, due, kind, partner, reference, taxCode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (amount <= 0) return;
    if (await onPost({ ...entryDraft, id: crypto.randomUUID() })) {
      setAmount(0);
      setReference("");
      setPartner("");
      setShowEntryForm(false);
    }
  };
  const accounts = config.accounts.filter((item) => item.active && (kind === "sale" ? item.type === "revenue" : item.type === "expense"));
  const needle = search.trim().toLowerCase();
  const activeJournal = kind === "sale" ? "VT" : kind === "purchase" ? "AC" : "BQ";
  const journal = [...entries]
    .filter((entry) => entry.journal === activeJournal)
    .filter((entry) => !needle || `${entry.number ?? ""} ${entry.reference ?? ""} ${entry.label} ${entry.lines.map((line) => `${line.accountCode} ${line.partnerId ?? ""} ${line.label ?? ""}`).join(" ")}`.toLowerCase().includes(needle))
    .sort((a, b) => b.date.localeCompare(a.date));
  const journalRows = journal.flatMap((entry) => entry.lines.map((line, index) => ({ entry, line, index })));
  const journalDebit = journalRows.reduce((total, row) => total + row.line.debit, 0);
  const journalCredit = journalRows.reduce((total, row) => total + row.line.credit, 0);
  const journalTitle = kind === "sale" ? "Ventes (VT)" : kind === "purchase" ? "Achats (AC)" : "Banque (BQ)";
  const importDuplicate = Boolean(importedInvoice?.number.trim() && importedInvoice.supplierId.trim() && entries.some((entry) =>
    entry.journal === "AC"
    && entry.reference === importedInvoice.number
    && entry.lines.some((line) => line.accountCode === "401000" && line.partnerId === importedInvoice.supplierId),
  ));
  const importLines = importedInvoice?.lines.map((line, index) => ({
    ...line,
    taxCode: importTaxCodes[index] ?? "",
    account: importAccounts[index] ?? "",
    costCenter: config.costCenters.find((item) => item.active)?.code,
  })) ?? [];
  const importedTotals = importedInvoice ? importLines.reduce((totals, line) => {
    const vat = config.vatCodes.find((item) => item.code === line.taxCode);
    const tax = vat ? Math.round((line.amountHT * vat.rateBp) / 10000) : 0;
    return { ht: totals.ht + line.amountHT, tax: totals.tax + tax };
  }, { ht: 0, tax: 0 }) : null;
  const importTotalMismatch = importedInvoice?.totalTTC !== undefined
    && Math.abs(importedInvoice.totalTTC - (importedTotals?.ht ?? 0) - (importedTotals?.tax ?? 0)) > 1;
  const importMissingFields = Boolean(importedInvoice && (
    !importedInvoice.supplierName.trim()
    || !importedInvoice.supplierId.trim()
    || !importedInvoice.number.trim()
    || !importedInvoice.date
    || !importedInvoice.dueDate
  ));
  const importInvalidLines = importLines.some((line) => !line.label.trim() || line.amountHT <= 0 || !line.account || !line.taxCode);

  const readElectronicInvoice = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    setImportedInvoice(null);
    setImportError("");
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setImportError("Le fichier dépasse la taille maximale de 10 Mo.");
      return;
    }
    const extension = file.name.toLowerCase().split(".").pop();
    const isXml = extension === "xml";
    const isOcrDocument = ["pdf", "png", "jpg", "jpeg", "webp"].includes(extension ?? "");
    if (!isXml && !isOcrDocument) {
      setImportError("Sélectionnez un XML UBL/CII, un PDF ou une image PNG, JPG ou WebP.");
      return;
    }
    setIsImporting(true);
    setOcrProgress(0);
    try {
      const invoiceData = isXml
        ? parseElectronicInvoiceXml(await file.text())
        : await extractInvoiceFromFile(file, setOcrProgress);
      const defaultAccount = (label: string) => {
        const text = label.toLocaleLowerCase("fr");
        const suggestedCode = /loyer|location/.test(text) ? "613000"
          : /honoraire|conseil|consult/.test(text) ? "622000"
          : /publicit|marketing|communication/.test(text) ? "623000"
          : /téléphone|telephone|internet|postal/.test(text) ? "626000"
          : /frais bancaires?|commission bancaire/.test(text) ? "627000"
          : /matière première|matières premières/.test(text) ? "601000"
          : "606000";
        return config.accounts.find((account) => account.code === suggestedCode && account.active && account.type === "expense")?.code
          ?? config.accounts.find((account) => account.active && account.type === "expense")?.code
          ?? "";
      };
      setImportedInvoice(invoiceData);
      setImportAccounts(invoiceData.lines.map((line) => defaultAccount(line.label)));
      setImportTaxCodes(invoiceData.lines.map((line) => Number.isFinite(line.taxRate)
        ? config.vatCodes.find((vat) => Math.abs(vat.rateBp / 100 - line.taxRate) < 0.01)?.code ?? ""
        : ""));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Impossible de lire ce document.");
    } finally {
      setIsImporting(false);
    }
  };

  const validateImportedInvoice = async () => {
    if (!importedInvoice) return;
    if (importMissingFields || importInvalidLines) {
      setImportError("Complétez le fournisseur, la référence, les dates, le libellé, le montant et les imputations avant de comptabiliser.");
      return;
    }
    setIsValidatingImport(true);
    try {
      const draft = buildPurchaseInvoice(config, {
        id: crypto.randomUUID(),
        date: importedInvoice.date,
        dueDate: importedInvoice.dueDate,
        supplierId: importedInvoice.supplierId,
        reference: importedInvoice.number,
        lines: importLines.map((line) => ({ label: line.label, amountHT: line.amountHT, taxCode: line.taxCode, account: line.account, costCenter: line.costCenter })),
      });
      draft.source = "electronic-invoice";
      draft.sourceFormat = importedInvoice.sourceFormat;
      if (importedInvoice.totalTTC !== undefined && Math.abs(importedInvoice.totalTTC - (importedTotals?.ht ?? 0) - (importedTotals?.tax ?? 0)) > 1) {
        setImportError("Le total TTC extrait ne correspond pas au calcul à partir des lignes et des taux de TVA. Vérifiez la facture avant de l’importer.");
        return;
      }
      if (await onPost(draft)) {
        setKind("purchase");
        setImportedInvoice(null);
        setImportError("");
        setShowImport(false);
        setShowJournal(true);
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Impossible de préparer l’écriture comptable.");
    } finally {
      setIsValidatingImport(false);
    }
  };

  return (
    <>
      {showJournal ? (
        <Popup title={`Journal : ${journalTitle}`} wide onClose={() => setShowJournal(false)}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="sd-muted text-sm">Saisie des écritures · TVA et numérotation automatiques</p>
            <div className="flex gap-2">
              <Button icon={FileUp} onClick={() => { setKind("purchase"); setAccount("606000"); setShowJournal(false); setShowImport(true); setImportError(""); }}>Importer une facture</Button>
              <Button icon={Plus} onClick={() => { setAmount(0); setReference(""); setPartner(""); setDate(todayISO()); setDue(todayISO()); setShowEntryForm(true); }}>Nouveau</Button>
            </div>
          </div>
          <div className="my-5 flex flex-wrap items-center justify-between gap-3 border-y border-[var(--sd-border)] py-3">
            <h3 className="sd-h2">Écritures du journal</h3>
            <div className="flex flex-wrap items-center gap-2">
              <TextInput type="search" placeholder="Rechercher une écriture…" aria-label="Rechercher une écriture" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button size="sm" icon={RotateCcw} onClick={onMatch}>Lettrage automatique</Button>
            </div>
          </div>
          <div className="sd-table-wrap sd-journal-grid overflow-auto">
            <table className="sd-table min-w-[1100px]">
              <thead><tr><th>Jour</th><th>N° pièce</th><th>Journal</th><th>N° facture</th><th>N° compte général</th><th>N° compte tiers</th><th>Libellé écriture</th><th>Date échéance</th><th className="sd-num">Débit</th><th className="sd-num">Crédit</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {journalRows.map(({ entry, line, index }) => (
                  <tr key={`${entry.id}-${index}`} className={index === 0 ? "border-t-2 border-[var(--sd-border-strong)]" : undefined}>
                    {index === 0 && (
                      <>
                        <td rowSpan={entry.lines.length}>{formatDate(entry.date)}</td>
                        <td rowSpan={entry.lines.length}>{entry.number ?? <Badge>Brouillon</Badge>}{entry.status === "reversed" && <Badge tone="warn">Extournée</Badge>}</td>
                        <td rowSpan={entry.lines.length}>{entry.journal}</td>
                        <td rowSpan={entry.lines.length}>{entry.reference || "—"}</td>
                      </>
                    )}
                    <td>{line.accountCode} · {config.accounts.find((account) => account.code === line.accountCode)?.label ?? "Compte inconnu"}</td>
                    <td>{line.partnerId || "—"}</td>
                    <td>{line.label || entry.label}</td>
                    <td>{line.dueDate ? formatDate(line.dueDate) : "—"}</td>
                    <td className="sd-num">{line.debit ? formatMoney(line.debit) : "—"}</td>
                    <td className="sd-num">{line.credit ? formatMoney(line.credit) : "—"}</td>
                    {index === 0 && (
                      <td rowSpan={entry.lines.length} className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" icon={Eye} onClick={() => setSelectedEntry(entry)}>Détails</Button>
                          {entry.status === "posted" && <Button size="sm" variant="ghost" icon={Undo2} onClick={() => { if (window.confirm(`Extourner la pièce ${entry.number ?? ""} ?`)) onReverse(entry); }}>Extourner</Button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {journalRows.length === 0 && Array.from({ length: 6 }, (_, index) => (
                  <tr key={`empty-${index}`} aria-hidden="true">
                    <td>&nbsp;</td><td /><td /><td /><td /><td /><td /><td /><td /><td /><td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 rounded-xl border border-[var(--sd-border-strong)] bg-[var(--sd-brand-soft)] p-4 sm:grid-cols-[1fr_1fr_1fr]">
            <div><p className="sd-muted text-xs">Total débit · {journal.length} pièce{journal.length > 1 ? "s" : ""}</p><p className="sd-num font-semibold">{formatMoney(journalDebit)}</p></div>
            <div><p className="sd-muted text-xs">Total crédit</p><p className="sd-num font-semibold">{formatMoney(journalCredit)}</p></div>
            <div><p className="sd-muted text-xs">Solde à équilibrer</p><p className="sd-num font-semibold">{formatMoney(journalDebit - journalCredit)}</p></div>
          </div>
        </Popup>
      ) : (
        <Card title="Journal comptable" actions={<Button variant="primary" icon={Eye} onClick={() => setShowJournal(true)}>Ouvrir le journal</Button>}>
          <p className="sd-muted text-sm">Le journal affiche les écritures et leurs totaux débit/crédit.</p>
        </Card>
      )}

      {showEntryForm && (
        <Popup
          title={invoice ? "Saisie d’une facture" : "Saisie d’un règlement"}
          wide
          contentClassName="sd-entry-dialog-content"
          onClose={() => setShowEntryForm(false)}
        >
          <form onSubmit={submit} className="grid min-h-0 gap-4 overflow-auto">
            <div className="grid gap-3 rounded-xl border border-[var(--sd-border)] bg-[var(--sd-surface-2)] p-4 sm:grid-cols-3 xl:grid-cols-5">
              <Field label="Type de pièce">
                <select className="sd-input" value={kind} onChange={(event) => { const next = event.target.value as Kind; setKind(next); setAccount(next === "sale" ? "706000" : "606000"); }}>
                  <option value="sale">Facture client</option>
                  <option value="purchase">Facture fournisseur</option>
                  <option value="in">Encaissement client</option>
                  <option value="out">Paiement fournisseur</option>
                </select>
              </Field>
              <Field label="Date"><TextInput type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field>
              <Field label="N° facture / référence"><TextInput required value={reference} onChange={(event) => setReference(event.target.value)} /></Field>
              <Field label="Compte tiers"><TextInput required value={partner} onChange={(event) => setPartner(event.target.value)} /></Field>
              {invoice && <Field label="Date échéance"><TextInput type="date" value={due} onChange={(event) => setDue(event.target.value)} /></Field>}
            </div>

            <div className="grid gap-3 rounded-xl border border-[var(--sd-border)] p-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label={invoice ? "Montant HT" : "Montant"}><DecimalInput value={amount} onChange={setAmount} suffix="€" /></Field>
              {invoice && (
                <>
                  <Field label="Compte général">
                    <select className="sd-input" value={account} onChange={(event) => setAccount(event.target.value)}>{accounts.map((item) => <option key={item.code} value={item.code}>{item.code} {item.label}</option>)}</select>
                  </Field>
                  <Field label="Taux de TVA">
                    <select className="sd-input" value={taxCode} onChange={(event) => setTaxCode(event.target.value)}>{config.vatCodes.map((vat) => <option key={vat.code} value={vat.code}>{vat.label}</option>)}</select>
                  </Field>
                  <Field label="Centre de coûts">
                    <select className="sd-input" value={center} onChange={(event) => setCenter(event.target.value)}>{config.costCenters.filter((item) => item.active).map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select>
                  </Field>
                </>
              )}
            </div>

            <section className="grid min-h-0 gap-3">
              <h3 className="sd-h2">Aperçu des écritures générées</h3>
              <div className="sd-table-wrap sd-journal-grid overflow-auto">
                <table className="sd-table min-w-[1100px]">
                  <thead><tr><th>Jour</th><th>N° pièce</th><th>Journal</th><th>N° facture</th><th>N° compte général</th><th>N° compte tiers</th><th>Libellé écriture</th><th>Date échéance</th><th className="sd-num">Débit</th><th className="sd-num">Crédit</th></tr></thead>
                  <tbody>
                    {entryDraft.lines.map((line, index) => (
                      <tr key={`${line.accountCode}-${index}`} className={index === 0 ? "border-t-2 border-[var(--sd-border-strong)]" : undefined}>
                        {index === 0 && (
                          <>
                            <td rowSpan={entryDraft.lines.length}>{formatDate(entryDraft.date)}</td>
                            <td rowSpan={entryDraft.lines.length}><Badge>Brouillon</Badge></td>
                            <td rowSpan={entryDraft.lines.length}>{entryDraft.journal}</td>
                            <td rowSpan={entryDraft.lines.length}>{entryDraft.reference || "—"}</td>
                          </>
                        )}
                        <td>{line.accountCode} · {config.accounts.find((item) => item.code === line.accountCode)?.label ?? "Compte inconnu"}</td>
                        <td>{line.partnerId || "—"}</td>
                        <td>{line.label || entryDraft.label}</td>
                        <td>{line.dueDate ? formatDate(line.dueDate) : "—"}</td>
                        <td className="sd-num">{line.debit ? formatMoney(line.debit) : "—"}</td>
                        <td className="sd-num">{line.credit ? formatMoney(line.credit) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 rounded-xl border border-[var(--sd-border-strong)] bg-[var(--sd-brand-soft)] p-4 sm:grid-cols-3">
                <div><p className="sd-muted text-xs">Total débit</p><p className="sd-num font-semibold">{formatMoney(entryDraft.lines.reduce((total, line) => total + line.debit, 0))}</p></div>
                <div><p className="sd-muted text-xs">Total crédit</p><p className="sd-num font-semibold">{formatMoney(entryDraft.lines.reduce((total, line) => total + line.credit, 0))}</p></div>
                <div><p className="sd-muted text-xs">Solde à équilibrer</p><p className="sd-num font-semibold">{formatMoney(entryDraft.lines.reduce((total, line) => total + line.debit - line.credit, 0))}</p></div>
              </div>
            </section>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setShowEntryForm(false)}>Annuler</Button>
              <Button type="submit" variant="primary" icon={Plus} disabled={amount <= 0}>Valider et comptabiliser</Button>
            </div>
          </form>
        </Popup>
      )}

      {showImport && (
        <Popup title="Importer une facture électronique" wide onClose={() => { setShowImport(false); setShowJournal(true); }}>
          <div className="grid gap-4">
            <p className="sd-muted text-sm">Importez un XML UBL/CII, un PDF ou une image. L’OCR des documents visuels s’exécute dans ce navigateur ; le fichier n’est pas envoyé. Vérifiez les informations et les comptes proposés avant de comptabiliser.</p>
            <Field label="Fichier de facture">
              <input ref={fileInput} type="file" accept=".xml,.pdf,.png,.jpg,.jpeg,.webp,application/xml,text/xml,application/pdf,image/png,image/jpeg,image/webp" className="sd-input h-auto py-2" onChange={(event) => void readElectronicInvoice(event)} />
            </Field>
            {isImporting && <p role="status" className="sd-muted text-sm">Extraction de la facture… {ocrProgress > 0 ? `${Math.round(ocrProgress * 100)} %` : ""}</p>}
            {importError && <p role="alert" className="rounded-lg border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]">{importError}</p>}
            {importedInvoice && importedTotals && (
              <>
                <div className="grid gap-3 rounded-xl border border-[var(--sd-border)] bg-[var(--sd-surface-2)] p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <p className="sd-muted text-sm lg:col-span-3">Format détecté : <strong>{importedInvoice.sourceFormat ?? "XML"}</strong>. Les champs extraits restent modifiables et doivent être vérifiés.</p>
                  <Field label="Fournisseur"><TextInput required value={importedInvoice.supplierName} onChange={(event) => setImportedInvoice((current) => current ? { ...current, supplierName: event.target.value } : current)} /></Field>
                  <Field label="Identifiant / code fournisseur"><TextInput required value={importedInvoice.supplierId} onChange={(event) => setImportedInvoice((current) => current ? { ...current, supplierId: event.target.value } : current)} /></Field>
                  <Field label="N° facture"><TextInput required value={importedInvoice.number} onChange={(event) => setImportedInvoice((current) => current ? { ...current, number: event.target.value } : current)} /></Field>
                  <Field label="Date facture"><TextInput required type="date" value={importedInvoice.date} onChange={(event) => setImportedInvoice((current) => current ? { ...current, date: event.target.value } : current)} /></Field>
                  <Field label="Échéance"><TextInput required type="date" value={importedInvoice.dueDate} onChange={(event) => setImportedInvoice((current) => current ? { ...current, dueDate: event.target.value } : current)} /></Field>
                </div>
                {importedInvoice.warnings?.map((warning) => <p key={warning} className="rounded-lg border border-[var(--sd-warn)] bg-[var(--sd-warn-soft)] p-3 text-sm">{warning}</p>)}
                {importDuplicate && <p role="alert" className="rounded-lg border border-[var(--sd-warn)] bg-[var(--sd-warn-soft)] p-3 text-sm">Une facture fournisseur porte déjà cette référence dans le journal.</p>}
                {importTotalMismatch && <p role="alert" className="rounded-lg border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]">Le total TTC extrait ne correspond pas au calcul des lignes et de la TVA. Vérifiez la facture avant l’import.</p>}
                <div className="sd-table-wrap">
                  <table className="sd-table min-w-[900px]">
                    <thead><tr><th>Libellé</th><th className="sd-num">Montant HT</th><th>Taux TVA</th><th>Compte proposé · à vérifier</th><th><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>{importLines.map((line, index) => (
                      <tr key={`${index}-${line.label}`}>
                        <td><TextInput required aria-label={`Libellé ligne ${index + 1}`} value={line.label} onChange={(event) => setImportedInvoice((current) => current ? { ...current, lines: current.lines.map((item, lineIndex) => lineIndex === index ? { ...item, label: event.target.value } : item) } : current)} /></td>
                        <td><DecimalInput required min={1} aria-label={`Montant HT ligne ${index + 1}`} value={line.amountHT} onChange={(amountHT) => setImportedInvoice((current) => current ? { ...current, lines: current.lines.map((item, lineIndex) => lineIndex === index ? { ...item, amountHT } : item) } : current)} suffix="€" /></td>
                        <td>
                          <select className="sd-input" aria-label={`Taux de TVA ligne ${index + 1}`} value={line.taxCode} onChange={(event) => setImportTaxCodes((codes) => codes.map((code, i) => i === index ? event.target.value : code))}>
                            <option value="">Choisir un taux</option>
                            {config.vatCodes.map((vat) => <option key={vat.code} value={vat.code}>{vat.label}</option>)}
                          </select>
                        </td>
                        <td>
                          <select className="sd-input" aria-label={`Compte de charge ligne ${index + 1}`} value={line.account} onChange={(event) => setImportAccounts((accounts) => accounts.map((code, i) => i === index ? event.target.value : code))}>
                            <option value="">Choisir un compte</option>
                            {config.accounts.filter((item) => item.active && item.type === "expense").map((item) => <option key={item.code} value={item.code}>{item.code} · {item.label}</option>)}
                          </select>
                        </td>
                        <td><Button size="sm" variant="ghost" icon={Trash2} aria-label={`Supprimer la ligne ${index + 1}`} disabled={importLines.length === 1} onClick={() => {
                          setImportedInvoice((current) => current ? { ...current, lines: current.lines.filter((_, lineIndex) => lineIndex !== index) } : current);
                          setImportAccounts((accounts) => accounts.filter((_, lineIndex) => lineIndex !== index));
                          setImportTaxCodes((codes) => codes.filter((_, lineIndex) => lineIndex !== index));
                        }} /></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <Button icon={Plus} onClick={() => {
                  setImportedInvoice((current) => current ? { ...current, lines: [...current.lines, { label: "", amountHT: 0, taxRate: Number.NaN }] } : current);
                  setImportAccounts((accounts) => [...accounts, ""]);
                  setImportTaxCodes((codes) => [...codes, ""]);
                }}>Ajouter une ligne</Button>
                {importMissingFields && <p role="alert" className="rounded-lg border border-[var(--sd-warn)] bg-[var(--sd-warn-soft)] p-3 text-sm">Complétez le fournisseur, le numéro, les dates et chaque ligne avant de comptabiliser.</p>}
                {importInvalidLines && <p role="alert" className="rounded-lg border border-[var(--sd-warn)] bg-[var(--sd-warn-soft)] p-3 text-sm">Chaque ligne doit avoir un libellé, un montant positif, un taux de TVA et un compte de charge.</p>}
                {importedInvoice.totalTTC !== undefined && (
                  <Field label="Total TTC extrait">
                    <DecimalInput value={importedInvoice.totalTTC} onChange={(totalTTC) => setImportedInvoice((current) => current ? { ...current, totalTTC } : current)} suffix="€" />
                  </Field>
                )}
                <div className="grid gap-3 rounded-xl border border-[var(--sd-border-strong)] bg-[var(--sd-brand-soft)] p-4 text-sm sm:grid-cols-3">
                  <p>Total HT <strong className="ml-2">{formatMoney(importedTotals.ht)}</strong></p>
                  <p>TVA calculée <strong className="ml-2">{formatMoney(importedTotals.tax)}</strong></p>
                  <p>Total TTC extrait <strong className="ml-2">{importedInvoice.totalTTC === undefined ? "Non fourni" : formatMoney(importedInvoice.totalTTC)}</strong></p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button onClick={() => { setImportedInvoice(null); setImportError(""); if (fileInput.current) fileInput.current.value = ""; }}>Choisir un autre fichier</Button>
                  <Button variant="primary" icon={CheckCircle2} disabled={isValidatingImport || Boolean(importDuplicate) || importTotalMismatch || importMissingFields || importInvalidLines} onClick={() => void validateImportedInvoice()}>
                    {isValidatingImport ? "Validation…" : "Valider et comptabiliser"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Popup>
      )}

      {selectedEntry && (
        <Popup title={selectedEntry.number ? `Pièce ${selectedEntry.number}` : "Détail de la pièce"} wide onClose={() => setSelectedEntry(null)}>
          <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            <div><dt className="sd-muted">Journal</dt><dd className="font-semibold">{selectedEntry.journal}</dd></div>
            <div><dt className="sd-muted">Date</dt><dd className="font-semibold">{formatDate(selectedEntry.date)}</dd></div>
            <div><dt className="sd-muted">Référence</dt><dd className="font-semibold">{selectedEntry.reference || "—"}</dd></div>
            <div><dt className="sd-muted">Origine</dt><dd><Badge>{selectedEntry.source === "sphorix-connect" ? "Sphorix Connect" : selectedEntry.source === "electronic-invoice" ? "Facture importée" : selectedEntry.source === "manual" ? "Saisie manuelle" : "Non renseignée"}</Badge>{selectedEntry.sourceFormat && <span className="ml-2 sd-muted text-xs">{selectedEntry.sourceFormat}</span>}</dd></div>
            {selectedEntry.externalId && <div><dt className="sd-muted">Identifiant externe</dt><dd className="font-semibold">{selectedEntry.externalId}</dd></div>}
            <div><dt className="sd-muted">Statut</dt><dd><Badge tone={selectedEntry.status === "posted" ? "ok" : selectedEntry.status === "reversed" ? "warn" : "neutral"}>{selectedEntry.status === "posted" ? "Comptabilisée" : selectedEntry.status === "reversed" ? "Extournée" : "Brouillon"}</Badge></dd></div>
            <div className="sm:col-span-2"><dt className="sd-muted">Libellé</dt><dd className="font-semibold">{selectedEntry.label}</dd></div>
          </dl>
          <div className="sd-table-wrap mt-5">
            <table className="sd-table">
              <thead><tr><th>Compte</th><th>Libellé</th><th className="sd-num">Débit</th><th className="sd-num">Crédit</th></tr></thead>
              <tbody>{selectedEntry.lines.map((line, index) => (
                <tr key={`${line.accountCode}-${index}`}>
                  <td>{line.accountCode} · {config.accounts.find((account) => account.code === line.accountCode)?.label ?? "Compte inconnu"}</td>
                  <td>{line.label || selectedEntry.label}</td>
                  <td className="sd-num">{formatMoney(line.debit)}</td>
                  <td className="sd-num">{formatMoney(line.credit)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {selectedEntry.status === "draft" && (
            <div className="mt-5 flex justify-end">
              <Button variant="primary" icon={CheckCircle2} onClick={() => void onApproveDraft(selectedEntry).then((posted) => { if (posted) setSelectedEntry(null); })}>Valider et comptabiliser le brouillon</Button>
            </div>
          )}
        </Popup>
      )}

    </>
  );
}

function Popup({ title, children, wide = false, onClose, contentClassName }: { title: string; children: ReactNode; wide?: boolean; onClose: () => void; contentClassName?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog ref={dialogRef} onClose={onClose} className={`sd-dialog max-h-[90vh] overflow-y-auto ${wide ? "sd-dialog-wide" : ""}`}>
      <header className="flex items-center justify-between gap-4 border-b border-[var(--sd-border)] px-5 py-4">
        <h2 className="sd-h2">{title}</h2>
        <Button variant="ghost" size="sm" icon={X} aria-label="Fermer la fenêtre" onClick={() => dialogRef.current?.close()} />
      </header>
      <div className={`sd-dialog-content p-5 ${wide ? "sd-dialog-content-wide" : ""} ${contentClassName ?? ""}`}>{children}</div>
      <footer className="flex justify-end px-5 pb-5">
        <Button onClick={() => dialogRef.current?.close()}>Fermer</Button>
      </footer>
    </dialog>
  );
}

function Tax({ pilot, onClose }: { pilot: Pilot; onClose: () => void }) {
  const rows = pilot.vat.byCode.filter((r) => r.base !== 0);
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi icon="fiscalite" label="TVA collectée" value={formatMoney(pilot.vat.collected)} />
        <Kpi icon="fiscalite" label="TVA déductible" value={formatMoney(pilot.vat.deductible)} />
        <Kpi icon="fiscalite" label={pilot.vat.payable >= 0 ? "TVA à décaisser" : "Crédit de TVA"} value={formatMoney(Math.abs(pilot.vat.payable))} tone={pilot.vat.payable > 0 ? "warn" : "ok"} />
      </div>
      <Card title="Bases par taux" flush>
        {rows.length === 0 ? <EmptyState icon="fiscalite" title="Aucune base de TVA" text="Elles apparaissent dès qu'une facture est comptabilisée." /> : (
          <div className="sd-table-wrap">
            <table className="sd-table">
              <thead><tr><th>Taux</th><th className="sd-num">Base HT</th><th className="sd-num">TVA théorique</th></tr></thead>
              <tbody>{rows.map((r) => <tr key={r.code}><td>{r.code}</td><td className="sd-num">{formatMoney(r.base)}</td><td className="sd-num">{formatMoney(r.theoretical)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </Card>
      <Card title="Impôt sur les sociétés">
        <p className="sd-muted text-sm">Résultat avant impôt : <strong>{formatMoney(pilot.income.preTaxResult)}</strong> · Impôt estimé : <strong>{formatMoney(pilot.kpis.estimatedCorporateTax)}</strong></p>
        <div className="mt-3"><Button variant="primary" onClick={() => { if (window.confirm("Constater l'impôt de l'exercice ? Une écriture sera comptabilisée.")) onClose(); }}>Constater l&apos;impôt de l&apos;exercice</Button></div>
      </Card>
    </>
  );
}

function Controlling({ pilot, config, onBudget }: { pilot: Pilot; config: FinanceConfig; onBudget: (budget: Budget) => void }) {
  const [center, setCenter] = useState(config.costCenters[0]?.code ?? "");
  const [period, setPeriod] = useState(todayISO().slice(0, 7));
  const [amount, setAmount] = useState(0);
  return (
    <>
      <Card title="Réalisé et budget par centre" flush>
        {pilot.centers.length === 0 ? <EmptyState icon="gestion" title="Aucun centre" text="Ajoutez des centres de coûts dans le paramétrage." /> : (
          <div className="sd-table-wrap">
            <table className="sd-table">
              <thead><tr><th>Centre</th><th className="sd-num">Produits</th><th className="sd-num">Charges</th><th className="sd-num">Résultat</th><th className="sd-num">Budget</th><th className="sd-num">Écart</th></tr></thead>
              <tbody>
                {pilot.centers.map((c) => (
                  <tr key={c.costCenter}>
                    <td>{c.label}</td>
                    <td className="sd-num">{formatMoney(c.revenue)}</td>
                    <td className="sd-num">{formatMoney(c.costs)}</td>
                    <td className="sd-num">{formatMoney(c.result)}</td>
                    <td className="sd-num">{formatMoney(c.budget)}</td>
                    <td className="sd-num" style={c.budget > 0 && c.variance > 0 && c.kind === "cost" ? { color: "var(--sd-danger)" } : undefined}>{formatMoney(c.variance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card title="Définir un budget mensuel">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); onBudget({ costCenter: center, accountPrefix: "6", period, amount }); setAmount(0); }}>
          <Field label="Centre de coûts">
            <select className="sd-input" value={center} onChange={(e) => setCenter(e.target.value)}>{config.costCenters.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}</select>
          </Field>
          <Field label="Mois"><TextInput type="month" value={period} onChange={(e) => setPeriod(e.target.value)} /></Field>
          <Field label="Montant"><DecimalInput value={amount} onChange={setAmount} suffix="€" /></Field>
          <div className="flex items-end"><Button type="submit" variant="primary" disabled={amount <= 0}>Enregistrer</Button></div>
        </form>
      </Card>
    </>
  );
}

function Settings({ config, onSave, onReset }: { config: FinanceConfig; onSave: (config: FinanceConfig) => void; onReset: () => void }) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<AccountType>("expense");
  const [centerCode, setCenterCode] = useState("");
  const [centerLabel, setCenterLabel] = useState("");
  const [lockMonth, setLockMonth] = useState(todayISO().slice(0, 7));
  return (
    <>
      <Card title="Société et exercice">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Raison sociale"><TextInput defaultValue={config.companyName} onBlur={(e) => onSave({ ...config, companyName: e.target.value || config.companyName })} /></Field>
          <Field label="Premier mois de l'exercice">
            <select className="sd-input" value={config.fiscalYearStartMonth} onChange={(e) => onSave({ ...config, fiscalYearStartMonth: Number(e.target.value) })}>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(new Date(2024, i, 1))}</option>)}
            </select>
          </Field>
          <Field label="Format de numérotation" hint="Variables : {JNL} journal, {YYYY} année, {SEQ} séquence"><TextInput defaultValue={config.numberPattern} onBlur={(e) => onSave({ ...config, numberPattern: e.target.value })} /></Field>
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Compte personnalisé">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onSave(upsertAccount(config, { code, label, type, requiresCostCenter: type === "expense" })); setCode(""); setLabel(""); }}>
            <Field label="Numéro" hint="3 à 10 chiffres, ex. 706100"><TextInput required pattern="\d{3,10}" value={code} onChange={(e) => setCode(e.target.value)} /></Field>
            <Field label="Nature">
              <select className="sd-input" value={type} onChange={(e) => setType(e.target.value as AccountType)}>{accountTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
            </Field>
            <Field label="Libellé" className="md:col-span-2"><TextInput required value={label} onChange={(e) => setLabel(e.target.value)} /></Field>
            <div><Button type="submit" variant="primary" icon={Plus}>Ajouter le compte</Button></div>
          </form>
        </Card>
        <Card title="Centre de coûts">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onSave({ ...config, costCenters: [...config.costCenters, { code: centerCode, label: centerLabel, kind: "cost", active: true }] }); setCenterCode(""); setCenterLabel(""); }}>
            <Field label="Code"><TextInput required value={centerCode} onChange={(e) => setCenterCode(e.target.value.toUpperCase())} /></Field>
            <Field label="Libellé"><TextInput required value={centerLabel} onChange={(e) => setCenterLabel(e.target.value)} /></Field>
            <div><Button type="submit" variant="primary" icon={Plus}>Ajouter le centre</Button></div>
          </form>
        </Card>
      </div>
      <Card title="Clôture et données">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Clôturer la période"><TextInput type="month" value={lockMonth} onChange={(e) => setLockMonth(e.target.value)} /></Field>
          <Button icon={Lock} onClick={() => { if (window.confirm(`Clôturer ${lockMonth} ? Plus aucune écriture ne pourra y être passée.`)) onSave(lockPeriod(config, lockMonth)); }}>Clôturer</Button>
          <span className="sd-muted text-xs">Périodes clôturées : {config.lockedPeriods.join(", ") || "aucune"}</span>
          <Button className="ml-auto" variant="danger" icon={Trash2} onClick={() => { if (window.confirm("Effacer toutes les données comptables locales ? Cette action est définitive.")) onReset(); }}>Réinitialiser les données</Button>
        </div>
      </Card>
    </>
  );
}
