"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileUp, Lock, Plus, Printer, RotateCcw, Trash2, Undo2, X, XCircle } from "lucide-react";

import { lockPeriod, upsertAccount } from "@/lib/finance/config";
import { financeDb, loadFinance, saveBudget, saveConfig, saveEntries } from "@/lib/finance/db";
import { buildPayment, buildPurchaseInvoice, buildSalesInvoice } from "@/lib/finance/documents";
import { extractInvoiceFromFile, parseElectronicInvoiceXml, type ElectronicInvoice } from "@/lib/finance/einvoice";
import { autoMatch } from "@/lib/finance/echeancier-gestion";
import { accountsInLedgerRange, fiscalYearOf, generalLedgerByAccounts, postEntry, reverseEntry, trialBalance } from "@/lib/finance/ledger";
import { buildPilotage } from "@/lib/finance/pilotage";
import { balanceSheet, closingTaxEntry, incomeStatement } from "@/lib/finance/reports";
import type { AccountType, Budget, FinanceConfig, JournalCode, JournalEntry } from "@/lib/finance/types";
import { formatDate, formatMoney, formatPercent, todayISO } from "@/lib/suite/format";

import { Badge, Button, Card, DecimalInput, EmptyState, Field, Kpi, PageHeader, Tabs, TextInput } from "@/components/suite/ui";

type Tab = "pilotage" | "ecritures" | "grand-livre" | "balance" | "bilan" | "resultat" | "fiscalite" | "gestion" | "parametrage";
const tabs: { id: Tab; label: string }[] = [
  { id: "pilotage", label: "Tableau de bord" },
  { id: "ecritures", label: "Journal" },
  { id: "grand-livre", label: "Grand livre" },
  { id: "balance", label: "Balance" },
  { id: "bilan", label: "Bilan comptable" },
  { id: "resultat", label: "Compte de résultat" },
  { id: "fiscalite", label: "TVA et impôts" },
  { id: "gestion", label: "Centres et budgets" },
  { id: "parametrage", label: "Paramétrage" },
];
const accountingTabs = tabs.filter((item) => ["ecritures", "grand-livre", "balance", "bilan", "resultat"].includes(item.id));

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
        icon={["ecritures", "grand-livre", "balance", "bilan", "resultat"].includes(tab) ? "compta" : tab === "fiscalite" ? "fiscalite" : "gestion"}
        eyebrow={["ecritures", "grand-livre", "balance", "bilan", "resultat"].includes(tab) ? "Comptabilité" : tab === "fiscalite" ? "Fiscalité" : "Gestion & Finance"}
        title={tab === "ecritures" ? "Journal comptable" : tab === "grand-livre" ? "Grand livre" : tab === "balance" ? "Balance générale" : tab === "bilan" ? "Bilan comptable" : tab === "resultat" ? "Compte de résultat" : config.companyName}
        description={`${config.companyName} · Exercice ${pilot.fiscalYear.label} : du ${formatDate(pilot.fiscalYear.start)} au ${formatDate(pilot.fiscalYear.end)}`}
      />
      <Tabs tabs={initialTab === "ecritures" ? accountingTabs : tabs} value={tab} onChange={setTab} label={initialTab === "ecritures" ? "Vues comptables" : "Sections du pilotage"} />
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
      {tab === "grand-livre" && <GeneralLedger entries={entries} config={config} />}
      {tab === "balance" && <TrialBalance entries={entries} config={config} from={pilot.fiscalYear.start} to={asOf} />}
      {tab === "bilan" && <BalanceSheet entries={entries} config={config} asOf={asOf} />}
      {tab === "resultat" && <IncomeStatement entries={entries} config={config} from={pilot.fiscalYear.start} to={asOf} />}
      {tab === "fiscalite" && <Tax pilot={pilot} onClose={() => { const draft = closingTaxEntry(entries, config, pilot.fiscalYear.end, crypto.randomUUID()); if (!draft) { setNotice(""); return setMessage("Aucun impôt à constater."); } void post(draft); }} />}
      {tab === "gestion" && <Controlling pilot={pilot} config={config} onBudget={(budget) => run(() => saveBudget(budget).then(() => undefined), "Budget enregistré.")} />}
      {tab === "parametrage" && (
        <Settings
          config={config}
          onSave={(next) => run(async () => { await saveConfig(next); }, "Paramètres enregistrés.")}
          onReset={() => run(async () => { await Promise.all([financeDb.entries.clear(), financeDb.budgets.clear(), financeDb.config.clear(), financeDb.customers.clear(), financeDb.quotes.clear(), financeDb.invoices.clear(), financeDb.products.clear()]); }, "Données effacées.")}
        />
      )}
    </main>
  );
}

