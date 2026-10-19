create or replace function public.create_platform_plan(
  target_product_code text,
  target_name text,
  target_interval text,
  target_amount_cents integer,
  target_notes text default ''
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_plan_id uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'platform administrator required' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(target_name, ''))) not between 2 and 120 then
    raise exception 'plan name must contain between 2 and 120 characters' using errcode = '22023';
  end if;
  if target_interval not in ('monthly', 'yearly', 'one_time', 'custom') then
    raise exception 'unsupported billing interval' using errcode = '22023';
  end if;
  if target_amount_cents < 0 then
    raise exception 'amount cannot be negative' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.platform_products
    where code = target_product_code and status in ('active', 'beta')
  ) then
    raise exception 'product is not available for plans' using errcode = '23503';
  end if;

  insert into public.platform_plans (product_code, name, billing_interval, amount_cents, notes)
  values (target_product_code, btrim(target_name), target_interval, target_amount_cents, btrim(coalesce(target_notes, '')))
  returning id into created_plan_id;

  insert into public.platform_admin_events (actor_user_id, event_type, details)
  values (
    auth.uid(), 'platform_plan_created',
    jsonb_build_object('product_code', target_product_code, 'name', btrim(target_name), 'billing_interval', target_interval, 'amount_cents', target_amount_cents)
  );

  return created_plan_id;
end;
$$;

revoke all on function public.create_platform_plan(text, text, text, integer, text) from public, anon;
grant execute on function public.create_platform_plan(text, text, text, integer, text) to authenticated;