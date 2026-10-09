"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const [supabase] = useState(createSupabaseBrowserClient);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: recoveryError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (recoveryError) {
          if (isMounted) setError("Le lien de réinitialisation est invalide ou a expiré.");
          return;
        }

        window.history.replaceState(null, "", window.location.pathname);
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (sessionError || !data.session) {
        setError("Le lien de réinitialisation est invalide ou a expiré.");
        return;
      }

      setIsRecoveryReady(true);
    })();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setMessage("Votre mot de passe a été mis à jour avec succès ! Redirection...");
      setTimeout(() => {
        window.location.href = "/compte";
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Sécurité</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Nouveau mot de passe
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Nouveau mot de passe
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le mot de passe"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
            />
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
            disabled={isLoading || !isRecoveryReady}
            className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-50 transition"
          >
            {isLoading ? "Enregistrement..." : isRecoveryReady ? "Enregistrer le mot de passe" : "Vérification du lien..."}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          <Link href="/compte" className="font-semibold text-orange-600 hover:underline">
            Accéder à mon espace
          </Link>
        </div>
      </div>
    </main>
  );
}
