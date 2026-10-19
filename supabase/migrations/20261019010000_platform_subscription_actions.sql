create or replace function public.create_platform_subscription(
  target_subscriber_id uuid,
  target_product_code text,
  target_plan_name text,
  target_billing_interval text,
  target_amount_cents integer,
  target_status text,
  target_starts_at timestamptz,
  target_period_end timestamptz,
  target_notes text default ''
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_subscription_id uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'platform administrator required' using errcode = '42501';
  end if;

  if target_plan_name is null or char_length(btrim(target_plan_name)) not between 1 and 120 then
    raise exception 'plan name must contain between 1 and 120 characters' using errcode = '22023';
  end if;
  if target_billing_interval not in ('monthly', 'yearly', 'one_time', 'custom') then
    raise exception 'unsupported billing interval' using errcode = '22023';
  end if;
  if target_status not in ('pending', 'trialing', 'active', 'past_due', 'suspended', 'cancelled', 'expired') then
    raise exception 'unsupported subscription status' using errcode = '22023';
  end if;
  if target_amount_cents < 0 then
    raise exception 'amount cannot be negative' using errcode = '22023';
  end if;
  if target_period_end is not null and target_period_end < target_starts_at then
    raise exception 'period end must not precede start' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.platform_products
    where code = target_product_code and status in ('active', 'beta')
  ) then
    raise exception 'product is not available for subscription' using errcode = '23503';
  end if;
  if not exists (
    select 1 from public.platform_subscribers
    where id = target_subscriber_id and status <> 'archived'
  ) then
    raise exception 'subscriber not found' using errcode = '23503';
  end if;

  insert into public.platform_subscriptions (
    subscriber_id, product_code, plan_name, status, billing_provider,
    billing_interval, amount_cents, starts_at, current_period_end, notes
  ) values (
    target_subscriber_id, target_product_code, btrim(target_plan_name), target_status,
    'manual', target_billing_interval, target_amount_cents,
    coalesce(target_starts_at, timezone('utc', now())), target_period_end,
    coalesce(target_notes, '')
  ) returning id into created_subscription_id;

  insert into public.platform_product_access (subscription_id, product_code, access_kind, status)
  values (created_subscription_id, target_product_code, 'provisioning', 'pending');

  insert into public.platform_admin_events (
    actor_user_id, subscriber_id, subscription_id, event_type, details
  ) values (
    auth.uid(), target_subscriber_id, created_subscription_id, 'subscription_created',
    jsonb_build_object(
      'product_code', target_product_code,
      'billing_provider', 'manual',
      'status', target_status,
      'amount_cents', target_amount_cents
    )
  );

  return created_subscription_id;
end;
$$;

revoke all on function public.create_platform_subscription(uuid, text, text, text, integer, text, timestamptz, timestamptz, text) from public, anon;
grant execute on function public.create_platform_subscription(uuid, text, text, text, integer, text, timestamptz, timestamptz, text) to authenticated;