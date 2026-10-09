export type ProductLabEntry = {
  slug: string;
  name: string;
  fileName?: string;
  appPath?: string;
  priceLabel: string;
  summary: string;
  status: "à reconstruire" | "en conception";
  testPoints: string[];
};

export const productLabEntries: ProductLabEntry[] = [
  {
    slug: "tableau-suivi-tresorerie",
    name: "Tableau de suivi de trésorerie",
    fileName: "tableau-suivi-tresorerie.xlsx",
    appPath: "/produits/tresorerie",
    priceLabel: "29,00 €",
    summary: "Première application React locale : flux, prévision 90 jours, seuil et alertes.",
    status: "en conception",
    testPoints: ["Saisie des flux", "Solde prévisionnel", "Alertes de trésorerie"],
  },
  {
    slug: "tableau-suivi-depenses",
    name: "Sadesk Suivi des Dépenses",
    fileName: "tableau-suivi-depenses.xlsx",
    appPath: "/produits/depenses",
    priceLabel: "19,00 €",
    summary: "Application React locale : dépenses, budgets mensuels et analyse des écarts.",
    status: "en conception",
    testPoints: ["Catégorisation", "Budget par poste", "Analyse des écarts"],
  },
  {
    slug: "tableau-bord-petite-entreprise",
    name: "Tableau de bord petite entreprise",
    fileName: "tableau-bord-petite-entreprise.xlsx",
    priceLabel: "49,00 €",
    summary: "Prototype actuel à reconstruire autour d'indicateurs réellement décisionnels.",
    status: "à reconstruire",
    testPoints: ["Indicateurs mensuels", "Comparaison aux objectifs", "Décisions à suivre"],
  },
  {
    slug: "pack-gestion-essentielle",
    name: "Pack Gestion essentielle",
    priceLabel: "79,00 €",
    summary: "Aucun livrable pack autonome n'existe encore : il sera produit après validation des trois outils.",
    status: "en conception",
    testPoints: ["Parcours commun", "Guide de démarrage", "Cohérence des données"],
  },
];

export function getProductLabEntry(slug: string) {
  return productLabEntries.find((product) => product.slug === slug) ?? null;
}