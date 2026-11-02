export const COOKIE_CONSENT_NAME = "sphorix_cookie_consent";
// Increment when optional services or their purposes change to request consent again.
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
export const COOKIE_CONSENT_EVENT = "sphorix:cookie-consent-change";

export type CookieConsent = {
  version: typeof COOKIE_CONSENT_VERSION;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

function isCookieConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== "object") return false;
  const consent = value as Partial<CookieConsent>;
  return consent.version === COOKIE_CONSENT_VERSION
    && consent.necessary === true
    && typeof consent.analytics === "boolean"
    && typeof consent.marketing === "boolean"
    && typeof consent.updatedAt === "string";
}

export function parseCookieConsent(value: string | null): CookieConsent | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    return isCookieConsent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readCookieConsentValue(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${COOKIE_CONSENT_NAME}=`;
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length) ?? null;
}

export function saveCookieConsent(analytics: boolean, marketing: boolean): CookieConsent {
  const consent: CookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics,
    marketing,
    updatedAt: new Date().toISOString(),
  };
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = [
    `${COOKIE_CONSENT_NAME}=${encodeURIComponent(JSON.stringify(consent))}`,
    `Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ") + secure;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }));
  return consent;
}
