const MONEY = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** Montant en centimes → « 1 234,56 € ». */
export const formatMoney = (cents: number) => MONEY.format(cents / 100);

/** Date ISO (AAAA-MM-JJ) → « JJ/MM/AAAA », sans passer par le fuseau horaire. */
export function formatDate(iso: string | undefined) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return "—";
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

export const formatPercent = (ratio: number, digits = 1) => `${(ratio * 100).toFixed(digits).replace(".", ",")} %`;

/**
 * Lit une saisie utilisateur (« 1 200,50 », « 1200.5 », « 12 € ») et la convertit
 * en entier à l'échelle donnée (100 → centimes). Retourne null si illisible.
 */
export function parseDecimal(text: string, scale = 100): number | null {
  const cleaned = text.replace(/[\s\u00a0€%]/g, "").replace(",", ".");
  if (!/^-?\d*\.?\d+$/.test(cleaned) && !/^-?\d+\.$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? Math.round(value * scale) : null;
}

/** Entier à l'échelle donnée → texte éditable en français (150 → « 1,5 »). */
export function toDecimalText(value: number, scale = 100, trim = false) {
  const digits = Math.round(Math.log10(scale));
  const text = (value / scale).toFixed(digits);
  return (trim && digits > 0 ? text.replace(/\.?0+$/, "") : text).replace(".", ",");
}

export const todayISO = () => new Date().toISOString().slice(0, 10);
