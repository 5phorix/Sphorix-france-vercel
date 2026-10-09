"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Upload } from "lucide-react";

import type { TreasuryFlow, TreasurySettings } from "@/lib/products/treasury";
import { treasuryDb } from "@/lib/products/treasury-db";

type TreasuryDataManagerProps = {
  flows: TreasuryFlow[];
  onChanged: () => Promise<void>;
};

type BackupPayload = {
  version: number;
  settings: TreasurySettings;
  flows: TreasuryFlow[];
};

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<BackupPayload>;
  return payload.version === 1
    && Boolean(payload.settings)
    && Array.isArray(payload.flows)
    && payload.flows.every((flow) => typeof flow.id === "string"
      && typeof flow.date === "string"
      && typeof flow.amount === "number"
      && (flow.type === "income" || flow.type === "expense")
      && (flow.status === "planned" || flow.status === "completed"));
}

export default function TreasuryDataManager({ flows, onChanged }: TreasuryDataManagerProps) {
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<TreasuryFlow | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedFlow = flows.find((flow) => flow.id === selectedId) ?? flows[0] ?? null;
  const activeDraft = draft ?? selectedFlow;

  const updateDraft = (changes: Partial<TreasuryFlow>) => {
    if (activeDraft) setDraft({ ...activeDraft, ...changes });
  };

  const saveFlow = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeDraft || !activeDraft.label.trim() || activeDraft.amount <= 0) return;
    await treasuryDb.flows.put({ ...activeDraft, label: activeDraft.label.trim() });
    await onChanged();
    setMessage("Flux mis à jour localement.");
    setError("");
  };

  const importBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const payload = JSON.parse(await file.text()) as unknown;
      if (!isBackupPayload(payload)) throw new Error("Format de sauvegarde non reconnu.");
      if (!window.confirm("Restaurer cette sauvegarde remplacera les données actuellement présentes sur cet appareil.")) return;

      await treasuryDb.transaction("rw", treasuryDb.settings, treasuryDb.flows, async () => {
        await treasuryDb.settings.put({ ...payload.settings, id: "primary" });
        await treasuryDb.flows.clear();
        await treasuryDb.flows.bulkPut(payload.flows);
      });
      await onChanged();
      setMessage("Sauvegarde restaurée avec succès.");
      setError("");
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Impossible de restaurer cette sauvegarde.");
      setMessage("");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <details className="mb-6 border border-slate-300 bg-white">
      <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-bold text-[#0d3b37]">
        <Pencil className="h-4 w-4" />
        Gérer un flux récurrent ou restaurer une sauvegarde
      </summary>
      <div className="grid gap-6 border-t border-slate-200 p-5 lg:grid-cols-[1.4fr_0.6fr]">
        <form onSubmit={saveFlow} className="grid gap-3 md:grid-cols-3">
          <label className="text-xs font-bold text-[#355c54]">
            Flux à modifier
            <select value={activeDraft?.id ?? ""} onChange={(event) => {
              const nextFlow = flows.find((flow) => flow.id === event.target.value) ?? null;
              setSelectedId(event.target.value);
              setDraft(nextFlow);
            }} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm">
              {flows.map((flow) => <option key={flow.id} value={flow.id}>{flow.date} · {flow.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[#355c54]">
            Date
            <input type="date" value={activeDraft?.date ?? ""} onChange={(event) => updateDraft({ date: event.target.value })} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-bold text-[#355c54]">
            Montant TTC
            <input type="number" min="0.01" step="0.01" value={activeDraft?.amount ?? ""} onChange={(event) => updateDraft({ amount: Number(event.target.value) })} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-bold text-[#355c54] md:col-span-2">
            Libellé
            <input value={activeDraft?.label ?? ""} onChange={(event) => updateDraft({ label: event.target.value })} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-bold text-[#355c54]">
            Récurrence
            <select value={activeDraft?.recurrence ?? "none"} onChange={(event) => updateDraft({ recurrence: event.target.value as TreasuryFlow["recurrence"] })} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm">
              <option value="none">Aucune</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </label>
          <label className="text-xs font-bold text-[#355c54]">
            Statut
            <select value={activeDraft?.status ?? "planned"} onChange={(event) => updateDraft({ status: event.target.value as TreasuryFlow["status"] })} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm">
              <option value="planned">Prévu</option>
              <option value="completed">Réalisé</option>
            </select>
          </label>
          <div className="flex items-end"><button disabled={!activeDraft} className="inline-flex items-center gap-2 bg-[#0d3b37] px-4 py-2 text-sm font-bold text-white disabled:opacity-40"><CheckCircle2 className="h-4 w-4" />Mettre à jour</button></div>
        </form>
        <div className="border-l border-slate-200 pl-0 lg:pl-6">
          <p className="text-sm font-bold text-[#0d3b37]">Restaurer une sauvegarde</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">Importez un fichier JSON exporté depuis Sadesk Suivi de Trésorerie. Les données locales actuelles seront remplacées après confirmation.</p>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-[#0d3b37]"><Upload className="h-4 w-4" />Restaurer<input type="file" accept="application/json,.json" onChange={importBackup} className="sr-only" /></label>
        </div>
      </div>
      {(message || error) && <p className={`mx-5 mb-5 text-sm font-semibold ${error ? "text-red-700" : "text-emerald-700"}`}>{error || message}</p>}
    </details>
  );
}