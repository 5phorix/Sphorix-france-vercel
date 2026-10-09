update public.products
set is_active = false,
    updated_at = timezone('utc', now())
where slug = 'abonnement-sadesk-compta';