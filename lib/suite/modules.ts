import type { FinanceConfig, JournalEntry } from "@/lib/finance/types";

/** Identifiants des modules de la suite Sadesk. */
export type ModuleId = "compta" | "gestion" | "ventes" | "achats" | "production" | "logistique" | "qualite" | "maintenance" | "rh" | "clients" | "tresorerie" | "depenses";

export type ModuleSadesk = {
  id: ModuleId;
  /** Nom affiché dans l'interface : à modifier ici uniquement. */
  name: string;
  /** Regroupement affiché dans la navigation. */
  group: "Argent" | "Clients" | "Opérations" | "Équipes" | "Transverse";
  /** Courte description affichée sur la page d'accueil de la suite. */
  description: string;
  /** Page du module (absente tant que le module n'est pas disponible). */
  href?: string;
  status: "available" | "partial" | "planned";
  /** Modules dont celui-ci reçoit ou alimente les données. */
  linkedTo: ModuleId[];
};

/** Catalogue de la suite : ajouter un module = une entrée ici + une source de comptabilisation. */
export const MODULES_SADESK: ModuleSadesk[] = [
  { id: "ventes", name: "Ventes", group: "Clients", description: "Clients, devis et factures reliés aux écritures comptables.", href: "/produits/commerce", status: "partial", linkedTo: ["compta", "gestion", "logistique", "clients"] },
  { id: "compta", name: "Comptabilité", group: "Argent", description: "Journal, grand livre par compte, balance générale, bilan, compte de résultat et fiscalité.", href: "/produits/comptabilite", status: "partial", linkedTo: ["gestion", "ventes", "achats"] },
  { id: "gestion", name: "Gestion & Finance", group: "Argent", description: "Indicateurs, budgets et écarts à partir des écritures comptables.", href: "/produits/pilotage", status: "partial", linkedTo: ["compta", "ventes", "achats", "tresorerie"] },
  { id: "tresorerie", name: "Trésorerie", group: "Argent", description: "Suivi des flux et prévisions de trésorerie. Le rapprochement bancaire reste à intégrer.", href: "/produits/tresorerie", status: "partial", linkedTo: ["compta", "gestion", "ventes", "achats"] },
  { id: "clients", name: "Créances", group: "Clients", description: "Suivi dédié des impayés, anciennetés, relances et litiges.", status: "planned", linkedTo: ["ventes", "compta", "tresorerie"] },
  { id: "achats", name: "Achats", group: "Opérations", description: "Fournisseurs, commandes, factures d'achat et dettes restent à intégrer.", status: "planned", linkedTo: ["compta", "gestion", "logistique", "qualite"] },
  { id: "depenses", name: "Suivi des dépenses", group: "Opérations", description: "Saisie et suivi local des dépenses et de leurs budgets, sans intégration comptable complète.", href: "/produits/depenses", status: "partial", linkedTo: ["compta", "gestion", "achats"] },
  { id: "logistique", name: "Stocks & équipements", group: "Opérations", description: "Articles, mouvements de stock, immobilisations et amortissements.", status: "planned", linkedTo: ["achats", "ventes", "compta", "maintenance"] },
  { id: "rh", name: "Équipe & Salaires", group: "Équipes", description: "Collaborateurs, données de paie importées et analyse des coûts de personnel.", status: "planned", linkedTo: ["compta", "gestion"] },
  { id: "qualite", name: "Contrôle de qualité", group: "Transverse", description: "Anomalies, contrôles inter-modules, corrections validées et traçabilité.", status: "planned", linkedTo: ["compta", "ventes", "achats", "logistique"] },
];

/**
 * Contrat d'intégration comptable : tout module métier transforme ses documents en
 * écritures. Le noyau comptable valide, numérote et comptabilise — jamais le module.
 */
export interface SourceComptable<TDocument> {
  module: ModuleId;
  buildEntry(document: TDocument, config: FinanceConfig, entryId: string): JournalEntry;
}

/** Retourne, parmi les modules requis, ceux qui ne sont pas encore disponibles. */
export function missingDependencies(required: ModuleId[]): ModuleId[] {
  const available = new Set(MODULES_SADESK.filter((module) => module.status !== "planned").map((module) => module.id));
  return required.filter((dependency) => !available.has(dependency));
}
