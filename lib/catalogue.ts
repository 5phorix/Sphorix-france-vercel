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
    id: "prod-sadesk",
    category_id: "cat-5",
    name: "Abonnement Sadesk Compta",
    slug: "abonnement-sadesk-compta",
    kind: "single",
    short_description: "Solution logicielle et suivi comptable sur mesure pour TPE, artisans et PME.",
    description: "Accédez à la plateforme Sadesk Compta pour centraliser la gestion de votre comptabilité, l’enregistrement de vos pièces justificatives, le suivi de trésorerie et la transmission simplifiée à votre expert-comptable.",
    format: "SaaS / Web",
    price_cents: 0,
    currency: "EUR",
    preview_image_path: null,
    is_active: true,
    features: ["Centralisation des pièces comptables", "Suivi de trésorerie et facturation", "Interface adaptée TPE et PME", "Accompagnement et configuration sur mesure"],
    included_items: ["Accès plateforme Sadesk Compta", "Assistance au paramétrage", "Support technique réactif", "Formule et tarif sur devis"],
    seo_title: "Abonnement Sadesk Compta | Gestion comptable TPE & PME",
    seo_description: "Découvrez Sadesk Compta par Sphorix France : abonnement logiciel et suivi comptable simplifié sur devis.",
    created_at: "2026-09-12T00:00:00Z",
    updated_at: "2026-09-12T00:00:00Z",
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
    return { products: FALLBACK_PRODUCTS, categories: FALLBACK_CATEGORIES };
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

    const allProducts = (products ?? []) as CatalogueProduct[];
    const hasSadesk = allProducts.some((p) => p.slug === "abonnement-sadesk-compta");
    if (!hasSadesk) {
      allProducts.unshift(FALLBACK_PRODUCTS[0]);
    }

    const allCategories = (categories ?? []) as Category[];
    const hasAbonnementsCat = allCategories.some((c) => c.slug === "abonnements");
    if (!hasAbonnementsCat) {
      allCategories.push(FALLBACK_CATEGORIES[4]);
    }

    return {
      products: allProducts,
      categories: allCategories,
    };
  } catch {
    return { products: FALLBACK_PRODUCTS, categories: FALLBACK_CATEGORIES };
  }
}

export async function getProductBySlug(slug: string) {
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
