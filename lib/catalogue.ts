import type { Database } from "@/types/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/catalogue-types";

export { type Product } from "@/lib/catalogue-types";

/* Server-only data access for the catalogue. */
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

type CatalogueProduct = ProductRow & {
  categories?: Database["public"]["Tables"]["categories"]["Row"] | null;
};

type Category = Database["public"]["Tables"]["categories"]["Row"];

const LEGACY_EXCEL_SLUGS = new Set([
  "abonnement-sadesk-compta",
  "pack-gestion-essentielle",
  "tableau-suivi-tresorerie",
  "tableau-suivi-depenses",
  "tableau-bord-petite-entreprise",
]);

const PRODUCT_COVER_PATHS: Record<string, string> = {
  "sadesk-devis": "/images/devis.png",
  "sadesk-facturation": "/images/facturation.png",
  "sadesk-budget": "/images/Budget.png",
  "sadesk-depenses-tresorerie": "/images/Depenses.png",
  "sadesk-tableaux-de-bord": "/images/Tableaux-de-bord.png",
};

function isSellableProduct(product: CatalogueProduct) {
  return !LEGACY_EXCEL_SLUGS.has(product.slug);
}

function withProductCover(product: CatalogueProduct): CatalogueProduct {
  return PRODUCT_COVER_PATHS[product.slug]
    ? { ...product, preview_image_path: PRODUCT_COVER_PATHS[product.slug] }
    : product;
}

function hasSupabaseConfiguration() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Gestion des dépenses", slug: "gestion-depenses", description: "Modèles pour organiser les dépenses", sort_order: 10, created_at: "2026-09-12T00:00:00Z" },
  { id: "cat-2", name: "Trésorerie", slug: "tresorerie", description: "Suivi clair des entrées, sorties et soldes", sort_order: 20, created_at: "2026-09-12T00:00:00Z" },
  { id: "cat-3", name: "Tableaux de bord", slug: "tableaux-de-bord", description: "Indicateurs essentiels pour les petites entreprises", sort_order: 30, created_at: "2026-09-12T00:00:00Z" },
  { id: "cat-4", name: "Packs", slug: "packs", description: "Ensembles d’outils complémentaires", sort_order: 40, created_at: "2026-09-12T00:00:00Z" },
  { id: "cat-5", name: "Logiciels & Abonnements", slug: "abonnements", description: "Solutions logicielles et accompagnement récurrent", sort_order: 50, created_at: "2026-09-12T00:00:00Z" },
];

