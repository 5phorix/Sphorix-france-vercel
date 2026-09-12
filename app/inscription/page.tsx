"use client";

import Link from "next/link";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function InscriptionPage() {
  const [authMode, setAuthMode] = useState<"password" | "magic-link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");

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
      const redirectUrl = `${window.location.origin}/auth/callback`;

      if (authMode === "password") {
        if (password.length < 8) {
          setError("Le mot de passe doit contenir au moins 8 caractères.");
          setIsLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName,
              phone,
            },
            emailRedirectTo: redirectUrl,
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          setMessage("Votre compte a été créé avec succès ! Redirection en cours...");
          window.location.href = "/compte";
          return;
        }

        setMessage("Un email de confirmation vient de vous être envoyé pour valider votre compte.");
      } else {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName,
              phone,
            },
            emailRedirectTo: redirectUrl,
          },
        });

        if (otpError) throw otpError;

        setMessage("Un lien de connexion sécurisé vient de vous être envoyé par email.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Nouveau client</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Créer un compte
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Rejoignez Sphorix France pour retrouver tous vos achats, factures et fichiers téléchargeables.
        </p>

        {/* Toggle mode */}
        <div className="mt-6 flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode("password"); setError(""); setMessage(""); }}
            className={`flex-1 rounded-xl py-2.5 transition ${
              authMode === "password"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Avec mot de passe
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("magic-link"); setError(""); setMessage(""); }}
            className={`flex-1 rounded-xl py-2.5 transition ${
              authMode === "magic-link"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Par lien magique
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">
              Nom complet *
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ex. Jean Dupont"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Adresse email *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.fr"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
            />
          </div>

          {authMode === "password" && (
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Mot de passe *
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 8 caractères"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700">
                Société / Organisation
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nom de votre entreprise"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
              />
            </div>
          </div>

          <div aria-live="polite" className="pt-2">
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
            className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-50"
          >
            {isLoading
              ? "Création du compte..."
              : authMode === "password"
              ? "S'inscrire"
              : "Recevoir mon lien d'inscription"}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-orange-600 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
