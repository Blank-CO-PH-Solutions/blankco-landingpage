-- Dedicated support conversations. Admins use their landing session; portal
-- customers are authorized by the `chat` Edge Function (CPL JWT -> JWKS).
create table if not exists public.support_chats (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  customer_name text not null default 'Customer',
  subject text not null,
  category text not null default 'Other',
  source text not null default 'contact' check (source in ('portal', 'ticket', 'contact')),
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_chats_email_updated_idx
  on public.support_chats (lower(customer_email), updated_at desc);

create table if not exists public.support_chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.support_chats(id) on delete cascade,
  author text not null check (author in ('customer', 'admin')),
  author_name text not null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists support_chat_messages_chat_created_idx
  on public.support_chat_messages (chat_id, created_at);

alter table public.support_chats enable row level security;
alter table public.support_chat_messages enable row level security;

drop policy if exists "Admins manage support chats" on public.support_chats;
create policy "Admins manage support chats" on public.support_chats
for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage chat messages" on public.support_chat_messages;
create policy "Admins manage chat messages" on public.support_chat_messages
for all to authenticated
using (public.is_admin()) with check (public.is_admin());

grant select, insert, update on public.support_chats to authenticated;
grant select, insert on public.support_chat_messages to authenticated;

-- Bring the existing tagged-message conversations into the new tables.
insert into public.support_chats (id, customer_email, customer_name, subject, category, source, created_at, updated_at)
select
  m.id,
  m.email,
  m.name,
  m.service_interest,
  case when m.service_interest like 'CPL support · %' then split_part(m.service_interest, ' · ', 2) else 'Other' end,
  case when m.service_interest like 'CPL support%' then 'ticket' else 'contact' end,
  m.created_at,
  m.created_at
from public.messages m
where m.service_interest not like 'CPL chat%'
on conflict (id) do nothing;

insert into public.support_chat_messages (id, chat_id, author, author_name, body, created_at)
select m.id, m.id, 'customer', m.name, m.message, m.created_at
from public.messages m
where m.service_interest not like 'CPL chat%'
on conflict (id) do nothing;

insert into public.support_chat_messages (id, chat_id, author, author_name, body, created_at)
select
  r.id,
  substring(r.service_interest from length('CPL chat · ') + 1)::uuid,
  case when r.company = 'Customer portal' then 'customer' else 'admin' end,
  r.name,
  r.message,
  r.created_at
from public.messages r
where r.service_interest ~ '^CPL chat · [0-9a-fA-F-]{36}$'
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_chats'
  ) then
    alter publication supabase_realtime add table public.support_chats;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_chat_messages'
  ) then
    alter publication supabase_realtime add table public.support_chat_messages;
  end if;
end $$;