const FALLBACK_PRODUCTS: CatalogueProduct[] = [
  {
    id: "prod-sadesk-devis",
    category_id: "cat-5",
    name: "Sadesk Devis",
    slug: "sadesk-devis",
    kind: "single",
    short_description: "Créez, personnalisez et suivez vos devis depuis une base prête à évoluer avec Sadesk.",
    description: "Une brique logicielle pour préparer des devis professionnels, réutiliser vos prestations, suivre les statuts et transformer les devis acceptés en factures.",
    format: "SaaS / Web",
    price_cents: 0,
    currency: "EUR",
    preview_image_path: "/images/devis.png",
    is_active: true,
    features: ["Catalogue de prestations réutilisable", "Devis personnalisables", "Suivi des statuts et relances", "Préparation à la conversion en facture"],
    included_items: ["Accès au module Sadesk Devis", "Modèles de devis configurables", "Base de données clients et prestations", "Formule et tarif sur devis"],
    seo_title: "Sadesk Devis | Logiciel de devis pour TPE et PME",
    seo_description: "Un logiciel de devis professionnel, conçu comme une brique de la suite Sadesk.",
    created_at: "2026-09-21T00:00:00Z",
    updated_at: "2026-09-21T00:00:00Z",
    categories: FALLBACK_CATEGORIES[4],
  },
  {
    id: "prod-sadesk-facturation",
    category_id: "cat-5",
    name: "Sadesk Facturation",
    slug: "sadesk-facturation",
    kind: "single",
    short_description: "Émettez vos factures avec des modèles professionnels et gardez le fil des règlements.",
    description: "Un module de facturation conçu pour prolonger les devis, centraliser les modèles de factures, suivre les échéances et préparer une gestion unifiée dans Sadesk.",
    format: "SaaS / Web",
    price_cents: 0,
    currency: "EUR",
    preview_image_path: "/images/facturation.png",
    is_active: true,
    features: ["Modèles de factures personnalisables", "Numérotation et mentions configurables", "Suivi des échéances et règlements", "Conversion d'un devis accepté"],
    included_items: ["Accès au module Sadesk Facturation", "Modèles de factures prêts à adapter", "Base clients et catalogue partagés", "Formule et tarif sur devis"],
    seo_title: "Sadesk Facturation | Logiciel de facturation avec modèles",
    seo_description: "Un logiciel de facturation avec modèles de factures, pensé pour la future suite Sadesk.",
    created_at: "2026-09-21T00:00:00Z",
    updated_at: "2026-09-21T00:00:00Z",
    categories: FALLBACK_CATEGORIES[4],
  },
  {
    id: "prod-sadesk-budget",
    category_id: "cat-5",
    name: "Sadesk Budget",
    slug: "sadesk-budget",
    kind: "single",
    short_description: "Construisez vos budgets, comparez le prévu au réalisé et anticipez vos décisions.",
    description: "Une base de budgétisation pour définir des objectifs par période ou activité, suivre les écarts et alimenter les tableaux de bord Sadesk.",
    format: "SaaS / Web",
    price_cents: 0,
    currency: "EUR",
    preview_image_path: "/images/Budget.png",
    is_active: true,
    features: ["Budgets par période et catégorie", "Comparaison prévu / réalisé", "Analyse des écarts", "Indicateurs prêts pour les tableaux de bord"],
    included_items: ["Accès au module Sadesk Budget", "Structure budgétaire configurable", "Vues de suivi mensuelles", "Formule et tarif sur devis"],
    seo_title: "Sadesk Budget | Logiciel de budgétisation",
    seo_description: "Une base de budgétisation pour piloter les objectifs et les écarts de votre entreprise.",
    created_at: "2026-09-21T00:00:00Z",
    updated_at: "2026-09-21T00:00:00Z",
    categories: FALLBACK_CATEGORIES[4],
  },
  {
    id: "prod-sadesk-pilotage",
    category_id: "cat-5",
    name: "Sadesk Dépenses & Trésorerie",
    slug: "sadesk-depenses-tresorerie",
    kind: "single",
    short_description: "Centralisez vos dépenses et suivez votre trésorerie dans une vue exploitable.",
    description: "Une brique de pilotage pour enregistrer les dépenses, catégoriser les mouvements, suivre les encaissements et comprendre l'évolution de la trésorerie.",
    format: "SaaS / Web",
    price_cents: 0,
    currency: "EUR",
    preview_image_path: "/images/Depenses.png",
    is_active: true,
    features: ["Saisie et catégorisation des dépenses", "Suivi des entrées et sorties", "Soldes et échéances", "Données partagées avec les tableaux de bord"],
    included_items: ["Accès au module Sadesk Dépenses & Trésorerie", "Catégories personnalisables", "Vues de trésorerie", "Formule et tarif sur devis"],
    seo_title: "Sadesk Dépenses & Trésorerie | Logiciel de suivi",
    seo_description: "Un module Sadesk pour suivre les dépenses, les encaissements et la trésorerie.",
    created_at: "2026-09-21T00:00:00Z",
    updated_at: "2026-09-21T00:00:00Z",
    categories: FALLBACK_CATEGORIES[4],
  },
  {
    id: "prod-sadesk-tableaux-bord",
    category_id: "cat-5",
    name: "Sadesk Tableaux de bord",
    slug: "sadesk-tableaux-de-bord",
    kind: "single",
    short_description: "Rassemblez vos indicateurs de vente, facturation, budget et trésorerie au même endroit.",
    description: "Une couche de pilotage pour transformer les données des modules Sadesk en indicateurs clairs, filtrables et adaptés à votre activité.",
    format: "SaaS / Web",
    price_cents: 0,
    currency: "EUR",
    preview_image_path: "/images/Tableaux-de-bord.png",
    is_active: true,
    features: ["Indicateurs de chiffre d'affaires et de marge", "Vues facturation et règlements", "Suivi budget et trésorerie", "Tableaux adaptés aux besoins de l'entreprise"],
    included_items: ["Accès au module Sadesk Tableaux de bord", "Indicateurs configurables", "Filtres par période et activité", "Formule et tarif sur devis"],
    seo_title: "Sadesk Tableaux de bord | Pilotage d'entreprise",
    seo_description: "Des tableaux de bord pour réunir les indicateurs clés de la suite Sadesk.",
    created_at: "2026-09-21T00:00:00Z",
    updated_at: "2026-09-21T00:00:00Z",
    categories: FALLBACK_CATEGORIES[4],
  },
  {
    id: "prod-pack",
    category_id: "cat-4",
    name: "Pack Gestion essentielle",
    slug: "pack-gestion-essentielle",
    kind: "pack",
    short_description: "Une base complète pour enregistrer, lire et suivre les chiffres essentiels de votre activité.",
    description: "Le pack réunit les trois outils de lancement Sphorix pour commencer avec une méthode simple : suivre la trésorerie, organiser les dépenses et lire les indicateurs essentiels.",
    format: "XLSX + PDF",
    price_cents: 7900,
    currency: "EUR",
    preview_image_path: null,
    is_active: true,
    features: ["Suivi de trésorerie", "Suivi des dépenses", "Tableau de bord petite entreprise"],
    included_items: ["3 fichiers Excel", "Guide de démarrage PDF", "Licence d’utilisation pour une entreprise"],
    seo_title: "Pack de gestion Excel pour petite entreprise",
    seo_description: "Un pack Sphorix avec trois outils Excel pour suivre la trésorerie, les dépenses et les indicateurs.",
    created_at: "2026-09-12T00:00:00Z",
    updated_at: "2026-09-12T00:00:00Z",
    categories: FALLBACK_CATEGORIES[3],
  },
  {
    id: "prod-treso",
    category_id: "cat-2",
    name: "Tableau de suivi de trésorerie",
    slug: "tableau-suivi-tresorerie",
    kind: "single",
    short_description: "Une vue simple pour suivre les entrées, sorties et solde de votre activité.",
    description: "Un modèle clair pour suivre votre trésorerie mois après mois, repérer les variations et garder une vision fiable de vos disponibilités.",
    format: "XLSX",
    price_cents: 2900,
    currency: "EUR",
    preview_image_path: null,
    is_active: true,
    features: ["Suivi mensuel des entrées et sorties", "Calcul automatique du solde", "Lecture synthétique de la trésorerie"],
    included_items: ["1 fichier Excel prêt à utiliser", "Onglet de saisie", "Tableau de synthèse"],
    seo_title: "Tableau de suivi de trésorerie pour petite entreprise",
    seo_description: "Un outil Excel simple pour suivre les entrées, sorties et soldes de votre trésorerie.",
    created_at: "2026-09-12T00:00:00Z",
    updated_at: "2026-09-12T00:00:00Z",
    categories: FALLBACK_CATEGORIES[1],
  },
  {
    id: "prod-depenses",
    category_id: "cat-1",
    name: "Tableau de suivi des dépenses",
    slug: "tableau-suivi-depenses",
    kind: "single",
    short_description: "Catégorisez vos charges et identifiez rapidement les postes qui comptent.",
    description: "Un outil pratique pour enregistrer, classer et analyser vos dépenses afin de mieux comprendre la structure de vos coûts.",
    format: "XLSX",
    price_cents: 1900,
    currency: "EUR",
    preview_image_path: null,
    is_active: true,
    features: ["Saisie structurée des dépenses", "Catégorisation des charges", "Totaux mensuels et annuels"],
    included_items: ["1 fichier Excel prêt à utiliser", "Catégories personnalisables", "Synthèse des dépenses"],
    seo_title: "Tableau de suivi des dépenses pour entreprise",
    seo_description: "Un modèle Excel pour organiser, catégoriser et analyser les dépenses de votre activité.",
    created_at: "2026-09-12T00:00:00Z",
    updated_at: "2026-09-12T00:00:00Z",
    categories: FALLBACK_CATEGORIES[0],
  },
  {
    id: "prod-tb",
    category_id: "cat-3",
    name: "Tableau de bord simplifié pour petite entreprise",
    slug: "tableau-bord-petite-entreprise",
    kind: "single",
    short_description: "Rassemblez vos chiffres essentiels dans une vue lisible et directement exploitable.",
    description: "Un tableau de bord conçu pour relier chiffre d’affaires, dépenses, résultat simplifié, trésorerie et indicateurs clés.",
    format: "XLSX",
    price_cents: 4900,
    currency: "EUR",
    preview_image_path: null,
    is_active: true,
    features: ["Vue synthétique de l’activité", "Indicateurs financiers essentiels", "Graphiques de lecture rapide"],
    included_items: ["1 tableau de bord Excel", "Onglets de données", "Indicateurs et graphiques"],
    seo_title: "Tableau de bord financier pour petite entreprise",
    seo_description: "Un tableau de bord Excel pour suivre le chiffre d’affaires, les dépenses, le résultat et la trésorerie.",
    created_at: "2026-09-12T00:00:00Z",
    updated_at: "2026-09-12T00:00:00Z",
    categories: FALLBACK_CATEGORIES[2],
  },
];

