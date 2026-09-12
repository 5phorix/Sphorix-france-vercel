-- Migration for updated user creation trigger to populate company_name and phone in profiles

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'company_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    company_name = coalesce(excluded.company_name, profiles.company_name),
    phone = coalesce(excluded.phone, profiles.phone),
    updated_at = timezone('utc', now());
  return new;
end;
$$;
