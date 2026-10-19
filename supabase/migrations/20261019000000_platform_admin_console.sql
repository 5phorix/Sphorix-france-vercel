create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'support')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.platform_products (
  code text primary key check (code in ('sadesk-compta', 'sphorix-connect')),
  name text not null,
  status text not null default 'active' check (status in ('active', 'beta', 'maintenance', 'retired')),
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.platform_products (code, name, status, description)
values
  ('sadesk-compta', 'Sadesk Compta', 'beta', 'Gestion comptable et financière des sociétés clientes.'),
  ('sphorix-connect', 'Sphorix Connect', 'beta', 'Connecteurs, transferts et intégrations des sociétés clientes.')
on conflict (code) do nothing;

create table public.platform_plans (
  id uuid primary key default gen_random_uuid(),
  product_code text not null references public.platform_products(code) on delete restrict,
  name text not null,
  billing_interval text not null default 'custom'
    check (billing_interval in ('monthly', 'yearly', 'one_time', 'custom')),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_code, name)
);

create table public.platform_subscribers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null default '',
  email text not null check (email = lower(btrim(email)) and position('@' in email) > 1),
  phone text not null default '',
  status text not null default 'prospect'
    check (status in ('prospect', 'active', 'past_due', 'suspended', 'archived')),
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index platform_subscribers_email_idx on public.platform_subscribers (lower(email));
create index platform_subscribers_status_idx on public.platform_subscribers (status, created_at desc);

create table public.platform_subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.platform_subscribers(id) on delete restrict,
  product_code text not null references public.platform_products(code) on delete restrict,
  plan_id uuid references public.platform_plans(id) on delete set null,
  plan_name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'trialing', 'active', 'past_due', 'suspended', 'cancelled', 'expired')),
  billing_provider text not null default 'manual'
    check (billing_provider in ('manual', 'stripe', 'mollie', 'paddle')),
  billing_interval text not null default 'custom'
    check (billing_interval in ('monthly', 'yearly', 'one_time', 'custom')),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  starts_at timestamptz not null default timezone('utc', now()),
  current_period_end timestamptz,
  cancelled_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (current_period_end is null or current_period_end >= starts_at)
);

create index platform_subscriptions_subscriber_idx on public.platform_subscriptions (subscriber_id, created_at desc);
create index platform_subscriptions_product_status_idx on public.platform_subscriptions (product_code, status, created_at desc);

create table public.platform_product_access (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.platform_subscriptions(id) on delete restrict,
  product_code text not null references public.platform_products(code) on delete restrict,
  external_tenant_id text,
  access_kind text not null default 'provisioning'
    check (access_kind in ('provisioning', 'invitation', 'api_key', 'activation_link')),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended', 'revoked', 'expired')),
  external_reference text,
  secret_prefix text,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (external_tenant_id is null or btrim(external_tenant_id) <> ''),
  check (secret_prefix is null or btrim(secret_prefix) <> '')
);

create index platform_product_access_subscription_idx on public.platform_product_access (subscription_id, created_at desc);

create table public.platform_admin_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  subscriber_id uuid references public.platform_subscribers(id) on delete set null,
  subscription_id uuid references public.platform_subscriptions(id) on delete set null,
  event_type text not null,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default timezone('utc', now())
);

create index platform_admin_events_created_idx on public.platform_admin_events (created_at desc);

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = auth.uid() and is_active
  );
$$;

revoke all on function public.is_platform_admin() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'platform_admins', 'platform_products', 'platform_plans', 'platform_subscribers',
    'platform_subscriptions', 'platform_product_access', 'platform_admin_events'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('grant all on public.%I to service_role', table_name);
  end loop;
end;
$$;

create policy platform_admins_read_self
  on public.platform_admins for select to authenticated
  using (user_id = auth.uid());

create policy platform_products_admin_all
  on public.platform_products for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy platform_plans_admin_all
  on public.platform_plans for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy platform_subscribers_admin_all
  on public.platform_subscribers for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy platform_subscriptions_admin_all
  on public.platform_subscriptions for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy platform_access_admin_all
  on public.platform_product_access for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy platform_events_admin_read
  on public.platform_admin_events for select to authenticated
  using (public.is_platform_admin());

create policy platform_events_admin_insert
  on public.platform_admin_events for insert to authenticated
  with check (public.is_platform_admin() and actor_user_id = auth.uid());