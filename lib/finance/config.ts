import type { Account, FinanceConfig } from "./types";

const a = (code: string, label: string, type: Account["type"], extra: Partial<Account> = {}): Account => ({ code, label, type, active: true, ...extra });

/** Extrait du Plan Comptable Général français, extensible via la configuration. */
export const PCG_ACCOUNTS: Account[] = [
  a("101000", "Capital", "equity"),
  a("106000", "Réserves", "equity"),
  a("110000", "Report à nouveau", "equity"),
  a("120000", "Résultat de l'exercice (bénéfice)", "equity"),
  a("164000", "Emprunts auprès des établissements de crédit", "liability"),
  a("205000", "Logiciels", "asset"),
  a("218300", "Matériel de bureau et informatique", "asset"),
  a("281830", "Amortissements du matériel", "asset"),
  a("355000", "Stocks de produits finis", "asset"),
  a("401000", "Fournisseurs", "liability", { reconciliation: "supplier" }),
  a("411000", "Clients", "asset", { reconciliation: "customer" }),
  a("421000", "Personnel - rémunérations dues", "liability"),
  a("431000", "Sécurité sociale", "liability"),
  a("444000", "État - impôt sur les bénéfices", "liability"),
  a("445510", "TVA à décaisser", "liability"),
  a("445620", "TVA déductible sur immobilisations", "asset"),
  a("445660", "TVA déductible sur autres biens et services", "asset"),
  a("445710", "TVA collectée", "liability"),
  a("512000", "Banque", "asset", { reconciliation: "bank" }),
  a("530000", "Caisse", "asset"),
  a("601000", "Achats de matières premières", "expense", { requiresCostCenter: true }),
  a("606000", "Achats non stockés", "expense", { requiresCostCenter: true }),
  a("613000", "Locations", "expense", { requiresCostCenter: true }),
  a("622000", "Honoraires", "expense", { requiresCostCenter: true }),
  a("623000", "Publicité et marketing", "expense", { requiresCostCenter: true }),
  a("626000", "Frais postaux et télécommunications", "expense", { requiresCostCenter: true }),
  a("627000", "Services bancaires", "expense"),
  a("641000", "Rémunérations du personnel", "expense", { requiresCostCenter: true }),
  a("645000", "Charges de sécurité sociale", "expense", { requiresCostCenter: true }),
  a("661000", "Charges d'intérêts", "expense"),
  a("681100", "Dotations aux amortissements", "expense"),
  a("695000", "Impôt sur les bénéfices", "expense"),
  a("701000", "Ventes de produits finis", "revenue"),
  a("706000", "Prestations de services", "revenue"),
  a("708000", "Produits des activités annexes", "revenue"),
  a("764000", "Revenus des valeurs mobilières", "revenue"),
];

export function createDefaultConfig(overrides: Partial<FinanceConfig> = {}): FinanceConfig {
  return {
    companyName: "Mon entreprise",
    currency: "EUR",
    fiscalYearStartMonth: 1,
    accounts: PCG_ACCOUNTS.map((account) => ({ ...account })),
    vatCodes: [
      { code: "TVA20", label: "TVA 20 %", rateBp: 2000, collectedAccount: "445710", deductibleAccount: "445660" },
      { code: "TVA10", label: "TVA 10 %", rateBp: 1000, collectedAccount: "445710", deductibleAccount: "445660" },
      { code: "TVA55", label: "TVA 5,5 %", rateBp: 550, collectedAccount: "445710", deductibleAccount: "445660" },
      { code: "TVA0", label: "Exonéré", rateBp: 0, collectedAccount: "445710", deductibleAccount: "445660" },
    ],
    costCenters: [{ code: "GEN", label: "Général", kind: "cost", active: true }],
    lockedPeriods: [],
    numberPattern: "{JNL}-{YYYY}-{SEQ}",
    seqPadding: 5,
    // Barème IS français PME : 15 % jusqu'à 42 500 €, puis 25 %.
    taxBrackets: [
      { upTo: 4_250_000, rateBp: 1500 },
      { upTo: null, rateBp: 2500 },
    ],
    ...overrides,
  };
}

/** Ajoute ou met à jour un compte sans toucher au reste du référentiel. */
export function upsertAccount(config: FinanceConfig, account: Omit<Account, "active" | "custom"> & { active?: boolean }): FinanceConfig {
  if (!/^\d{3,10}$/.test(account.code)) throw new Error(`Code de compte invalide : ${account.code}`);
  const exists = config.accounts.find((item) => item.code === account.code);
  if (exists) return { ...config, accounts: config.accounts.map((item) => (item.code === account.code ? { ...item, ...account } : item)) };
  const created: Account = { active: true, custom: true, ...account };
  return { ...config, accounts: [...config.accounts, created].sort((x, y) => x.code.localeCompare(y.code)) };
}

export function lockPeriod(config: FinanceConfig, period: string): FinanceConfig {
  return config.lockedPeriods.includes(period) ? config : { ...config, lockedPeriods: [...config.lockedPeriods, period].sort() };
}

export function accountMap(config: FinanceConfig) {
  return new Map(config.accounts.map((account) => [account.code, account]));
}
