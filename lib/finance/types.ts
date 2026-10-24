/** Tous les montants sont des entiers en centimes pour éviter les erreurs d'arrondi. */
export type Cents = number;

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type ReconciliationKind = "customer" | "supplier" | "bank";

export type Account = {
  code: string;
  label: string;
  type: AccountType;
  reconciliation?: ReconciliationKind;
  /** Impose un centre de coûts sur chaque ligne (contrôle de gestion). */
  requiresCostCenter?: boolean;
  active: boolean;
  custom?: boolean;
};

export type VatCode = {
  code: string;
  label: string;
  /** Taux en points de base : 2000 = 20 %. */
  rateBp: number;
  collectedAccount: string;
  deductibleAccount: string;
};

export type CostCenter = { code: string; label: string; kind: "cost" | "profit"; active: boolean };

export type JournalCode = "VT" | "AC" | "BQ" | "OD" | "AN";

export type EntryLine = {
  accountCode: string;
  debit: Cents;
  credit: Cents;
  label?: string;
  partnerId?: string;
  costCenter?: string;
  taxCode?: string;
  dueDate?: string;
  /** Identifiant de lettrage : les lignes partageant la même valeur sont soldées entre elles. */
  matchId?: string;
};

export type EntryStatus = "draft" | "posted" | "reversed";
export type EntrySource = "manual" | "electronic-invoice" | "sphorix-connect";

export type JournalEntry = {
  id: string;
  journal: JournalCode;
  date: string;
  reference?: string;
  label: string;
  lines: EntryLine[];
  status: EntryStatus;
  source?: EntrySource;
  externalId?: string;
  sourceFormat?: "UBL" | "CII" | "Factur-X PDF" | "PDF/OCR" | "Image/OCR";
  number?: string;
  reversalOf?: string;
};

export type FinanceConfig = {
  companyName: string;
  currency: string;
  /** Mois de début d'exercice (1-12). */
  fiscalYearStartMonth: number;
  accounts: Account[];
  vatCodes: VatCode[];
  costCenters: CostCenter[];
  /** Périodes clôturées au format AAAA-MM : aucune écriture n'y est acceptée. */
  lockedPeriods: string[];
  /** Variables : {JNL} journal, {YYYY} exercice, {SEQ} séquence. */
  numberPattern: string;
  seqPadding: number;
  taxBrackets: { upTo: Cents | null; rateBp: number }[];
};

export type Budget = {
  costCenter: string;
  accountPrefix: string;
  period: string;
  amount: Cents;
};
