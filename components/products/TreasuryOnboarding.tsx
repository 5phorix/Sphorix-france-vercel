"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Building2, Landmark } from "lucide-react";

import type { TreasurySettings } from "@/lib/products/treasury";
import { treasuryDb } from "@/lib/products/treasury-db";

type TreasuryOnboardingProps = {
  initialSettings: TreasurySettings;
  onComplete: () => Promise<void>;
};

export default function TreasuryOnboarding({ initialSettings, onComplete }: TreasuryOnboardingProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings.companyName.trim()) return;
    setIsSaving(true);
    await treasuryDb.settings.put({ ...settings, id: "primary", companyName: settings.companyName.trim(), isOnboarded: true });
    await onComplete();
    setIsSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#e9f0ee] px-4 py-10 text-slate-950 sm:px-6 lg:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden border border-[#b9d0c7] bg-[#fbfcf8] lg:grid-cols-[0.8fr_1.2fr]">
        <section className="bg-[#0d3b37] p-8 text-white sm:p-12">
          <div className="flex items-center gap-4">
            <Image src="/logo_sadesk.png" alt="Sadesk Suivi de Trésorerie" width={96} height={96} className="h-16 w-16 object-contain" priority />
            <p className="text-sm font-bold text-[#e7f5c9]">Sadesk<br />Suivi de Trésorerie</p>
          </div>
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.18em] text-[#cde2bb]">Bienvenue</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal">Votre trésorerie, sur votre appareil.</h1>
        </section>
        <form onSubmit={save} className="p-8 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a865e]">Première configuration</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-[#0d3b37]">Paramétrez votre espace</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold text-[#355c54] sm:col-span-2">Nom de l&apos;entreprise<input required value={settings.companyName} onChange={(event) => setSettings({ ...settings, companyName: event.target.value })} placeholder="Ex. Atelier Martin" className="mt-2 w-full border border-slate-300 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-[#0d3b37]" /></label>
            <label className="text-sm font-bold text-[#355c54]">Activité<input value={settings.activity} onChange={(event) => setSettings({ ...settings, activity: event.target.value })} placeholder="Ex. Menuiserie" className="mt-2 w-full border border-slate-300 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-[#0d3b37]" /></label>
            <label className="text-sm font-bold text-[#355c54]">Responsable<input value={settings.contactName} onChange={(event) => setSettings({ ...settings, contactName: event.target.value })} placeholder="Prénom et nom" className="mt-2 w-full border border-slate-300 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-[#0d3b37]" /></label>
            <label className="text-sm font-bold text-[#355c54]"><Building2 className="mr-1 inline h-4 w-4" />Solde de départ<input required type="number" value={settings.initialBalance} onChange={(event) => setSettings({ ...settings, initialBalance: Number(event.target.value) })} className="mt-2 w-full border border-slate-300 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-[#0d3b37]" /></label>
            <label className="text-sm font-bold text-[#355c54]"><Landmark className="mr-1 inline h-4 w-4" />Seuil de sécurité<input required min="0" type="number" value={settings.safetyThreshold} onChange={(event) => setSettings({ ...settings, safetyThreshold: Number(event.target.value) })} className="mt-2 w-full border border-slate-300 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-[#0d3b37]" /></label>
          </div>
          <button disabled={isSaving} className="mt-8 inline-flex items-center gap-2 bg-[#0d3b37] px-5 py-3 text-sm font-bold text-white hover:bg-[#12554e] disabled:opacity-50">{isSaving ? "Enregistrement..." : "Ouvrir mon espace SADesk"}<ArrowRight className="h-4 w-4" /></button>
        </form>
      </div>
    </main>
  );
}