create extension if not exists "pgcrypto";

create type public.product_kind as enum ('single', 'pack');
create type public.order_status as enum ('pending', 'paid', 'cancelled', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  kind public.product_kind not null default 'single',
  short_description text not null,
  description text not null,
  format text not null default 'XLSX',
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  preview_image_path text,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.product_components (
  product_id uuid not null references public.products(id) on delete cascade,
  component_product_id uuid not null references public.products(id) on delete restrict,
  primary key (product_id, component_product_id),
  check (product_id <> component_product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  stripe_checkout_session_id text unique,
  status public.order_status not null default 'pending',
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  customer_email text not null,
  created_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null default 1 check (quantity > 0)
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_file_id uuid not null references public.product_files(id) on delete restrict,
  download_count integer not null default 0 check (download_count >= 0),
  last_downloaded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (order_item_id, product_file_id)
);

create table public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  contact_type text not null check (contact_type in ('particulier', 'entreprise')),
  full_name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  company_name text,
  company_role text,
  siret text,
  activity text,
  consent boolean not null,
  marketing_consent boolean not null default false,
  retention_months integer not null check (retention_months between 1 and 120),
  policy_version text not null,
  source_ip text,
  user_agent text,
  admin_email_sent boolean not null default false,
  acknowledgement_sent boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index products_active_idx on public.products (is_active, created_at desc);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index contact_leads_created_idx on public.contact_leads (created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_files enable row level security;
alter table public.product_components enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.downloads enable row level security;
alter table public.contact_leads enable row level security;

create policy "Public can read active products"
on public.products for select
using (is_active = true);

create policy "Public can read categories with active products"
on public.categories for select
using (exists (
  select 1 from public.products
  where products.category_id = categories.id and products.is_active = true
));

create policy "Users can read their profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read their orders"
on public.orders for select
using (auth.uid() = user_id);

create policy "Users can read their order items"
on public.order_items for select
using (exists (
  select 1 from public.orders
  where orders.id = order_items.order_id and orders.user_id = auth.uid()
));

create policy "Users can read their downloads"
on public.downloads for select
using (auth.uid() = user_id);

insert into public.categories (name, slug, description, sort_order)
values
  ('Gestion des ventes', 'gestion-ventes', 'Outils simples pour suivre les ventes.', 10),
  ('Gestion des dépenses', 'gestion-depenses', 'Modèles pour organiser les dépenses.', 20),
  ('Trésorerie', 'tresorerie', 'Suivi clair des entrées, sorties et soldes.', 30),
  ('Tableaux de bord', 'tableaux-de-bord', 'Indicateurs essentiels pour les petites entreprises.', 40),
  ('Packs', 'packs', 'Ensembles d’outils complémentaires.', 50),
  ('Modèles professionnels', 'modeles-professionnels', 'Documents prêts à adapter.', 60)
on conflict (slug) do nothing;