export async function getCatalogue() {
  if (!hasSupabaseConfiguration()) {
    return { products: FALLBACK_PRODUCTS.filter(isSellableProduct), categories: FALLBACK_CATEGORIES };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] =
      await Promise.all([
        supabase
          .from("products")
          .select("*, categories(*)")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

    const allProducts = ((products ?? []) as CatalogueProduct[]).filter(isSellableProduct).map(withProductCover);
    const existingSlugs = new Set(allProducts.map((product) => product.slug));
    for (const fallbackProduct of FALLBACK_PRODUCTS) {
      if (!existingSlugs.has(fallbackProduct.slug)) {
        allProducts.push(fallbackProduct);
      }
    }

    const allCategories = (categories ?? []) as Category[];
    const existingCategorySlugs = new Set(allCategories.map((category) => category.slug));
    for (const fallbackCategory of FALLBACK_CATEGORIES) {
      if (!existingCategorySlugs.has(fallbackCategory.slug)) {
        allCategories.push(fallbackCategory);
      }
    }

    return {
      products: allProducts.filter(isSellableProduct),
      categories: allCategories,
    };
  } catch {
    return { products: FALLBACK_PRODUCTS.filter(isSellableProduct), categories: FALLBACK_CATEGORIES };
  }
}

export async function getProductBySlug(slug: string) {
  if (LEGACY_EXCEL_SLUGS.has(slug)) {
    return null;
  }

  if (!hasSupabaseConfiguration()) {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
    }
    return data as CatalogueProduct | null;
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

export function getProductNavigation<T extends { slug: string }>(products: T[], currentSlug: string) {
  const currentIndex = products.findIndex((product) => product.slug === currentSlug);
  if (currentIndex === -1) {
    return { prevProduct: null, nextProduct: null };
  }

  return {
    prevProduct: currentIndex > 0 ? products[currentIndex - 1] : null,
    nextProduct: currentIndex < products.length - 1 ? products[currentIndex + 1] : null,
  };
}
