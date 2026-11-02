alter table public.platform_subscribers
  add column user_id uuid unique references auth.users(id) on delete set null;

create table public.client_projects (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.platform_subscribers(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'waiting_client', 'completed', 'on_hold')),
  due_at date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint client_projects_id_subscriber_id_key unique (id, subscriber_id)
);

create index client_projects_subscriber_idx
  on public.client_projects (subscriber_id, updated_at desc);

create table public.client_project_steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index client_project_steps_project_idx
  on public.client_project_steps (project_id, sort_order, created_at);

create table public.client_project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_role text not null check (author_role in ('admin', 'client')),
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  created_at timestamptz not null default timezone('utc', now())
);

create index client_project_updates_project_idx
  on public.client_project_updates (project_id, created_at);

create table public.client_portal_documents (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.platform_subscribers(id) on delete cascade,
  project_id uuid,
  category text not null
    check (category in ('document', 'deliverable', 'quote', 'invoice')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  original_name text not null check (char_length(original_name) between 1 and 255),
  storage_path text not null unique,
  mime_type text not null,
  file_size integer not null check (file_size between 1 and 26214400),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint client_portal_documents_project_owner
    foreign key (project_id, subscriber_id)
    references public.client_projects(id, subscriber_id)
);

create index client_portal_documents_subscriber_idx
  on public.client_portal_documents (subscriber_id, created_at desc);

create table public.client_invitations (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.platform_subscribers(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index client_invitations_pending_idx
  on public.client_invitations (subscriber_id, expires_at desc)
  where accepted_at is null;

create or replace function public.create_client_portal_subscriber(
  target_company_name text,
  target_contact_name text,
  target_email text,
  target_phone text,
  target_actor_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  created_subscriber_id uuid;
  normalized_email text := lower(btrim(coalesce(target_email, '')));
begin
  if not exists (
    select 1
    from public.platform_admins
    where user_id = target_actor_user_id
      and is_active
      and role in ('owner', 'admin')
  ) then
    raise exception 'platform administrator required' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(target_company_name, ''))) not between 2 and 160 then
    raise exception 'company name must contain between 2 and 160 characters' using errcode = '22023';
  end if;
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' then
    raise exception 'valid email is required' using errcode = '22023';
  end if;
  if exists (select 1 from public.platform_subscribers where email = normalized_email) then
    raise exception 'subscriber email already exists' using errcode = '23505';
  end if;

  insert into public.platform_subscribers (
    company_name, contact_name, email, phone, status
  ) values (
    btrim(target_company_name),
    btrim(coalesce(target_contact_name, '')),
    normalized_email,
    btrim(coalesce(target_phone, '')),
    'prospect'
  ) returning id into created_subscriber_id;

  insert into public.platform_admin_events (
    actor_user_id, subscriber_id, event_type, details
  ) values (
    target_actor_user_id,
    created_subscriber_id,
    'subscriber_created',
    jsonb_build_object('source', 'client_portal_console')
  );

  return created_subscriber_id;
end;
$$;

revoke all on function public.create_client_portal_subscriber(text, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.create_client_portal_subscriber(text, text, text, text, uuid)
  to service_role;

create or replace function public.client_owns_subscriber(target_subscriber_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.platform_subscribers
    where id = target_subscriber_id and user_id = auth.uid()
  );
$$;

create or replace function public.client_owns_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.client_projects
    join public.platform_subscribers
      on platform_subscribers.id = client_projects.subscriber_id
    where client_projects.id = target_project_id
      and platform_subscribers.user_id = auth.uid()
  );
$$;

revoke all on function public.client_owns_subscriber(uuid) from public, anon;
revoke all on function public.client_owns_project(uuid) from public, anon;
grant execute on function public.client_owns_subscriber(uuid) to authenticated;
grant execute on function public.client_owns_project(uuid) to authenticated;

alter table public.client_projects enable row level security;
alter table public.client_project_steps enable row level security;
alter table public.client_project_updates enable row level security;
alter table public.client_portal_documents enable row level security;
alter table public.client_invitations enable row level security;

revoke all on public.client_projects, public.client_project_steps, public.client_project_updates,
  public.client_portal_documents, public.client_invitations
  from public, anon, authenticated;
grant select on public.client_projects, public.client_project_steps, public.client_project_updates,
  public.client_portal_documents to authenticated;
grant insert on public.client_project_updates to authenticated;
grant all on public.client_projects, public.client_project_steps, public.client_project_updates,
  public.client_portal_documents, public.client_invitations to service_role;

create policy client_projects_admin_all
  on public.client_projects for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy client_projects_read_own
  on public.client_projects for select to authenticated
  using (public.client_owns_subscriber(subscriber_id));

create policy client_project_updates_admin_all
  on public.client_project_updates for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy client_project_steps_admin_all
  on public.client_project_steps for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy client_project_steps_read_own
  on public.client_project_steps for select to authenticated
  using (public.client_owns_project(project_id));

create policy client_project_updates_read_own
  on public.client_project_updates for select to authenticated
  using (public.client_owns_project(project_id));

create policy client_project_updates_insert_own
  on public.client_project_updates for insert to authenticated
  with check (
    author_role = 'client'
    and author_user_id = auth.uid()
    and public.client_owns_project(project_id)
  );

create policy client_portal_documents_admin_all
  on public.client_portal_documents for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy client_portal_documents_read_own
  on public.client_portal_documents for select to authenticated
  using (public.client_owns_subscriber(subscriber_id));

revoke all on public.client_invitations from public, anon, authenticated;

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'client-portal-private',
  'client-portal-private',
  false,
  26214400,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists client_portal_storage_admin_read on storage.objects;
drop policy if exists client_portal_storage_admin_insert on storage.objects;
drop policy if exists client_portal_storage_admin_delete on storage.objects;
create policy client_portal_storage_admin_read
  on storage.objects for select to authenticated
  using (bucket_id = 'client-portal-private' and public.is_platform_admin());
create policy client_portal_storage_admin_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'client-portal-private' and public.is_platform_admin());
create policy client_portal_storage_admin_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'client-portal-private' and public.is_platform_admin());
