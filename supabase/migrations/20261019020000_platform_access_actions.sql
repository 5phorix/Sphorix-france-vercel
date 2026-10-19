create or replace function public.update_platform_subscription_status(
  target_subscription_id uuid,
  target_status text,
  target_notes text default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_row public.platform_subscriptions%rowtype;
begin
  if not public.is_platform_admin() then
    raise exception 'platform administrator required' using errcode = '42501';
  end if;
  if target_status not in ('pending', 'trialing', 'active', 'past_due', 'suspended', 'cancelled', 'expired') then
    raise exception 'unsupported subscription status' using errcode = '22023';
  end if;

  select * into current_row
  from public.platform_subscriptions
  where id = target_subscription_id
  for update;

  if not found then
    raise exception 'subscription not found' using errcode = 'P0002';
  end if;

  update public.platform_subscriptions
  set status = target_status,
      notes = coalesce(target_notes, notes),
      cancelled_at = case when target_status = 'cancelled' then timezone('utc', now()) else cancelled_at end,
      updated_at = timezone('utc', now())
  where id = target_subscription_id;

  if target_status in ('suspended', 'cancelled', 'expired') then
    update public.platform_product_access
    set status = case when target_status = 'suspended' then 'suspended' else 'revoked' end,
        updated_at = timezone('utc', now())
    where subscription_id = target_subscription_id
      and status in ('pending', 'active', 'suspended');
  end if;

  insert into public.platform_admin_events (
    actor_user_id, subscriber_id, subscription_id, event_type, details
  ) values (
    auth.uid(), current_row.subscriber_id, current_row.id, 'subscription_status_changed',
    jsonb_build_object('from', current_row.status, 'to', target_status, 'product_code', current_row.product_code)
  );
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

  update public.platform_product_access
  set status = target_status,
      external_tenant_id = nullif(btrim(coalesce(target_external_tenant_id, external_tenant_id, '')), ''),
      external_reference = nullif(btrim(coalesce(target_external_reference, external_reference, '')), ''),
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
      'external_tenant_id', target_external_tenant_id,
      'external_reference', target_external_reference
    )
  );
end;
$$;

revoke all on function public.update_platform_subscription_status(uuid, text, text) from public, anon;
revoke all on function public.update_platform_access(uuid, text, text, text) from public, anon;
grant execute on function public.update_platform_subscription_status(uuid, text, text) to authenticated;
grant execute on function public.update_platform_access(uuid, text, text, text) to authenticated;