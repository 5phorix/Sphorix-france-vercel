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
  product.name,
  product.slug,
  'single'::public.product_kind,
  product.short_description,
  product.description,
  'SaaS / Web',
  0,
  true,
  product.features::jsonb,
  product.included_items::jsonb,
  product.seo_title,
  product.seo_description
from (
  values
    ('Sadesk Devis', 'sadesk-devis', 'Créez, personnalisez et suivez vos devis depuis une base prête à évoluer avec Sadesk.', 'Une brique logicielle pour préparer des devis professionnels, réutiliser vos prestations, suivre les statuts et transformer les devis acceptés en factures.', '["Catalogue de prestations réutilisable", "Devis personnalisables", "Suivi des statuts et relances", "Préparation à la conversion en facture"]', '["Accès au module Sadesk Devis", "Modèles de devis configurables", "Base de données clients et prestations", "Formule et tarif sur devis"]', 'Sadesk Devis | Logiciel de devis pour TPE et PME', 'Un logiciel de devis professionnel, conçu comme une brique de la suite Sadesk.'),
    ('Sadesk Facturation', 'sadesk-facturation', 'Émettez vos factures avec des modèles professionnels et gardez le fil des règlements.', 'Un module de facturation conçu pour prolonger les devis, centraliser les modèles de factures, suivre les échéances et préparer une gestion unifiée dans Sadesk.', '["Modèles de factures personnalisables", "Numérotation et mentions configurables", "Suivi des échéances et règlements", "Conversion d''un devis accepté"]', '["Accès au module Sadesk Facturation", "Modèles de factures prêts à adapter", "Base clients et catalogue partagés", "Formule et tarif sur devis"]', 'Sadesk Facturation | Logiciel de facturation avec modèles', 'Un logiciel de facturation avec modèles de factures, pensé pour la future suite Sadesk.'),
    ('Sadesk Budget', 'sadesk-budget', 'Construisez vos budgets, comparez le prévu au réalisé et anticipez vos décisions.', 'Une base de budgétisation pour définir des objectifs par période ou activité, suivre les écarts et alimenter les tableaux de bord Sadesk.', '["Budgets par période et catégorie", "Comparaison prévu / réalisé", "Analyse des écarts", "Indicateurs prêts pour les tableaux de bord"]', '["Accès au module Sadesk Budget", "Structure budgétaire configurable", "Vues de suivi mensuelles", "Formule et tarif sur devis"]', 'Sadesk Budget | Logiciel de budgétisation', 'Une base de budgétisation pour piloter les objectifs et les écarts de votre entreprise.'),
    ('Sadesk Dépenses & Trésorerie', 'sadesk-depenses-tresorerie', 'Centralisez vos dépenses et suivez votre trésorerie dans une vue exploitable.', 'Une brique de pilotage pour enregistrer les dépenses, catégoriser les mouvements, suivre les encaissements et comprendre l''évolution de la trésorerie.', '["Saisie et catégorisation des dépenses", "Suivi des entrées et sorties", "Soldes et échéances", "Données partagées avec les tableaux de bord"]', '["Accès au module Sadesk Dépenses & Trésorerie", "Catégories personnalisables", "Vues de trésorerie", "Formule et tarif sur devis"]', 'Sadesk Dépenses & Trésorerie | Logiciel de suivi', 'Un module Sadesk pour suivre les dépenses, les encaissements et la trésorerie.'),
    ('Sadesk Tableaux de bord', 'sadesk-tableaux-de-bord', 'Rassemblez vos indicateurs de vente, facturation, budget et trésorerie au même endroit.', 'Une couche de pilotage pour transformer les données des modules Sadesk en indicateurs clairs, filtrables et adaptés à votre activité.', '["Indicateurs de chiffre d''affaires et de marge", "Vues facturation et règlements", "Suivi budget et trésorerie", "Tableaux adaptés aux besoins de l''entreprise"]', '["Accès au module Sadesk Tableaux de bord", "Indicateurs configurables", "Filtres par période et activité", "Formule et tarif sur devis"]', 'Sadesk Tableaux de bord | Pilotage d''entreprise', 'Des tableaux de bord pour réunir les indicateurs clés de la suite Sadesk.')
) as product(name, slug, short_description, description, features, included_items, seo_title, seo_description)
join public.categories on categories.slug = 'abonnements'
on conflict (slug) do update set
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