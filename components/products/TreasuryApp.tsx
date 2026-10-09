"use client";

import { useDeferredValue, useEffect, useState } from "react";
import Image from "next/image";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Download,
  Landmark,
  Menu,
  Plus,
  Settings2,
  Trash2,
  WalletCards,
} from "lucide-react";

import {
  analyzeTreasury,
  formatCurrency,
  type TreasuryFlow,
  type TreasurySettings,
} from "@/lib/products/treasury";
import { seedTreasuryData, treasuryDb } from "@/lib/products/treasury-db";
import TreasuryDataManager from "@/components/products/TreasuryDataManager";
import TreasuryOnboarding from "@/components/products/TreasuryOnboarding";

type ActiveView = "dashboard" | "flows" | "forecast";

const incomeCategories = ["Ventes", "Prestations", "Acomptes", "Autres encaissements"];
const expenseCategories = [
  "Achats", "Fournisseurs", "Sous-traitance", "Salaires", "Charges sociales", "Impôts et taxes", "TVA", "Loyer",
  "Assurances", "Énergie", "Télécommunications", "Véhicule", "Carburant", "Emprunt", "Investissement", "Autres dépenses",
];

const emptyFlow = (): Omit<TreasuryFlow, "id"> => ({
  date: new Date().toISOString().slice(0, 10),
  type: "expense",
  category: "Fournisseurs",
  label: "",
  amount: 0,
  status: "planned",
});

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`));
}

export default function TreasuryApp() {
  const [settings, setSettings] = useState<TreasurySettings | null>(null);
  const [flows, setFlows] = useState<TreasuryFlow[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState(emptyFlow);
  const [filter, setFilter] = useState("");
  const [isReady, setIsReady] = useState(false);
  const deferredFilter = useDeferredValue(filter.trim().toLocaleLowerCase());

  const refresh = async () => {
    const [storedSettings, storedFlows] = await Promise.all([
      treasuryDb.settings.get("primary"),
      treasuryDb.flows.orderBy("date").reverse().toArray(),
    ]);
    if (storedSettings) setSettings(storedSettings);
    setFlows(storedFlows);
  };

  useEffect(() => {
    void (async () => {
      await seedTreasuryData();
      await refresh();
      setIsReady(true);
    })();

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  if (!isReady || !settings) {
    return <main className="grid min-h-screen place-items-center bg-[#e9f0ee] text-sm font-semibold text-slate-700">Préparation de votre espace de trésorerie...</main>;
  }

  if (!settings.isOnboarded) {
    return <TreasuryOnboarding initialSettings={settings} onComplete={refresh} />;
  }

  const analysis = analyzeTreasury(settings, flows);
  const visibleFlows = flows.filter((flow) => !deferredFilter || [flow.label, flow.category, flow.status, flow.type].join(" ").toLocaleLowerCase().includes(deferredFilter));
  const chartData = analysis.days.filter((_, index) => index % 3 === 0).map((day) => ({ ...day, label: formatShortDate(day.date), threshold: settings.safetyThreshold }));
  const alertTone = analysis.tensionDate ? "critical" : analysis.minimumBalance < settings.safetyThreshold * 1.2 ? "warning" : "normal";

  const addFlow = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.label.trim() || draft.amount <= 0) return;
    await treasuryDb.flows.add({ ...draft, id: crypto.randomUUID(), label: draft.label.trim() });
    setDraft(emptyFlow());
    await refresh();
  };

  const deleteFlow = async (id: string) => {
    await treasuryDb.flows.delete(id);
    await refresh();
  };

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await treasuryDb.settings.put({ ...settings, id: "primary" });
    setShowSettings(false);
    await refresh();
  };

  const exportBackup = () => {
    const content = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), settings, flows }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sadesk-tresorerie-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const metrics = [
    { label: "Trésorerie actuelle", value: analysis.currentBalance, icon: WalletCards, tone: "ink" },
    { label: "Prévision à 30 jours", value: analysis.balanceAt30Days, icon: Landmark, tone: "blue" },
    { label: "Prévision à 90 jours", value: analysis.balanceAt90Days, icon: BarChart3, tone: analysis.balanceAt90Days < settings.safetyThreshold ? "red" : "green" },
  ];

  return (
    <main className="min-h-screen bg-[#e9f0ee] text-slate-950">
      <header className="border-b border-slate-200 bg-[#fbfcf8]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/logo_sadesk.png" alt="SADesk" width={80} height={80} className="h-10 w-10 shrink-0 object-contain" priority />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#57716b]">SADesk</p>
              <h1 className="truncate text-lg font-bold tracking-normal text-[#0d3b37]">Sadesk Suivi de Trésorerie · {settings.companyName}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#46635d]"><span className="h-2 w-2 rounded-full bg-[#62a067]" />Données enregistrées sur cet appareil</span>
            <button onClick={exportBackup} className="inline-flex h-10 items-center gap-2 border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:border-[#0d3b37]"><Download className="h-4 w-4" />Sauvegarder</button>
            <button onClick={() => setShowSettings(!showSettings)} className="inline-flex h-10 items-center gap-2 bg-[#0d3b37] px-3 text-sm font-bold text-white hover:bg-[#12554e]"><Settings2 className="h-4 w-4" />Paramètres</button>
          </div>
          <button className="grid h-10 w-10 place-items-center border border-slate-300 sm:hidden" aria-label="Ouvrir le menu"><Menu className="h-5 w-5" /></button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[224px_1fr]">
        <aside className="border-b border-slate-200 bg-[#f5f7f2] p-3 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r lg:p-5">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Navigation de trésorerie">
            {[
              ["dashboard", "Vue", Landmark],
              ["flows", "Flux", ArrowUpRight],
              ["forecast", "Prévision", BarChart3],
            ].map(([view, label, Icon]) => (
              <button key={view as string} onClick={() => setActiveView(view as ActiveView)} className={`inline-flex shrink-0 items-center gap-3 px-3 py-3 text-left text-sm font-bold ${activeView === view ? "bg-[#dcead0] text-[#0d3b37]" : "text-slate-600 hover:bg-white"}`}>
                <Icon className="h-4 w-4" />{label as string}
              </button>
            ))}
          </nav>
          <div className="mt-8 hidden border-l-2 border-[#8ba77c] pl-3 text-xs leading-relaxed text-[#57716b] lg:block">L’application fonctionne sans compte et conserve vos données dans ce navigateur. Exportez régulièrement une sauvegarde.</div>
        </aside>

        <section className="min-w-0 px-4 py-7 sm:px-6 lg:px-8">
          {showSettings && (
            <form onSubmit={saveSettings} className="mb-7 grid gap-4 border border-[#b9d0c7] bg-[#f7fbf3] p-5 md:grid-cols-4">
              <label className="text-xs font-bold text-[#355c54]">Entreprise<input value={settings.companyName} onChange={(event) => setSettings({ ...settings, companyName: event.target.value })} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium" /></label>
              <label className="text-xs font-bold text-[#355c54]">Solde initial<input type="number" value={settings.initialBalance} onChange={(event) => setSettings({ ...settings, initialBalance: Number(event.target.value) })} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium" /></label>
              <label className="text-xs font-bold text-[#355c54]">Seuil de sécurité<input type="number" value={settings.safetyThreshold} onChange={(event) => setSettings({ ...settings, safetyThreshold: Number(event.target.value) })} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium" /></label>
              <div className="flex items-end gap-2"><button className="bg-[#0d3b37] px-4 py-2 text-sm font-bold text-white">Enregistrer</button><button type="button" onClick={() => setShowSettings(false)} className="px-3 py-2 text-sm font-bold text-slate-600">Annuler</button></div>
            </form>
          )}

          {activeView === "dashboard" && <>
            <div className="flex flex-col gap-3 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a865e]">Vue de décision</p><h2 className="mt-1 text-3xl font-bold tracking-normal text-[#0d3b37]">Votre trésorerie en un regard</h2></div>
              <p className="text-sm text-slate-600">Mise à jour avec {flows.length} flux</p>
            </div>
            <div className="mt-6 grid gap-px overflow-hidden border border-slate-300 bg-slate-300 md:grid-cols-3">
              {metrics.map(({ label, value, icon: Icon, tone }) => <div key={label} className="bg-[#fbfcf8] p-5"><Icon className={`h-5 w-5 ${tone === "red" ? "text-red-700" : tone === "green" ? "text-emerald-700" : "text-[#2b6c64]"}`} /><p className="mt-7 text-xs font-bold uppercase tracking-[0.12em] text-[#59716b]">{label}</p><p className="mt-2 text-3xl font-bold tracking-normal text-[#0d3b37]">{formatCurrency(value)}</p></div>)}
            </div>
            <div className={`mt-6 border-l-4 p-5 ${alertTone === "critical" ? "border-red-600 bg-red-50" : alertTone === "warning" ? "border-amber-500 bg-amber-50" : "border-emerald-600 bg-emerald-50"}`}>
              <div className="flex items-start gap-3"><AlertTriangle className={`mt-0.5 h-5 w-5 ${alertTone === "critical" ? "text-red-700" : alertTone === "warning" ? "text-amber-700" : "text-emerald-700"}`} /><div><p className="font-bold text-slate-950">{analysis.tensionDate ? `Point de tension prévu le ${formatShortDate(analysis.tensionDate)}` : "Situation de trésorerie stable"}</p><p className="mt-1 text-sm text-slate-700">Minimum prévisionnel : {formatCurrency(analysis.minimumBalance)}. Seuil de sécurité : {formatCurrency(settings.safetyThreshold)}. Décaissements prévus dans les 7 jours : {formatCurrency(analysis.expensesNext7Days)}.</p></div></div>
            </div>
            <div className="mt-6 border border-slate-300 bg-[#fbfcf8] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold tracking-normal text-[#0d3b37]">Évolution sur 90 jours</h3><p className="text-sm text-slate-600">Le seuil de sécurité reste visible en pointillé.</p></div><span className="hidden text-sm font-bold text-[#2b6c64] sm:block">Seuil {formatCurrency(settings.safetyThreshold)}</span></div><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 4 }}><defs><linearGradient id="treasuryArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2b6c64" stopOpacity={0.36} /><stop offset="100%" stopColor="#2b6c64" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#d7dfda" vertical={false} /><XAxis dataKey="label" tick={{ fill: "#59716b", fontSize: 11 }} interval="preserveStartEnd" /><YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fill: "#59716b", fontSize: 11 }} width={42} /><Tooltip formatter={(value) => formatCurrency(Number(Array.isArray(value) ? value[0] : value ?? 0))} labelStyle={{ color: "#0d3b37", fontWeight: 700 }} /><ReferenceLine y={settings.safetyThreshold} stroke="#d97706" strokeDasharray="5 5" /><Area type="monotone" dataKey="balance" stroke="#0d3b37" strokeWidth={3} fill="url(#treasuryArea)" /></AreaChart></ResponsiveContainer></div></div>
          </>}

          {activeView === "flows" && <TreasuryDataManager flows={flows} onChanged={refresh} />}

          {activeView === "flows" && <>
            <div className="flex flex-col gap-3 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a865e]">Saisie unique</p><h2 className="mt-1 text-3xl font-bold tracking-normal text-[#0d3b37]">Flux de trésorerie</h2></div><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Rechercher un flux" className="border border-slate-300 bg-white px-3 py-2 text-sm" /></div>
            <form onSubmit={addFlow} className="mt-6 grid gap-3 border border-[#b9d0c7] bg-[#f7fbf3] p-5 md:grid-cols-2 xl:grid-cols-4"><label className="text-xs font-bold text-[#355c54]">Date<input required type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm" /></label><label className="text-xs font-bold text-[#355c54]">Type<select value={draft.type} onChange={(event) => { const type = event.target.value as TreasuryFlow["type"]; setDraft({ ...draft, type, category: type === "income" ? incomeCategories[0] : expenseCategories[0] }); }} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm"><option value="income">Encaissement</option><option value="expense">Décaissement</option></select></label><label className="text-xs font-bold text-[#355c54]">Catégorie<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm">{(draft.type === "income" ? incomeCategories : expenseCategories).map((category) => <option key={category}>{category}</option>)}</select></label><label className="text-xs font-bold text-[#355c54]">Statut<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TreasuryFlow["status"] })} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm"><option value="planned">Prévu</option><option value="completed">Réalisé</option></select></label><label className="text-xs font-bold text-[#355c54] md:col-span-2">Libellé<input required value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} placeholder="Ex. facture client, loyer, salaire" className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm" /></label><label className="text-xs font-bold text-[#355c54]">Montant TTC<input required min="0.01" step="0.01" type="number" value={draft.amount || ""} onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value) })} placeholder="0,00" className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm" /></label><div className="flex items-end"><button className="inline-flex w-full items-center justify-center gap-2 bg-[#0d3b37] px-4 py-2 text-sm font-bold text-white hover:bg-[#12554e]"><Plus className="h-4 w-4" />Ajouter le flux</button></div></form>
            <div className="mt-6 overflow-x-auto border border-slate-300 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#edf2e9] text-xs uppercase tracking-[0.1em] text-[#47645d]"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Flux</th><th className="px-4 py-3">Libellé</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3 text-right">Montant</th><th className="px-4 py-3" /></tr></thead><tbody>{visibleFlows.map((flow) => <tr key={flow.id} className="border-t border-slate-100"><td className="px-4 py-3 text-slate-600">{formatShortDate(flow.date)}</td><td className="px-4 py-3"><span className={`inline-flex items-center gap-1 font-bold ${flow.type === "income" ? "text-emerald-700" : "text-red-700"}`}>{flow.type === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}{flow.category}</span></td><td className="px-4 py-3 font-semibold text-slate-900">{flow.label}</td><td className="px-4 py-3 text-slate-600">{flow.status === "completed" ? "Réalisé" : "Prévu"}</td><td className={`px-4 py-3 text-right font-bold ${flow.type === "income" ? "text-emerald-700" : "text-slate-900"}`}>{flow.type === "income" ? "+" : "-"}{formatCurrency(flow.amount)}</td><td className="px-4 py-3 text-right"><button onClick={() => void deleteFlow(flow.id)} className="text-slate-400 hover:text-red-700" aria-label={`Supprimer ${flow.label}`}><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
          </>}

          {activeView === "forecast" && <>
            <div className="flex flex-col gap-3 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a865e]">Horizon de décision</p><h2 className="mt-1 text-3xl font-bold tracking-normal text-[#0d3b37]">Prévision de trésorerie</h2></div><p className="text-sm text-slate-600">90 jours glissants</p></div>
            <div className="mt-6 overflow-x-auto border border-slate-300 bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#edf2e9] text-xs uppercase tracking-[0.1em] text-[#47645d]"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Encaissements</th><th className="px-4 py-3 text-right">Décaissements</th><th className="px-4 py-3 text-right">Solde</th><th className="px-4 py-3">Niveau</th></tr></thead><tbody>{analysis.days.map((day) => <tr key={day.date} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold text-slate-800">{formatShortDate(day.date)}</td><td className="px-4 py-3 text-right text-emerald-700">{day.income ? formatCurrency(day.income) : "—"}</td><td className="px-4 py-3 text-right text-slate-700">{day.expense ? formatCurrency(day.expense) : "—"}</td><td className="px-4 py-3 text-right font-bold text-[#0d3b37]">{formatCurrency(day.balance)}</td><td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${day.alert === "critical" ? "bg-red-100 text-red-700" : day.alert === "warning" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{day.alert === "critical" ? "Alerte" : day.alert === "warning" ? "Vigilance" : "Normal"}</span></td></tr>)}</tbody></table></div>
          </>}
        </section>
      </div>
    </main>
  );
}