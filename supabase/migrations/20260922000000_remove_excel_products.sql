update public.products
set is_active = false,
    updated_at = timezone('utc', now())
where slug in (
  'pack-gestion-essentielle',
  'tableau-suivi-tresorerie',
  'tableau-suivi-depenses',
  'tableau-bord-petite-entreprise'
);