function GeneralLedger({ entries, config }: { entries: JournalEntry[]; config: FinanceConfig }) {
  const activeAccounts = useMemo(() => config.accounts.filter((account) => account.active), [config.accounts]);
  const period = fiscalYearOf(todayISO(), config.fiscalYearStartMonth);
  const [from, setFrom] = useState(period.start);
  const [to, setTo] = useState(todayISO());
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState<AccountType | "all">("all");
  const [rangeMode, setRangeMode] = useState<"root" | "account">("root");
  const [rootFrom, setRootFrom] = useState("1");
  const [rootTo, setRootTo] = useState("9");
  const [accountFrom, setAccountFrom] = useState(activeAccounts[0]?.code.slice(0, 3) ?? "");
  const [accountTo, setAccountTo] = useState(activeAccounts.at(-1)?.code.slice(0, 3) ?? "");
  const [selectedAccountCodes, setSelectedAccountCodes] = useState<string[] | null>(null);
  const [accountSearch, setAccountSearch] = useState("");
  const [detailAccountCode, setDetailAccountCode] = useState<string | null>(null);
  const rootOptions = [...new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", ...activeAccounts.map((account) => account.code[0])])]
    .sort((left, right) => left.localeCompare(right));
  const validRange = rangeMode === "root"
    ? /^[1-9]$/.test(rootFrom) && /^[1-9]$/.test(rootTo) && rootFrom <= rootTo
    : /^\d{3,10}$/.test(accountFrom) && /^\d{3,10}$/.test(accountTo)
      && accountFrom.padEnd(10, "0") <= accountTo.padEnd(10, "9");
  const rangeAccounts = useMemo(() => validRange
    ? accountsInLedgerRange(activeAccounts, rangeMode === "root"
      ? { mode: "root", from: rootFrom, to: rootTo }
      : { mode: "account", from: accountFrom, to: accountTo })
    : [], [activeAccounts, accountFrom, accountTo, rangeMode, rootFrom, rootTo, validRange]);
  const categoryAccounts = rangeAccounts.filter((account) => accountType === "all" || account.type === accountType);
  const selectedAccounts = selectedAccountCodes === null
    ? categoryAccounts
    : categoryAccounts.filter((account) => selectedAccountCodes.includes(account.code));
  const validPeriod = from <= to;
  const accountLedgers = useMemo(() => {
    if (!validPeriod || !validRange) return [];
    const accounts = rangeAccounts.filter((account) => (accountType === "all" || account.type === accountType)
      && (selectedAccountCodes === null || selectedAccountCodes.includes(account.code)));
    const ledgers = new Map(generalLedgerByAccounts(entries, accounts.map((account) => account.code), from, to)
      .map((ledger) => [ledger.accountCode, ledger]));
    return accounts.map((account) => ({
      account,
      ...(ledgers.get(account.code) ?? { rows: [], openingBalance: 0, closingBalance: 0 }),
    }));
  }, [accountType, entries, from, rangeAccounts, selectedAccountCodes, to, validPeriod, validRange]);
  const summaryRows = accountLedgers.filter(({ rows, openingBalance }) => (
    rows.length > 0 || openingBalance !== 0 || selectedAccountCodes !== null
  ));
  const chronologicalRows = accountLedgers.flatMap(({ account, rows }) => rows.map((row) => ({
    ...row,
    accountCode: account.code,
    accountLabel: account.label,
  }))).sort((left, right) => left.date.localeCompare(right.date)
    || left.accountCode.localeCompare(right.accountCode)
    || (left.number ?? "").localeCompare(right.number ?? ""));
  const needle = search.trim().toLocaleLowerCase("fr");
  const visibleRows = chronologicalRows.filter((row) => !needle || `${row.accountCode} ${row.accountLabel} ${row.number ?? ""} ${row.label} ${row.partnerId ?? ""} ${row.costCenter ?? ""}`.toLocaleLowerCase("fr").includes(needle));
  const totalDebit = chronologicalRows.reduce((total, row) => total + row.debit, 0);
  const totalCredit = chronologicalRows.reduce((total, row) => total + row.credit, 0);
  const detailLedger = accountLedgers.find(({ account }) => account.code === detailAccountCode);
  const visibleAccounts = categoryAccounts.filter((account) => (
    `${account.code} ${account.label}`.toLocaleLowerCase("fr").includes(accountSearch.trim().toLocaleLowerCase("fr"))
  ));
  const allVisibleAccountsSelected = selectedAccountCodes === null
    || categoryAccounts.every((account) => selectedAccountCodes.includes(account.code));
  const setVisibleAccountsSelected = (selected: boolean) => {
    const next = new Set(selectedAccountCodes ?? categoryAccounts.map((account) => account.code));
    for (const account of visibleAccounts) {
      if (selected) next.add(account.code);
      else next.delete(account.code);
    }
    const nextCodes = [...next];
    setSelectedAccountCodes(categoryAccounts.length > 0 && categoryAccounts.every((account) => next.has(account.code)) ? null : nextCodes);
  };

  return (
    <>
      <Card title="Critères de consultation" actions={<Badge>{activeAccounts.length} comptes actifs</Badge>}>
        <div className="sd-ledger-filters">
          <Field label="Catégorie de comptes">
            <select className="sd-input" value={accountType} onChange={(event) => { setAccountType(event.target.value as AccountType | "all"); setSelectedAccountCodes(null); }}>
              <option value="all">Toutes les catégories</option>
              {accountTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </Field>
          <Field label="Période · du"><TextInput type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></Field>
          <Field label="Période · au"><TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} /></Field>
          <div className="sd-ledger-range">
            <Field label="Affichage des comptes">
              <select
                className="sd-input"
                value={rangeMode}
                onChange={(event) => { setRangeMode(event.target.value as "root" | "account"); setSelectedAccountCodes(null); }}
              >
                <option value="root">Par racine</option>
                <option value="account">Par compte</option>
              </select>
            </Field>
            {rangeMode === "root" ? (
              <>
                <Field label="Racine de">
                  <select className="sd-input" value={rootFrom} onChange={(event) => { setRootFrom(event.target.value); setSelectedAccountCodes(null); }}>
                    {rootOptions.map((root) => <option key={root} value={root}>{root}</option>)}
                  </select>
                </Field>
                <Field label="Racine à">
                  <select className="sd-input" value={rootTo} onChange={(event) => { setRootTo(event.target.value); setSelectedAccountCodes(null); }}>
                    {rootOptions.map((root) => <option key={root} value={root}>{root}</option>)}
                  </select>
                </Field>
              </>
            ) : (
              <>
                <Field label="Compte de">
                  <TextInput inputMode="numeric" maxLength={10} placeholder="101" value={accountFrom} onChange={(event) => { setAccountFrom(event.target.value.replace(/\D/g, "")); setSelectedAccountCodes(null); }} />
                </Field>
                <Field label="Compte à">
                  <TextInput inputMode="numeric" maxLength={10} placeholder="512" value={accountTo} onChange={(event) => { setAccountTo(event.target.value.replace(/\D/g, "")); setSelectedAccountCodes(null); }} />
                </Field>
              </>
            )}
            <p className="sd-ledger-range-hint">
              {rangeMode === "root"
                ? "Inclut toutes les racines entre les bornes, par exemple 1 à 5."
                : "Saisissez les préfixes de comptes à inclure, par exemple 101 à 512."}
            </p>
          </div>
          <details className="sd-account-picker" open>
            <summary>Comptes · {selectedAccounts.length} sélectionné{selectedAccounts.length > 1 ? "s" : ""}</summary>
            <div className="sd-account-picker-panel">
              <TextInput type="search" aria-label="Rechercher un compte" placeholder="N° ou nom du compte…" value={accountSearch} onChange={(event) => setAccountSearch(event.target.value)} />
              <div className="sd-account-picker-actions">
                <button type="button" onClick={() => setVisibleAccountsSelected(true)}>Tout sélectionner</button>
                <button type="button" onClick={() => setVisibleAccountsSelected(false)}>Tout désélectionner</button>
              </div>
              <div className="sd-account-picker-list">
                {visibleAccounts.map((account) => {
                  const checked = selectedAccounts.some((item) => item.code === account.code);
                  return (
                    <label key={account.code}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const next = new Set(selectedAccountCodes ?? categoryAccounts.map((item) => item.code));
                          if (event.target.checked) next.add(account.code);
                          else next.delete(account.code);
                          const nextCodes = [...next];
                          setSelectedAccountCodes(categoryAccounts.length > 0 && categoryAccounts.every((item) => next.has(item.code)) ? null : nextCodes);
                        }}
                      />
                      <span><strong>{account.code}</strong> · {account.label}</span>
                    </label>
                  );
                })}
              </div>
              {selectedAccountCodes === null && <span className="sd-account-picker-hint">Tous les comptes de la catégorie sont inclus.</span>}
              {selectedAccountCodes !== null && !allVisibleAccountsSelected && selectedAccounts.length === 0 && <span className="sd-account-picker-hint">Sélectionnez au moins un compte.</span>}
            </div>
          </details>
        </div>
      </Card>
      {!validRange ? <p className="rounded-xl border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]" role="alert">Vérifiez les bornes de la plage de comptes sélectionnée.</p> : !validPeriod ? <p className="rounded-xl border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]" role="alert">La date de début doit précéder la date de fin.</p> : (
        <>
          <Card title="Soldes par compte" flush actions={<Button size="sm" icon={Printer} className="sd-noprint" onClick={() => window.print()}>Imprimer</Button>}>
            {summaryRows.length === 0 ? <EmptyState icon="compta" title="Aucun solde sur cette sélection" text="Aucune écriture comptabilisée ne correspond à la période, à la catégorie et aux comptes choisis." /> : (
              <div className="sd-table-wrap">
                <table className="sd-table min-w-[900px] sd-ledger-table sd-ledger-account-table">
                  <thead><tr><th>Compte</th><th>Catégorie</th><th className="sd-num">Solde antérieur</th><th className="sd-num">Débit période</th><th className="sd-num">Crédit période</th><th className="sd-num">Solde au {formatDate(to)}</th></tr></thead>
                  <tbody>{summaryRows.map(({ account, rows, openingBalance, closingBalance }) => (
                    <tr key={account.code}>
                      <td><span className="sd-ledger-account-label"><strong>{account.code}</strong> · {account.label}</span></td>
                      <td>{accountTypes.find((item) => item.value === account.type)?.label ?? account.type}</td>
                      <td className="sd-num">{formatMoney(openingBalance)}</td>
                      <td className="sd-num">{formatMoney(rows.reduce((total, row) => total + row.debit, 0))}</td>
                      <td className="sd-num">{formatMoney(rows.reduce((total, row) => total + row.credit, 0))}</td>
                      <td className="sd-num"><button type="button" className="sd-ledger-balance-button" aria-label={`Consulter le détail du solde du compte ${account.code}`} onClick={() => setDetailAccountCode(account.code)}>{formatMoney(closingBalance)}</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </Card>
          {detailLedger && (
            <Card title={`Détail du compte · ${detailLedger.account.code} · ${detailLedger.account.label}`} flush actions={<Badge>{accountTypes.find((item) => item.value === detailLedger.account.type)?.label ?? detailLedger.account.type}</Badge>}>
              <div className="sd-ledger-detail-balances">
                <span>Solde antérieur <strong>{formatMoney(detailLedger.openingBalance)}</strong></span>
                <span>Solde au {formatDate(to)} <strong>{formatMoney(detailLedger.closingBalance)}</strong></span>
              </div>
              <LedgerMovementTable rows={visibleRows.filter((row) => row.accountCode === detailLedger.account.code)} emptyText="Aucun mouvement ne correspond à la recherche pour ce compte." />
            </Card>
          )}
          <Card title="Toutes les écritures de la sélection" flush actions={<Badge>{visibleRows.length} mouvement{visibleRows.length === 1 ? "" : "s"}</Badge>}>
            <div className="sd-ledger-toolbar">
              <Field label="Rechercher dans les mouvements">
                <TextInput type="search" aria-label="Rechercher dans les mouvements" placeholder="Compte, pièce, libellé, tiers…" value={search} onChange={(event) => setSearch(event.target.value)} />
              </Field>
              <p className="sd-muted text-xs" role="status">{visibleRows.length} mouvement{visibleRows.length === 1 ? "" : "s"} affiché{visibleRows.length === 1 ? "" : "s"}</p>
            </div>
            <LedgerMovementTable rows={visibleRows} emptyText="Aucun mouvement ne correspond à la recherche." showAccount totals={{ debit: totalDebit, credit: totalCredit }} />
          </Card>
        </>
      )}
    </>
  );
}

type LedgerMovement = ReturnType<typeof generalLedgerByAccounts>[number]["rows"][number] & { accountCode: string; accountLabel: string };

function LedgerMovementTable({
  rows,
  emptyText,
  showAccount = false,
  totals,
}: {
  rows: LedgerMovement[];
  emptyText: string;
  showAccount?: boolean;
  totals?: { debit: number; credit: number };
}) {
  return (
    <div className="sd-table-wrap">
      <table className="sd-table min-w-[820px] sd-ledger-table">
        <thead><tr>{showAccount && <th>Compte</th>}<th>Date</th><th>N° pièce</th><th>Libellé</th><th>Tiers</th><th className="sd-num">Débit</th><th className="sd-num">Crédit</th><th className="sd-num">Solde progressif</th></tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={showAccount ? 8 : 7} className="py-8 text-center sd-muted">{emptyText}</td></tr>
          ) : (
            rows.map((row, index) => (
            <tr key={`${row.accountCode}-${row.number ?? row.date}-${index}`}>
              {showAccount && <td><strong>{row.accountCode}</strong> · {row.accountLabel}</td>}
              <td>{formatDate(row.date)}</td><td className="font-semibold">{row.number ?? "—"}</td><td>{row.label}</td><td>{row.partnerId ?? "—"}</td>
              <td className="sd-num">{row.debit ? formatMoney(row.debit) : "—"}</td><td className="sd-num">{row.credit ? formatMoney(row.credit) : "—"}</td><td className="sd-num font-semibold">{formatMoney(row.balance)}</td>
            </tr>
            ))
          )}
        </tbody>
        {totals && <tfoot><tr><td colSpan={showAccount ? 5 : 4}>Totaux de la période</td><td className="sd-num">{formatMoney(totals.debit)}</td><td className="sd-num">{formatMoney(totals.credit)}</td><td /></tr></tfoot>}
      </table>
    </div>
  );
}

function TrialBalance({ entries, config, from, to }: { entries: JournalEntry[]; config: FinanceConfig; from: string; to: string }) {
  const [periodFrom, setPeriodFrom] = useState(from);
  const [periodTo, setPeriodTo] = useState(to);
  const [accountType, setAccountType] = useState<AccountType | "all">("all");
  const [rangeMode, setRangeMode] = useState<"root" | "account">("root");
  const [rootFrom, setRootFrom] = useState("1");
  const [rootTo, setRootTo] = useState("9");
  const [accountFrom, setAccountFrom] = useState(config.accounts[0]?.code.slice(0, 3) ?? "");
  const [accountTo, setAccountTo] = useState(config.accounts.at(-1)?.code.slice(0, 3) ?? "");
  const [search, setSearch] = useState("");
  const rootOptions = [...new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", ...config.accounts.map((account) => account.code[0])])]
    .sort((left, right) => left.localeCompare(right));
  const validRange = rangeMode === "root"
    ? /^[1-9]$/.test(rootFrom) && /^[1-9]$/.test(rootTo) && rootFrom <= rootTo
    : /^\d{3,10}$/.test(accountFrom) && /^\d{3,10}$/.test(accountTo)
      && accountFrom.padEnd(10, "0") <= accountTo.padEnd(10, "9");
  const rangeAccounts = useMemo(() => validRange
    ? accountsInLedgerRange(config.accounts, rangeMode === "root"
      ? { mode: "root", from: rootFrom, to: rootTo }
      : { mode: "account", from: accountFrom, to: accountTo })
    : [], [accountFrom, accountTo, config.accounts, rangeMode, rootFrom, rootTo, validRange]);
  const validPeriod = periodFrom <= periodTo;
  const result = useMemo(() => validPeriod ? trialBalance(entries, config, periodFrom, periodTo) : null, [entries, config, periodFrom, periodTo, validPeriod]);
  const accountByCode = useMemo(() => new Map(config.accounts.map((account) => [account.code, account])), [config.accounts]);
  const needle = search.trim().toLocaleLowerCase("fr");
  const rows = (result?.rows ?? []).filter((row) => {
    const account = accountByCode.get(row.code);
    const inRange = rangeAccounts.some((item) => item.code === row.code);
    const inCategory = account && (accountType === "all" || account.type === accountType);
    const hasBalance = row.openingBalance !== 0 || row.debit !== 0 || row.credit !== 0;
    const matchesSearch = !needle || `${row.code} ${row.label}`.toLocaleLowerCase("fr").includes(needle);
    return inRange && inCategory && hasBalance && matchesSearch;
  });
  const totals = {
    openingDebit: rows.reduce((sum, row) => sum + Math.max(row.openingBalance, 0), 0),
    openingCredit: rows.reduce((sum, row) => sum + Math.max(-row.openingBalance, 0), 0),
    debit: rows.reduce((sum, row) => sum + row.debit, 0),
    credit: rows.reduce((sum, row) => sum + row.credit, 0),
    closingDebit: rows.reduce((sum, row) => sum + Math.max(row.closingBalance, 0), 0),
    closingCredit: rows.reduce((sum, row) => sum + Math.max(-row.closingBalance, 0), 0),
  };
  return (
    <>
      <Card title="Critères de consultation" actions={<Badge>{config.accounts.filter((account) => account.active).length} comptes actifs</Badge>}>
        <div className="sd-ledger-filters">
          <Field label="Catégorie de comptes">
            <select className="sd-input" value={accountType} onChange={(event) => setAccountType(event.target.value as AccountType | "all")}>
              <option value="all">Toutes les catégories</option>
              {accountTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </Field>
          <Field label="Période · du"><TextInput type="date" value={periodFrom} onChange={(event) => setPeriodFrom(event.target.value)} /></Field>
          <Field label="Période · au"><TextInput type="date" value={periodTo} onChange={(event) => setPeriodTo(event.target.value)} /></Field>
          <div className="sd-ledger-range">
            <Field label="Affichage des comptes">
              <select className="sd-input" value={rangeMode} onChange={(event) => setRangeMode(event.target.value as "root" | "account")}>
                <option value="root">Par racine</option>
                <option value="account">Par compte</option>
              </select>
            </Field>
            {rangeMode === "root" ? (
              <>
                <Field label="Racine de">
                  <select className="sd-input" value={rootFrom} onChange={(event) => setRootFrom(event.target.value)}>
                    {rootOptions.map((root) => <option key={root} value={root}>{root}</option>)}
                  </select>
                </Field>
                <Field label="Racine à">
                  <select className="sd-input" value={rootTo} onChange={(event) => setRootTo(event.target.value)}>
                    {rootOptions.map((root) => <option key={root} value={root}>{root}</option>)}
                  </select>
                </Field>
              </>
            ) : (
              <>
                <Field label="Compte de">
                  <TextInput inputMode="numeric" maxLength={10} placeholder="101" value={accountFrom} onChange={(event) => setAccountFrom(event.target.value.replace(/\D/g, ""))} />
                </Field>
                <Field label="Compte à">
                  <TextInput inputMode="numeric" maxLength={10} placeholder="512" value={accountTo} onChange={(event) => setAccountTo(event.target.value.replace(/\D/g, ""))} />
                </Field>
              </>
            )}
            <p className="sd-ledger-range-hint">
              {rangeMode === "root"
                ? "Inclut les comptes des racines sélectionnées, par exemple de 1 à 5."
                : "Saisissez les préfixes des comptes, par exemple de 101 à 512."}
            </p>
          </div>
        </div>
      </Card>
      {!validRange ? (
        <p className="rounded-xl border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]" role="alert">Vérifiez les bornes de la plage de comptes sélectionnée.</p>
      ) : !validPeriod ? (
        <p className="rounded-xl border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]" role="alert">La date de début doit précéder la date de fin.</p>
      ) : (
        <Card
          title="Balance générale"
          flush
          actions={<><Badge>{rows.length} compte{rows.length === 1 ? "" : "s"} affiché{rows.length === 1 ? "" : "s"}</Badge><Button size="sm" icon={Printer} className="sd-noprint" onClick={() => window.print()}>Imprimer</Button></>}
        >
          <p className="sd-muted px-4 pt-4 text-sm">Situation du {formatDate(periodFrom)} au {formatDate(periodTo)} · écritures comptabilisées uniquement. Les totaux reflètent les comptes affichés.</p>
          <div className="sd-ledger-toolbar">
            <Field label="Rechercher un compte">
              <TextInput type="search" aria-label="Rechercher un compte" placeholder="N° ou intitulé du compte…" value={search} onChange={(event) => setSearch(event.target.value)} />
            </Field>
            <p className="sd-muted text-xs" role="status">{rows.length} ligne{rows.length === 1 ? "" : "s"} de compte</p>
          </div>
          {rows.length === 0 ? <EmptyState icon="compta" title="Aucun compte avec mouvement" text="Aucune écriture comptabilisée ne correspond à cette période et à cette sélection." /> : (
            <div className="sd-table-wrap">
              <table className="sd-table min-w-[1050px] sd-ledger-table sd-trial-balance-table">
                <thead>
                  <tr><th rowSpan={2}>Compte</th><th rowSpan={2}>Intitulé</th><th colSpan={2} className="sd-th-group">Solde initial</th><th colSpan={2} className="sd-th-group">Mouvements de la période</th><th colSpan={2} className="sd-th-group">Solde final</th></tr>
                  <tr><th className="sd-num">Débit</th><th className="sd-num">Crédit</th><th className="sd-num">Débit</th><th className="sd-num">Crédit</th><th className="sd-num">Débiteur</th><th className="sd-num">Créditeur</th></tr>
                </thead>
                <tbody>{rows.map((row) => {
                  const account = accountByCode.get(row.code);
                  return (
                    <tr key={row.code}>
                      <td className="font-semibold">{row.code}</td>
                      <td>{row.label}{account && !account.active && <span className="sd-ledger-inactive"> · inactif</span>}</td>
                      <td className="sd-num">{row.openingBalance > 0 ? formatMoney(row.openingBalance) : "—"}</td>
                      <td className="sd-num">{row.openingBalance < 0 ? formatMoney(-row.openingBalance) : "—"}</td>
                      <td className="sd-num">{row.debit ? formatMoney(row.debit) : "—"}</td>
                      <td className="sd-num">{row.credit ? formatMoney(row.credit) : "—"}</td>
                      <td className="sd-num">{row.closingBalance > 0 ? formatMoney(row.closingBalance) : row.closingBalance === 0 ? formatMoney(0) : "—"}</td>
                      <td className="sd-num">{row.closingBalance < 0 ? formatMoney(-row.closingBalance) : "—"}</td>
                    </tr>
                  );
                })}</tbody>
                <tfoot>
                  <tr><td colSpan={2}>Totaux de la sélection</td>
                    <td className="sd-num">{formatMoney(totals.openingDebit)}</td><td className="sd-num">{formatMoney(totals.openingCredit)}</td>
                    <td className="sd-num">{formatMoney(totals.debit)}</td><td className="sd-num">{formatMoney(totals.credit)}</td>
                    <td className="sd-num">{formatMoney(totals.closingDebit)}</td><td className="sd-num">{formatMoney(totals.closingCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      )}
    </>
  );
}

function BalanceSheet({ entries, config, asOf }: { entries: JournalEntry[]; config: FinanceConfig; asOf: string }) {
  const sheet = useMemo(() => balanceSheet(entries, config, asOf), [entries, config, asOf]);
  const accountLabel = (code: string) => config.accounts.find((account) => account.code === code)?.label ?? "Compte inconnu";
  return (
    <>
      <p className="sd-muted text-sm">Situation au {formatDate(asOf)} · Exercice {fiscalYearOf(asOf, config.fiscalYearStartMonth).label}</p>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Actif">
          {sheet.assets.length === 0 ? <EmptyState icon="compta" title="Aucun actif comptabilisé" /> : (
            <div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Compte</th><th>Libellé</th><th className="sd-num">Montant</th></tr></thead><tbody>{sheet.assets.map((row) => <tr key={row.code}><td>{row.code}</td><td>{row.label}</td><td className="sd-num">{formatMoney(row.balance)}</td></tr>)}</tbody><tfoot><tr><td colSpan={2}>Total actif</td><td className="sd-num">{formatMoney(sheet.totalAssets)}</td></tr></tfoot></table></div>
          )}
        </Card>
        <Card title="Passif">
          <div className="sd-table-wrap"><table className="sd-table"><thead><tr><th>Compte</th><th>Libellé</th><th className="sd-num">Montant</th></tr></thead><tbody>
            {sheet.equity.map((row) => <tr key={row.code}><td>{row.code}</td><td>{row.label}</td><td className="sd-num">{formatMoney(-row.balance)}</td></tr>)}
            <tr><td>Résultat</td><td>Résultat de l’exercice</td><td className="sd-num">{formatMoney(sheet.result)}</td></tr>
            {sheet.debts.map((row) => <tr key={row.code}><td>{row.code}</td><td>{accountLabel(row.code)}</td><td className="sd-num">{formatMoney(-row.balance)}</td></tr>)}
          </tbody><tfoot><tr><td colSpan={2}>Total passif</td><td className="sd-num">{formatMoney(sheet.totalLiabilities)}</td></tr></tfoot></table></div>
        </Card>
      </div>
      <Card title="Équilibre du bilan">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="sd-muted text-sm">Total actif {formatMoney(sheet.totalAssets)} · Total passif {formatMoney(sheet.totalLiabilities)}</p>
          <Badge tone={sheet.balanced ? "ok" : "danger"}>{sheet.balanced ? "Bilan équilibré" : "Écart à contrôler"}</Badge>
        </div>
      </Card>
    </>
  );
}

function IncomeStatement({ entries, config, from, to }: { entries: JournalEntry[]; config: FinanceConfig; from: string; to: string }) {
  const result = useMemo(() => incomeStatement(entries, config, from, to), [entries, config, from, to]);
  const rows = [
    ["Produits d’exploitation", result.operatingIncome],
    ["Charges d’exploitation", -result.operatingExpense],
    ["Résultat d’exploitation", result.operatingResult],
    ["Résultat financier", result.financial],
    ["Résultat exceptionnel", result.exceptional],
    ["Résultat avant impôt", result.preTaxResult],
    ["Impôt sur les bénéfices", -result.tax],
    ["Résultat net", result.netResult],
  ] as const;
  return (
    <Card title="Compte de résultat">
      <p className="sd-muted mb-4 text-sm">Du {formatDate(from)} au {formatDate(to)} · Exercice {fiscalYearOf(to, config.fiscalYearStartMonth).label}</p>
      {from > to ? <p className="text-sm text-[var(--sd-danger)]" role="alert">La date de début doit précéder la date de fin.</p> : (
        <div className="sd-table-wrap"><table className="sd-table min-w-[520px]"><thead><tr><th>Poste</th><th className="sd-num">Montant</th></tr></thead><tbody>
          {rows.map(([label, amount]) => <tr key={label} className={label.includes("Résultat") ? "font-semibold" : undefined}><td>{label}</td><td className="sd-num">{formatMoney(amount)}</td></tr>)}
        </tbody></table></div>
      )}
    </Card>
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
const journalNames: Record<JournalCode, string> = {
  VT: "Ventes",
  AC: "Achats",
  BQ: "Banque",
  OD: "Opérations diverses",
  AN: "À-nouveaux",
};

function Accounting({ config, entries, onPost, onApproveDraft, onReverse, onMatch }: { config: FinanceConfig; entries: JournalEntry[]; onPost: (entry: JournalEntry) => Promise<boolean>; onApproveDraft: (entry: JournalEntry) => Promise<boolean>; onReverse: (entry: JournalEntry) => void; onMatch: () => void }) {
  const [kind, setKind] = useState<Kind>("sale");
  const [journalCode, setJournalCode] = useState<JournalCode>("VT");
  const [journalPeriod, setJournalPeriod] = useState(todayISO().slice(0, 7));
  const [partner, setPartner] = useState("");
  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState("706000");
  const [taxCode, setTaxCode] = useState("TVA20");
  const [center, setCenter] = useState(config.costCenters[0]?.code ?? "");
  const [date, setDate] = useState(todayISO());
  const [due, setDue] = useState(todayISO());
  const [reference, setReference] = useState("");
  const [search, setSearch] = useState("");
  const [entryStatus, setEntryStatus] = useState<"all" | JournalEntry["status"]>("all");
  const [showManualEntry, setShowManualEntry] = useState(false);
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
  const periodEntries = entries
    .filter((entry) => entry.journal === journalCode && entry.date.startsWith(journalPeriod))
  const journal = [...periodEntries]
    .filter((entry) => entryStatus === "all" || entry.status === entryStatus)
    .filter((entry) => !needle || `${entry.number ?? ""} ${entry.reference ?? ""} ${entry.label} ${entry.lines.map((line) => `${line.accountCode} ${line.partnerId ?? ""} ${line.label ?? ""}`).join(" ")}`.toLowerCase().includes(needle))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.number ?? "").localeCompare(b.number ?? ""));
  const journalRows = journal.flatMap((entry) => entry.lines.map((line, index) => ({ entry, line, index })));
  const journalDebit = journalRows.reduce((total, row) => total + row.line.debit, 0);
  const journalCredit = journalRows.reduce((total, row) => total + row.line.credit, 0);
  const journalTitle = `${journalNames[journalCode]} (${journalCode})`;
  const canCreateDocument = journalCode === "VT" || journalCode === "AC" || journalCode === "BQ";
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
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Impossible de préparer l’écriture comptable.");
    } finally {
      setIsValidatingImport(false);
    }
  };

  return (
    <>
      <div className="sd-journal-workspace">
      <Card title={`Journal · ${journalTitle}`} actions={
        <div className="flex flex-wrap gap-2">
          {journalCode === "AC" && <Button icon={FileUp} onClick={() => { setKind("purchase"); setAccount("606000"); setShowImport(true); setImportError(""); }}>Importer une facture</Button>}
          <Button variant="primary" icon={Plus} onClick={() => {
            if (!canCreateDocument) {
              setShowManualEntry(true);
              return;
            }
            const nextKind = journalCode === "AC" ? "purchase" : journalCode === "BQ" ? "in" : "sale";
            setKind(nextKind);
            setAccount(nextKind === "sale" ? "706000" : "606000");
            setAmount(0);
            setReference("");
            setPartner("");
            const entryDate = journalPeriod === todayISO().slice(0, 7) ? todayISO() : `${journalPeriod}-01`;
            setDate(entryDate);
            setDue(entryDate);
            setShowEntryForm(true);
          }}>Nouvelle écriture</Button>
          <Button size="sm" icon={RotateCcw} onClick={onMatch}>Lettrage automatique</Button>
          <Button size="sm" icon={Printer} className="sd-noprint" onClick={() => window.print()}>Imprimer</Button>
        </div>
      }>
        <nav className="sd-journal-switcher" aria-label="Journaux comptables">
          {(Object.keys(journalNames) as JournalCode[]).map((code) => {
            const count = entries.filter((entry) => entry.journal === code && entry.date.startsWith(journalPeriod)).length;
            return (
              <button key={code} type="button" aria-pressed={journalCode === code} onClick={() => setJournalCode(code)}>
                <span className="sd-journal-code">{code}</span>
                <span className="sd-journal-name">{journalNames[code]}</span>
                <span className="sd-journal-count">{count}</span>
              </button>
            );
          })}
        </nav>
        <div className="sd-journal-toolbar">
          <Field label="Période">
            <TextInput type="month" value={journalPeriod} onChange={(event) => setJournalPeriod(event.target.value)} />
          </Field>
          <Field label="État de la pièce">
            <select className="sd-input" value={entryStatus} onChange={(event) => setEntryStatus(event.target.value as typeof entryStatus)}>
              <option value="all">Tous les états</option>
              <option value="posted">Comptabilisées</option>
              <option value="draft">Brouillons</option>
              <option value="reversed">Extournées</option>
            </select>
          </Field>
          <Field label="Rechercher dans le journal">
            <TextInput type="search" placeholder="N° pièce, facture, compte, tiers…" aria-label="Rechercher dans le journal" value={search} onChange={(event) => setSearch(event.target.value)} />
          </Field>
          <p className="sd-journal-result-count" role="status">{journal.length} pièce{journal.length > 1 ? "s" : ""} · {journalRows.length} ligne{journalRows.length > 1 ? "s" : ""}</p>
        </div>
        <div className="sd-table-wrap">
          <table className="sd-table sd-journal-table min-w-[1100px]">
            <thead><tr><th>Jour</th><th>N° pièce</th><th>Référence / facture</th><th>N° compte général</th><th>N° compte tiers</th><th>Libellé écriture</th><th>Date échéance</th><th className="sd-num">Débit</th><th className="sd-num">Crédit</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {journalRows.map(({ entry, line, index }) => (
                <tr key={`${entry.id}-${index}`} className={index === 0 ? "sd-journal-piece-start" : undefined}>
                  {index === 0 && (
                    <>
                      <td rowSpan={entry.lines.length}>{formatDate(entry.date)}</td>
                      <td rowSpan={entry.lines.length}>
                        <div className="flex flex-col items-start gap-1">
                          <span className="sd-journal-piece-number">{entry.number ?? "—"}</span>
                          {entry.status === "draft" && <Badge>Brouillon</Badge>}
                          {entry.status === "reversed" && <Badge tone="warn">Extournée</Badge>}
                        </div>
                      </td>
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
              {journalRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="sd-journal-empty">
                    <strong>{periodEntries.length === 0 ? "Aucune pièce dans ce journal pour cette période" : "Aucune pièce ne correspond aux filtres"}</strong>
                    <span>{periodEntries.length === 0 ? `${journalTitle} · ${journalPeriod}` : "Modifiez ou effacez les critères de recherche."}</span>
                    {(periodEntries.length > 0 || search || entryStatus !== "all") && <Button size="sm" onClick={() => { setSearch(""); setEntryStatus("all"); }}>Effacer les filtres</Button>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="sd-journal-totals">
          <div><p className="sd-muted text-xs">Pièces du journal</p><p className="font-semibold">{journal.length}</p></div>
          <div><p className="sd-muted text-xs">Total débit</p><p className="sd-num font-semibold">{formatMoney(journalDebit)}</p></div>
          <div><p className="sd-muted text-xs">Total crédit</p><p className="sd-num font-semibold">{formatMoney(journalCredit)}</p></div>
          <div><p className="sd-muted text-xs">Solde à équilibrer</p><p className="mt-1">{journal.length === 0 ? <Badge>Aucune écriture</Badge> : journalDebit === journalCredit ? <Badge tone="ok">Journal équilibré</Badge> : <Badge tone="warn">Écart : {formatMoney(journalDebit - journalCredit)}</Badge>}</p></div>
        </div>
      </Card>
      </div>

      {showManualEntry && (
        <ManualJournalEntryDialog
          config={config}
          journal={journalCode}
          initialDate={journalPeriod === todayISO().slice(0, 7) ? todayISO() : `${journalPeriod}-01`}
          onClose={() => setShowManualEntry(false)}
          onSubmit={async (entry) => {
            const posted = await onPost(entry);
            if (posted) setShowManualEntry(false);
            return posted;
          }}
        />
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
        <Popup title="Importer une facture électronique" wide onClose={() => setShowImport(false)}>
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

type ManualJournalLine = { accountCode: string; partnerId: string; label: string; dueDate: string; costCenter: string; debit: number; credit: number };

function ManualJournalEntryDialog({ config, journal, initialDate, onClose, onSubmit }: { config: FinanceConfig; journal: JournalCode; initialDate: string; onClose: () => void; onSubmit: (entry: JournalEntry) => Promise<boolean> }) {
  const [date, setDate] = useState(initialDate);
  const [reference, setReference] = useState("");
  const [label, setLabel] = useState("");
  const firstAccount = config.accounts.find((account) => account.active)?.code ?? "";
  const [lines, setLines] = useState<ManualJournalLine[]>([
    { accountCode: firstAccount, partnerId: "", label: "", dueDate: "", costCenter: "", debit: 0, credit: 0 },
    { accountCode: firstAccount, partnerId: "", label: "", dueDate: "", costCenter: "", debit: 0, credit: 0 },
  ]);
  const [error, setError] = useState("");
  const activeLines = lines.filter((line) => line.debit > 0 || line.credit > 0);
  const debit = activeLines.reduce((total, line) => total + line.debit, 0);
  const credit = activeLines.reduce((total, line) => total + line.credit, 0);
  const isBalanced = debit > 0 && debit === credit && activeLines.length >= 2
    && activeLines.every((line) => (line.debit > 0) !== (line.credit > 0));
  const updateLine = (index: number, changes: Partial<ManualJournalLine>) => {
    setLines((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, ...changes } : line));
    setError("");
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!label.trim()) {
      setError("Saisissez le libellé de la pièce.");
      return;
    }
    if (!isBalanced) {
      setError("La pièce doit comporter au moins deux lignes et présenter des totaux débit/crédit équilibrés.");
      return;
    }
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      journal,
      date,
      reference: reference.trim() || undefined,
      label: label.trim(),
      status: "draft",
      source: "manual",
      lines: activeLines.map((line) => ({
        accountCode: line.accountCode,
        debit: line.debit,
        credit: line.credit,
        label: line.label.trim() || label.trim(),
        ...(line.partnerId.trim() ? { partnerId: line.partnerId.trim() } : {}),
        ...(line.dueDate ? { dueDate: line.dueDate } : {}),
        ...(line.costCenter ? { costCenter: line.costCenter } : {}),
      })),
    };
    const posted = await onSubmit(entry);
    if (!posted) setError("La pièce n’a pas pu être comptabilisée. Vérifiez les comptes, les tiers obligatoires et la période.");
  };

  return (
    <Popup
      title={`Saisie libre · ${journalNames[journal]} (${journal})`}
      wide
      dialogClassName="sd-manual-entry-modal"
      contentClassName="sd-manual-entry-dialog"
      onClose={onClose}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" icon={CheckCircle2} disabled={!isBalanced || !label.trim()} type="submit" form="manual-journal-entry">Enregistrer la pièce</Button></>}
    >
      <form id="manual-journal-entry" onSubmit={save} className="sd-manual-entry-form">
        <div className="grid gap-3 rounded-lg border border-[var(--sd-border)] bg-[var(--sd-surface-2)] p-3 sm:grid-cols-3">
          <Field label="Date de pièce"><TextInput type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></Field>
          <Field label="Référence"><TextInput value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Référence interne ou justificatif" /></Field>
          <Field label="Libellé de la pièce"><TextInput required value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Ex. ouverture de l’exercice" /></Field>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="sd-h2">Lignes comptables</h3><p className="sd-muted text-xs">Renseignez les comptes et montants ; la pièce ne peut être enregistrée que si elle est équilibrée.</p></div>
          <Button size="sm" icon={Plus} onClick={() => setLines((current) => [...current, { accountCode: firstAccount, partnerId: "", label: "", dueDate: "", costCenter: "", debit: 0, credit: 0 }])}>Ajouter une ligne</Button>
        </div>
        <div className="sd-table-wrap sd-manual-entry-lines">
          <table className="sd-table min-w-[1400px]">
            <thead><tr><th>N° compte général</th><th>N° compte tiers</th><th>Libellé écriture</th><th>Date échéance</th><th>Centre de coûts</th><th className="sd-num">Débit</th><th className="sd-num">Crédit</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{lines.map((line, index) => (
              <tr key={index}>
                <td><select className="sd-input sd-manual-cell-account" aria-label={`Compte général ligne ${index + 1}`} value={line.accountCode} onChange={(event) => updateLine(index, { accountCode: event.target.value })}>
                  {config.accounts.filter((account) => account.active).map((account) => <option key={account.code} value={account.code}>{account.code} · {account.label}</option>)}
                </select></td>
                <td><TextInput aria-label={`Compte tiers ligne ${index + 1}`} value={line.partnerId} onChange={(event) => updateLine(index, { partnerId: event.target.value })} placeholder="Tiers" /></td>
                <td><TextInput aria-label={`Libellé ligne ${index + 1}`} value={line.label} onChange={(event) => updateLine(index, { label: event.target.value })} placeholder={label || "Libellé de ligne"} /></td>
                <td><TextInput aria-label={`Échéance ligne ${index + 1}`} type="date" value={line.dueDate} onChange={(event) => updateLine(index, { dueDate: event.target.value })} /></td>
                <td><select className="sd-input" aria-label={`Centre de coûts ligne ${index + 1}`} value={line.costCenter} onChange={(event) => updateLine(index, { costCenter: event.target.value })}>
                  <option value="">Aucun</option>
                  {config.costCenters.filter((center) => center.active).map((center) => <option key={center.code} value={center.code}>{center.label}</option>)}
                </select></td>
                <td><DecimalInput aria-label={`Débit ligne ${index + 1}`} value={line.debit} onChange={(value) => updateLine(index, { debit: value, ...(value > 0 ? { credit: 0 } : {}) })} suffix="€" /></td>
                <td><DecimalInput aria-label={`Crédit ligne ${index + 1}`} value={line.credit} onChange={(value) => updateLine(index, { credit: value, ...(value > 0 ? { debit: 0 } : {}) })} suffix="€" /></td>
                <td className="text-right"><Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label={`Supprimer la ligne ${index + 1}`} disabled={lines.length <= 2} onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {error && <p role="alert" className="rounded-lg border border-[var(--sd-danger)] bg-[var(--sd-danger-soft)] p-3 text-sm text-[var(--sd-danger)]">{error}</p>}
        <div className="sd-journal-totals sd-manual-totals">
          <div><p className="sd-muted text-xs">Total débit</p><p className="sd-num font-semibold">{formatMoney(debit)}</p></div>
          <div><p className="sd-muted text-xs">Total crédit</p><p className="sd-num font-semibold">{formatMoney(credit)}</p></div>
          <div><p className="sd-muted text-xs">Écart</p><p className="sd-num font-semibold">{formatMoney(debit - credit)}</p></div>
          <div><p className="sd-muted text-xs">État</p><p className="mt-1"><Badge tone={isBalanced ? "ok" : "warn"}>{isBalanced ? "Équilibrée" : "À équilibrer"}</Badge></p></div>
        </div>
      </form>
    </Popup>
  );
}

function Popup({ title, children, wide = false, onClose, contentClassName, dialogClassName, footer }: { title: string; children: ReactNode; wide?: boolean; onClose: () => void; contentClassName?: string; dialogClassName?: string; footer?: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ignoreClose = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
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
    <dialog ref={dialogRef} onClose={() => {
      if (ignoreClose.current) ignoreClose.current = false;
      else onClose();
    }} className={`sd-dialog max-h-[90vh] overflow-y-auto ${wide ? "sd-dialog-wide" : ""} ${dialogClassName ?? ""}`}>
      <header className="flex items-center justify-between gap-4 border-b border-[var(--sd-border)] px-5 py-4">
        <h2 className="sd-h2">{title}</h2>
        <Button variant="ghost" size="sm" icon={X} aria-label="Fermer la fenêtre" onClick={() => dialogRef.current?.close()} />
      </header>
      <div className={`sd-dialog-content p-5 ${wide ? "sd-dialog-content-wide" : ""} ${contentClassName ?? ""}`}>{children}</div>
      <footer className="flex justify-end gap-2 px-5 pb-5">
        {footer ?? <Button onClick={() => dialogRef.current?.close()}>Fermer</Button>}
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
