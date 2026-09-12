insert into public.products (
  category_id,
  name,
  slug,
  kind,
  short_description,
  description,
  format,
  price_cents,
  is_active,
  features,
  included_items,
  seo_title,
  seo_description
)
select
  categories.id,
  'Pack Gestion essentielle',
  'pack-gestion-essentielle',
  'pack',
  'Une base complète pour enregistrer, lire et suivre les chiffres essentiels de votre activité.',
  'Le pack réunit les trois outils de lancement Sphorix pour commencer avec une méthode simple : suivre la trésorerie, organiser les dépenses et lire les indicateurs essentiels.',
  'XLSX + PDF',
  7900,
  true,
  '["Suivi de trésorerie", "Suivi des dépenses", "Tableau de bord petite entreprise"]'::jsonb,
  '["3 fichiers Excel", "Guide de démarrage PDF", "Licence d’utilisation pour une entreprise"]'::jsonb,
  'Pack de gestion Excel pour petite entreprise',
  'Un pack Sphorix avec trois outils Excel pour suivre la trésorerie, les dépenses et les indicateurs d’une petite entreprise.'
from public.categories
where categories.slug = 'packs'
on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price_cents = excluded.price_cents,
  is_active = excluded.is_active,
  features = excluded.features,
  included_items = excluded.included_items,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = timezone('utc', now());

insert into public.product_components (product_id, component_product_id)
select pack.id, component.id
from public.products pack
cross join public.products component
where pack.slug = 'pack-gestion-essentielle'
  and component.slug in (
    'tableau-suivi-tresorerie',
    'tableau-suivi-depenses',
    'tableau-bord-petite-entreprise'
  )
on conflict (product_id, component_product_id) do nothing;
