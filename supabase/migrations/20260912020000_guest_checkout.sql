alter table public.orders
  alter column user_id drop not null;

create index if not exists orders_customer_email_idx
  on public.orders(customer_email);
