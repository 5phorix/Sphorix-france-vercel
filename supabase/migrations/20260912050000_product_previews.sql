update public.products
set preview_image_path = case slug
  when 'tableau-suivi-tresorerie' then '/products/tableau-suivi-tresorerie.png'
  when 'tableau-suivi-depenses' then '/products/tableau-suivi-depenses.png'
  when 'tableau-bord-petite-entreprise' then '/products/tableau-bord-petite-entreprise.png'
  when 'pack-gestion-essentielle' then '/products/tableau-bord-petite-entreprise.png'
  else preview_image_path
end
where slug in (
  'tableau-suivi-tresorerie',
  'tableau-suivi-depenses',
  'tableau-bord-petite-entreprise',
  'pack-gestion-essentielle'
);