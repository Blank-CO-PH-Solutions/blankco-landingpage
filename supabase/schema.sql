create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 70),
  client text not null check (char_length(client) between 1 and 70),
  category text not null check (char_length(category) between 1 and 80),
  year integer not null check (year between 2000 and 2100),
  description text not null check (char_length(description) between 1 and 240),
  github_url text,
  live_site_url text,
  visual text not null default 'project-visual-coral',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects add column if not exists github_url text;
alter table public.projects add column if not exists live_site_url text;

update public.projects
set published = false
where slug in ('northstar-workflows', 'field-notes', 'common-ground')
  and (github_url is null or github_url = '' or live_site_url is null or live_site_url = '');

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  email text not null check (
    char_length(email) between 3 and 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  company text not null check (char_length(btrim(company)) between 2 and 100),
  service_interest text not null check (char_length(btrim(service_interest)) between 10 and 300),
  message text not null check (char_length(btrim(message)) between 20 and 500),
  consent boolean not null check (consent),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.messages enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant insert, update, delete on table public.projects to authenticated;
grant insert on table public.messages to anon, authenticated;
grant select, update, delete on table public.messages to authenticated;

drop policy if exists projects_read_published_or_admin on public.projects;
create policy projects_read_published_or_admin
  on public.projects for select to anon, authenticated
  using (published or public.is_admin());

drop policy if exists projects_admin_insert on public.projects;
create policy projects_admin_insert
  on public.projects for insert to authenticated
  with check (public.is_admin());

drop policy if exists projects_admin_update on public.projects;
create policy projects_admin_update
  on public.projects for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists projects_admin_delete on public.projects;
create policy projects_admin_delete
  on public.projects for delete to authenticated
  using (public.is_admin());

drop policy if exists messages_public_submit on public.messages;
create policy messages_public_submit
  on public.messages for insert to anon, authenticated
  with check (
    consent
    and not is_read
    and char_length(btrim(name)) between 2 and 100
    and char_length(email) between 3 and 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    and char_length(btrim(company)) between 2 and 100
    and char_length(btrim(service_interest)) between 10 and 300
    and char_length(btrim(message)) between 20 and 500
  );

drop policy if exists messages_admin_read on public.messages;
create policy messages_admin_read
  on public.messages for select to authenticated
  using (public.is_admin());

drop policy if exists messages_admin_update on public.messages;
create policy messages_admin_update
  on public.messages for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists messages_admin_delete on public.messages;
create policy messages_admin_delete
  on public.messages for delete to authenticated
  using (public.is_admin());

insert into public.projects (slug, name, client, category, year, description, visual, published)
values
  ('northstar-workflows', 'Northstar Workflows', 'Northstar Studio', 'Workflow automation', 2025, 'A calmer way to handle incoming requests, approvals, and handoffs across a growing creative team.', 'project-visual-coral', false),
  ('field-notes', 'Fieldnotes Market', 'Fieldnotes Market', 'Digital product', 2025, 'A straightforward storefront and inventory view for a small-batch maker selling directly to customers.', 'project-visual-green', false),
  ('common-ground', 'Common Ground', 'Common Ground Co-op', 'Business strategy', 2024, 'A practical operating plan and service directory that helps a local community group connect people to support.', 'project-visual-blue', false)
on conflict (slug) do nothing;