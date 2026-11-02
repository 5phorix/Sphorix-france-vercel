create table public.chatbot_settings (
  id integer primary key default 1 check (id = 1),
  enabled boolean not null default false,
  assistant_name text not null default 'Assistant Sphorix',
  greeting text not null default 'Bonjour ! Comment puis-je vous aider à mieux organiser votre activité ?',
  personality text not null default 'Professionnel, chaleureux, concis et honnête sur ses limites.',
  suggested_questions text[] not null default array[
    'Quels services propose Sphorix France ?',
    'Comment demander un devis ?',
    'Quelle solution conviendrait à mon entreprise ?'
  ],
  knowledge_synced_at timestamptz,
  indexed_page_count integer not null default 0 check (indexed_page_count >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.chatbot_settings (id) values (1)
on conflict (id) do nothing;

create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_token_hash text not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  category text,
  primary_need text,
  interested_services text[] not null default '{}',
  summary text,
  lead_request_type text check (lead_request_type is null or lead_request_type in ('quote', 'appointment', 'callback')),
  lead_details jsonb not null default '{}'::jsonb check (jsonb_typeof(lead_details) = 'object'),
  unresolved_question boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default timezone('utc', now()) + interval '24 months'
);

create index chat_conversations_visitor_created_idx
  on public.chat_conversations (visitor_token_hash, created_at desc);
create index chat_conversations_admin_created_idx
  on public.chat_conversations (created_at desc);
create index chat_conversations_expiry_idx
  on public.chat_conversations (expires_at);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 12000),
  sources jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  created_at timestamptz not null default timezone('utc', now())
);

create index chat_messages_conversation_created_idx
  on public.chat_messages (conversation_id, created_at);

create or replace function public.chatbot_admin_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total_conversations',
      (select count(*) from public.chat_conversations),
    'unique_visitors',
      (select count(distinct visitor_token_hash) from public.chat_conversations),
    'conversations_last_30_days',
      (select count(*) from public.chat_conversations
       where created_at >= timezone('utc', now()) - interval '30 days'),
    'quote_requests',
      (select count(*) from public.chat_conversations where lead_request_type = 'quote'),
    'appointment_requests',
      (select count(*) from public.chat_conversations where lead_request_type = 'appointment'),
    'callback_requests',
      (select count(*) from public.chat_conversations where lead_request_type = 'callback'),
    'unresolved_questions',
      (select count(*) from public.chat_conversations where unresolved_question),
    'completed_conversations',
      (select count(*) from public.chat_conversations where status = 'completed'),
    'resolution_rate',
      coalesce((
        select round(
          100.0 * count(*) filter (where status = 'completed') / nullif(count(*), 0),
          1
        )
        from public.chat_conversations
      ), 0),
    'category_counts',
      coalesce((
        select jsonb_object_agg(category, total)
        from (
          select category, count(*) as total
          from public.chat_conversations
          where category is not null and btrim(category) <> ''
          group by category
        ) categories
      ), '{}'::jsonb),
    'service_counts',
      coalesce((
        select jsonb_object_agg(service, total)
        from (
          select service.value as service, count(*) as total
          from public.chat_conversations conversations
          cross join lateral unnest(conversations.interested_services) as service(value)
          group by service.value
        ) services
      ), '{}'::jsonb)
  );
$$;

create table public.chat_rate_limits (
  visitor_key_hash text primary key,
  request_count integer not null check (request_count > 0),
  window_started_at timestamptz not null
);

alter table public.chatbot_settings enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_rate_limits enable row level security;

revoke all on public.chatbot_settings, public.chat_conversations, public.chat_messages, public.chat_rate_limits
  from public, anon, authenticated;
grant all on public.chatbot_settings, public.chat_conversations, public.chat_messages, public.chat_rate_limits
  to service_role;

create or replace function public.consume_chat_rate_limit(
  target_key_hash text,
  max_requests integer,
  window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  current_window timestamptz;
begin
  if target_key_hash !~ '^[0-9a-f]{64}$'
    or max_requests not between 1 and 100
    or window_seconds not between 1 and 86400 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;

  insert into public.chat_rate_limits (visitor_key_hash, request_count, window_started_at)
  values (target_key_hash, 1, timezone('utc', now()))
  on conflict (visitor_key_hash) do nothing;

  select request_count, window_started_at
  into current_count, current_window
  from public.chat_rate_limits
  where visitor_key_hash = target_key_hash
  for update;

  if current_window <= timezone('utc', now()) - make_interval(secs => window_seconds) then
    update public.chat_rate_limits
    set request_count = 1, window_started_at = timezone('utc', now())
    where visitor_key_hash = target_key_hash;
    return true;
  end if;

  if current_count >= max_requests then
    return false;
  end if;

  update public.chat_rate_limits
  set request_count = request_count + 1
  where visitor_key_hash = target_key_hash;
  return true;
end;
$$;

revoke all on function public.consume_chat_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_chat_rate_limit(text, integer, integer) to service_role;
revoke all on function public.chatbot_admin_stats() from public, anon, authenticated;
grant execute on function public.chatbot_admin_stats() to service_role;
