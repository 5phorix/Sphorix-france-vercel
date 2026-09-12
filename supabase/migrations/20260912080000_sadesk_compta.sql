insert into public.categories (name, slug, description, sort_order)
values
  ('Logiciels & Abonnements', 'abonnements', 'Solutions logicielles et accompagnement récurrent.', 5)
on conflict (slug) do nothing;

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
  'Abonnement Sadesk Compta',
  'abonnement-sadesk-compta',
  'single',
  'Solution logicielle et suivi comptable sur mesure pour TPE, artisans et PME.',
  'Accédez à la plateforme Sadesk Compta pour centraliser la gestion de votre comptabilité, l’enregistrement de vos pièces justificatives, le suivi de trésorerie et la transmission simplifiée à votre expert-comptable.',
  'SaaS / Web',
  0,
  true,
  '["Centralisation des pièces comptables", "Suivi de trésorerie et facturation", "Interface adaptée TPE et PME", "Accompagnement et configuration sur mesure"]'::jsonb,
  '["Accès plateforme Sadesk Compta", "Assistance au paramétrage", "Support technique réactif", "Formule et tarif sur devis"]'::jsonb,
  'Abonnement Sadesk Compta | Gestion comptable TPE & PME',
  'Découvrez Sadesk Compta par Sphorix France : abonnement logiciel et suivi comptable simplifié sur devis pour votre entreprise.'
from public.categories
where categories.slug = 'abonnements'
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
