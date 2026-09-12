"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AccountProfile } from "@/lib/account";

interface ProfileFormProps {
  profile: AccountProfile;
  userEmail: string;
}

export default function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [companyName, setCompanyName] = useState(profile.companyName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: profile.id,
          full_name: fullName,
          company_name: companyName,
          phone,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setMessage("Informations de profil enregistrées avec succès !");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du profil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] bg-white p-7 shadow-sm sm:p-10">
      <h2 className="text-2xl font-bold text-slate-950">Informations personnelles</h2>
      <p className="mt-1 text-sm text-slate-600">Gérez vos coordonnées pour vos factures et échanges.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Adresse email (non modifiable)
          </label>
          <input
            id="email"
            type="email"
            disabled
            value={userEmail}
            className="mt-1.5 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Nom complet
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ex. Jean Dupont"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="companyName" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Raison sociale / Entreprise
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="ex. Sphorix SAS"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Téléphone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="ex. 06 12 34 56 78"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
            />
          </div>
        </div>

        <div aria-live="polite" className="pt-1">
          {message && (
            <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : "Mettre à jour mon profil"}
        </button>
      </form>
    </div>
  );
}
