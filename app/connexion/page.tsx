"use client";

import Link from "next/link";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ConnexionPage() {
  const [authMode, setAuthMode] = useState<"magic-link" | "password">("magic-link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      if (authMode === "password") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        setMessage("Connexion réussie ! Redirection en cours...");
        window.location.href = "/compte";
      } else {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });

        if (authError) throw authError;

        setMessage("Un lien de connexion vient d’être envoyé à votre adresse email.");
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Connexion impossible.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Espace client</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Se connecter</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Accédez à votre espace pour retrouver vos commandes et télécharger vos fichiers.
        </p>

        {/* Toggle mode */}
        <div className="mt-6 flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode("magic-link"); setError(""); setMessage(""); }}
            className={`flex-1 rounded-xl py-2.5 transition ${
              authMode === "magic-link"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Lien magique
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("password"); setError(""); setMessage(""); }}
            className={`flex-1 rounded-xl py-2.5 transition ${
              authMode === "password"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Mot de passe
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Adresse email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@entreprise.fr"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
            />
          </div>

          {authMode === "password" && (
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Mot de passe</label>
                <Link href="/mot-de-passe-oublie" className="text-xs font-semibold text-orange-600 hover:underline">
                  Oublié ?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Votre mot de passe"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
              />
            </div>
          )}

          <div aria-live="polite" className="pt-1">
            {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{message}</p>}
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-50 transition"
          >
            {isLoading
              ? "Connexion..."
              : authMode === "password"
              ? "Se connecter"
              : "Recevoir mon lien"}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-orange-600 hover:underline">
            S'inscrire
          </Link>
        </div>
      </div>
    </main>
  );
}
