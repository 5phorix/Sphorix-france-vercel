alter table public.products
  add column if not exists features jsonb not null default '[]'::jsonb,
  add column if not exists included_items jsonb not null default '[]'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

insert into public.products (
  category_id,
  name,
  slug,
  kind,
  short_description,
  description,
  format,
  price_cents,
  preview_image_path,
  is_active,
  features,
  included_items,
  seo_title,
  seo_description
)
select
  categories.id,
  product.name,
  product.slug,
  product.kind::public.product_kind,
  product.short_description,
  product.description,
  product.format,
  product.price_cents,
  product.preview_image_path,
  true,
  product.features::jsonb,
  product.included_items::jsonb,
  product.seo_title,
  product.seo_description
from (
  values
    (
      'tresorerie',
      'Tableau de suivi de trésorerie',
      'tableau-suivi-tresorerie',
      'single',
      'Une vue simple pour suivre les entrées, sorties et solde de votre activité.',
      'Un modèle clair pour suivre votre trésorerie mois après mois, repérer les variations et garder une vision fiable de vos disponibilités.',
      'XLSX',
      2900,
      null,
      '["Suivi mensuel des entrées et sorties", "Calcul automatique du solde", "Lecture synthétique de la trésorerie"]',
      '["1 fichier Excel prêt à utiliser", "Onglet de saisie", "Tableau de synthèse"]',
      'Tableau de suivi de trésorerie pour petite entreprise',
      'Un outil Excel simple pour suivre les entrées, sorties et soldes de votre trésorerie.'
    ),
    (
      'gestion-depenses',
      'Tableau de suivi des dépenses',
      'tableau-suivi-depenses',
      'single',
      'Catégorisez vos charges et identifiez rapidement les postes qui comptent.',
      'Un outil pratique pour enregistrer, classer et analyser vos dépenses afin de mieux comprendre la structure de vos coûts.',
      'XLSX',
      1900,
      null,
      '["Saisie structurée des dépenses", "Catégorisation des charges", "Totaux mensuels et annuels"]',
      '["1 fichier Excel prêt à utiliser", "Catégories personnalisables", "Synthèse des dépenses"]',
      'Tableau de suivi des dépenses pour entreprise',
      'Un modèle Excel pour organiser, catégoriser et analyser les dépenses de votre activité.'
    ),
    (
      'tableaux-de-bord',
      'Tableau de bord simplifié pour petite entreprise',
      'tableau-bord-petite-entreprise',
      'single',
      'Rassemblez vos chiffres essentiels dans une vue lisible et directement exploitable.',
      'Un tableau de bord conçu pour relier chiffre d’affaires, dépenses, résultat simplifié, trésorerie et indicateurs clés.',
      'XLSX',
      4900,
      null,
      '["Vue synthétique de l’activité", "Indicateurs financiers essentiels", "Graphiques de lecture rapide"]',
      '["1 tableau de bord Excel", "Onglets de données", "Indicateurs et graphiques"]',
      'Tableau de bord financier pour petite entreprise',
      'Un tableau de bord Excel pour suivre le chiffre d’affaires, les dépenses, le résultat et la trésorerie.'
    )
) as product(category_slug, name, slug, kind, short_description, description, format, price_cents, preview_image_path, features, included_items, seo_title, seo_description)
join public.categories on categories.slug = product.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  format = excluded.format,
  price_cents = excluded.price_cents,
  is_active = excluded.is_active,
  features = excluded.features,
  included_items = excluded.included_items,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = timezone('utc', now());
