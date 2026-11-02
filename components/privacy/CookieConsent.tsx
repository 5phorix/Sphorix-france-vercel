"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import {
  COOKIE_CONSENT_EVENT,
  parseCookieConsent,
  readCookieConsentValue,
  saveCookieConsent,
} from "@/lib/cookie-consent";

function subscribeToConsent(callback: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, callback);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, callback);
}

export default function CookieConsent() {
  const consentValue = useSyncExternalStore(
    subscribeToConsent,
    readCookieConsentValue,
    () => null
  );
  const consent = parseCookieConsent(consentValue);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const save = (allowAnalytics: boolean, allowMarketing: boolean) => {
    saveCookieConsent(allowAnalytics, allowMarketing);
    setIsCustomizing(false);
  };

  const customize = () => {
    setAnalytics(consent?.analytics ?? false);
    setMarketing(consent?.marketing ?? false);
    setIsCustomizing(true);
  };

  if (consent) return null;

  return (
    <aside
      aria-label="Préférences relatives aux cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-4 shadow-[0_-12px_40px_rgba(15,23,42,0.14)] sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:max-w-3xl sm:rounded-2xl sm:border"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#172b27]">Vos choix de cookies</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Les cookies nécessaires assurent la connexion et la mémorisation de vos choix.
            Aucun cookie de mesure d&apos;audience ou publicitaire n&apos;est actuellement activé.
            Le panier et certains outils enregistrent aussi des données dans le stockage local
            de votre navigateur.
          </p>
          <Link
            href="/politique-confidentialite"
            className="mt-1 inline-block text-sm font-semibold text-[#b94d2d] underline underline-offset-2"
          >
            En savoir plus
          </Link>
        </div>
        {(consent || isCustomizing) && (
          <button
            type="button"
            onClick={() => setIsCustomizing(false)}
            aria-label="Fermer les préférences cookies"
            className="rounded-full px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        )}
      </div>

      {isCustomizing && (
        <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3">
          <p className="text-sm font-semibold text-slate-900">
            Nécessaires <span className="text-emerald-700">Toujours actifs</span>
          </p>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="h-4 w-4 accent-[#df6a43]"
            />
            Mesure d&apos;audience
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              className="h-4 w-4 accent-[#df6a43]"
            />
            Publicité
          </label>
          <p className="text-xs leading-relaxed text-slate-500 sm:col-span-3">
            Aucun outil facultatif n&apos;est installé pour le moment. Votre choix n&apos;active
            aucun traceur ; si les outils ou leurs finalités évoluent, nous vous redemanderons
            votre choix.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 sm:justify-end">
        {isCustomizing ? (
          <>
            <button
              type="button"
              onClick={() => save(false, false)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Tout refuser
            </button>
            <button
              type="button"
              onClick={() => save(analytics, marketing)}
              className="rounded-lg bg-[#172b27] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253c36]"
            >
              Enregistrer mes choix
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => save(false, false)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Tout refuser
            </button>
            <button
              type="button"
              onClick={customize}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Personnaliser
            </button>
            <button
              type="button"
              onClick={() => save(true, true)}
              className="rounded-lg bg-[#172b27] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253c36]"
            >
              Tout accepter
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
