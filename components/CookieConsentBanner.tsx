"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type ConsentSettings = {
  version: string;
  analytics: boolean;
  essential: true;
  updatedAt: string;
};

const CONSENT_VERSION = "2026-07";
const CONSENT_STORAGE_KEY = "sphorix_cookie_consent";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function parseConsent(raw: string): ConsentSettings | null {
  try {
    const value = JSON.parse(raw) as Partial<ConsentSettings>;

    if (
      typeof value?.version !== "string" ||
      typeof value?.analytics !== "boolean" ||
      typeof value?.updatedAt !== "string"
    ) {
      return null;
    }

    return {
      version: value.version,
      analytics: value.analytics,
      essential: true,
      updatedAt: value.updatedAt,
    };
  } catch {
    return null;
  }
}

function readConsentFromCookie(): ConsentSettings | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${CONSENT_STORAGE_KEY}=`;
  const cookieEntry = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix));

  if (!cookieEntry) {
    return null;
  }

  const encoded = cookieEntry.slice(prefix.length);
  const decoded = decodeURIComponent(encoded);
  return parseConsent(decoded);
}

function readConsent(): ConsentSettings | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) {
      const parsed = parseConsent(raw);
      if (parsed) {
        return parsed;
      }
    }
  } catch {
    // Fallback handled below.
  }

  return readConsentFromCookie();
}

function saveConsent(analytics: boolean) {
  const value: ConsentSettings = {
    version: CONSENT_VERSION,
    analytics,
    essential: true,
    updatedAt: new Date().toISOString(),
  };

  const serialized = JSON.stringify(value);

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
  } catch {
    // No-op: some browsers/private modes can block storage access.
  }

  try {
    const encoded = encodeURIComponent(serialized);
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_STORAGE_KEY}=${encoded}; path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  } catch {
    // No-op: cookie write can also fail in hardened contexts.
  }

  window.dispatchEvent(
    new CustomEvent("cookie-consent-updated", {
      detail: value,
    })
  );
}

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(() => {
    const consent = readConsent();
    return !consent || consent.version !== CONSENT_VERSION;
  });

  useEffect(() => {
    const openPreferences = () => setVisible(true);
    window.addEventListener("open-cookie-preferences", openPreferences);

    return () => {
      window.removeEventListener("open-cookie-preferences", openPreferences);
    };
  }, []);

  if (!visible || pathname === "/politique-confidentialite") {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-slate-200 bg-white/95 px-4 py-4 shadow-2xl backdrop-blur sm:px-6"
      role="dialog"
      aria-live="polite"
      aria-label="Préférences cookies"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-slate-900">Cookies et données</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
            Sphorix France utilise des cookies essentiels pour le fonctionnement du site.
            Les cookies essentiels sont toujours actifs. Les cookies de mesure d audience
            restent optionnels. Vous pouvez modifier votre choix à tout moment depuis le footer.
            {" "}Voir la{" "}
            <Link href="/politique-confidentialite" className="font-semibold text-blue-900 underline underline-offset-2">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={() => {
              saveConsent(false);
              setVisible(false);
            }}
            className="w-full rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 sm:w-auto sm:text-sm"
          >
            Refuser les cookies optionnels
          </button>

          <button
            type="button"
            onClick={() => {
              saveConsent(true);
              setVisible(false);
            }}
            className="w-full rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 sm:w-auto sm:text-sm"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
