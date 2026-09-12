export function formatPrice(priceCents: number, currency = "EUR") {
  if (priceCents === 0) {
    return "Sur devis";
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

export function jsonList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
