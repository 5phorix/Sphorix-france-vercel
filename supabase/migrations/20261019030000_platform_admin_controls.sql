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
    where user_id = auth.uid() and is_active and role in ('owner', 'admin')
  );
$$;

create or replace function public.create_platform_subscriber(
  target_company_name text,
  target_contact_name text,
  target_email text,
  target_phone text default '',
  target_notes text default ''
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_subscriber_id uuid;
  normalized_email text := lower(btrim(coalesce(target_email, '')));
begin
  if not public.is_platform_admin() then
    raise exception 'platform administrator required' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(target_company_name, ''))) not between 2 and 160 then
    raise exception 'company name must contain between 2 and 160 characters' using errcode = '22023';
  end if;
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' then
    raise exception 'valid email is required' using errcode = '22023';
  end if;

  insert into public.platform_subscribers (company_name, contact_name, email, phone, status, notes)
  values (
    btrim(target_company_name),
    btrim(coalesce(target_contact_name, '')),
    normalized_email,
    btrim(coalesce(target_phone, '')),
    'prospect',
    btrim(coalesce(target_notes, ''))
  ) returning id into created_subscriber_id;

  insert into public.platform_admin_events (actor_user_id, subscriber_id, event_type, details)
  values (auth.uid(), created_subscriber_id, 'subscriber_created', jsonb_build_object('source', 'administration_console'));

  return created_subscriber_id;
end;
$$;

create or replace function public.update_platform_access(
  target_access_id uuid,
  target_status text,
  target_external_tenant_id text default null,
  target_external_reference text default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_row public.platform_product_access%rowtype;
  subscription_status text;
  normalized_tenant_id text := nullif(btrim(coalesce(target_external_tenant_id, '')), '');
begin
  if not public.is_platform_admin() then
    raise exception 'platform administrator required' using errcode = '42501';
  end if;
  if target_status not in ('pending', 'active', 'suspended', 'revoked', 'expired') then
    raise exception 'unsupported access status' using errcode = '22023';
  end if;

  select * into current_row
  from public.platform_product_access
  where id = target_access_id
  for update;

  if not found then
    raise exception 'product access not found' using errcode = 'P0002';
  end if;

  select status into subscription_status
  from public.platform_subscriptions
  where id = current_row.subscription_id;

  if target_status = 'active' and subscription_status not in ('active', 'trialing') then
    raise exception 'subscription must be active or trialing before granting access' using errcode = '23514';
  end if;
  if target_status = 'active' and normalized_tenant_id is null and current_row.external_tenant_id is null then
    raise exception 'external tenant id is required to activate product access' using errcode = '23514';
  end if;

  update public.platform_product_access
  set status = target_status,
      external_tenant_id = coalesce(normalized_tenant_id, external_tenant_id),
      external_reference = coalesce(nullif(btrim(coalesce(target_external_reference, '')), ''), external_reference),
      updated_at = timezone('utc', now())
  where id = target_access_id;

  insert into public.platform_admin_events (
    actor_user_id, subscription_id, event_type, details
  ) values (
    auth.uid(), current_row.subscription_id, 'product_access_updated',
    jsonb_build_object(
      'product_code', current_row.product_code,
      'from', current_row.status,
      'to', target_status,
      'external_tenant_id', coalesce(normalized_tenant_id, current_row.external_tenant_id)
    )
  );
end;
$$;

revoke all on function public.create_platform_subscriber(text, text, text, text, text) from public, anon;
grant execute on function public.create_platform_subscriber(text, text, text, text, text) to authenticated;
revoke all on function public.update_platform_access(uuid, text, text, text) from public, anon;
grant execute on function public.update_platform_access(uuid, text, text, text) to authenticated;