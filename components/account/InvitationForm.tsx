"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function InvitationForm({ token }: { token: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loginNeeded, setLoginNeeded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    createSupabaseBrowserClient().auth.getSession().then(({ data, error: authError }) => {
      if (!active) return;
      if (authError) {
        setError("La session n’a pas pu être vérifiée. Rechargez la page.");
        return;
      }
      if (data.session?.user.email) setSignedInEmail(data.session.user.email);
    });
    return () => { active = false; };
  }, []);

  const activate = async (accountPassword?: string) => {
    setIsLoading(true);
    setError("");
    setMessage("");
    setLoginNeeded(false);
    try {
      const response = await fetch("/api/client-invitations/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password: accountPassword, fullName }),
      });
      const result = await response.json() as { error?: string; code?: string; email?: string };
      if (!response.ok) {
        setError(result.error ?? "Le lien d’invitation n’a pas pu être validé.");
        return;
      }

      if (accountPassword && result.email) {
        const { error: signInError } = await createSupabaseBrowserClient().auth.signInWithPassword({
          email: result.email,
          password: accountPassword,
        });
        if (signInError) {
          setLoginNeeded(true);
          setMessage("Votre accès client est créé. Connectez-vous pour ouvrir votre espace.");
          return;
        }
      }

      router.replace("/compte");
      router.refresh();
    } catch {
      setError("La connexion au service a échoué. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await activate(password);
  };

  const sendSignInLink = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const next = `/invitation?token=${encodeURIComponent(token)}`;
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", next);
      const { error: authError } = await createSupabaseBrowserClient().auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: callback.toString(),
        },
      });
      if (authError) throw authError;
      setMessage("Si cette adresse possède un compte, un lien de connexion vient de lui être envoyé.");
    } catch {
      setError("Le lien de connexion n’a pas pu être envoyé. Vérifiez l’adresse puis réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Ce lien d’invitation est invalide.</p>;
  }

  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Espace client Sphorix</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Activer mon accès</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Créez votre accès sécurisé pour consulter le suivi de vos travaux, vos logiciels et vos documents.
          Le lien est personnel et valable 7 jours.
        </p>

        {signedInEmail ? (
          <div className="mt-7 space-y-4">
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              Session ouverte avec <strong>{signedInEmail}</strong>.
            </p>
            <button type="button" onClick={() => void activate()} disabled={isLoading} className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50">
              {isLoading ? "Activation..." : "Associer ce compte à mon espace client"}
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleCreateAccount} className="mt-7 space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">Nom complet</label>
                <input id="fullName" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={120} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Choisir un mot de passe</label>
                <input id="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50">
                {isLoading ? "Création..." : "Créer mon accès client"}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-6">
              <p className="text-sm font-semibold text-slate-800">Vous avez déjà un compte Sphorix ?</p>
              <label htmlFor="email" className="mt-3 block text-sm font-medium text-slate-700">Adresse email du compte</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
              <button type="button" onClick={() => void sendSignInLink()} disabled={isLoading || !email.trim()} className="mt-3 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-orange-400 disabled:opacity-50">
                Recevoir un lien de connexion
              </button>
            </div>
          </>
        )}

        <div aria-live="polite" className="mt-4">
          {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          {loginNeeded && <Link href="/connexion" className="mt-2 inline-block text-sm font-semibold text-orange-700 underline">Se connecter</Link>}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Besoin d’aide ? <Link href="/contact" className="font-semibold text-orange-600 hover:underline">Contactez Sphorix</Link>
        </p>
      </div>
    </main>
  );
}
