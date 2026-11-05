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

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  position text not null check (char_length(btrim(position)) between 1 and 100),
  email text,
  location text,
  github_url text not null check (github_url ~ '^https://github[.]com/[A-Za-z0-9-]+/?$'),
  portfolio_url text check (portfolio_url is null or portfolio_url ~ '^https://'),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  bio text not null default '' check (char_length(bio) <= 500),
  skills text[] not null default '{}',
  education jsonb not null default '[]'::jsonb check (jsonb_typeof(education) = 'array'),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_members add column if not exists skills text[] not null default '{}';
alter table public.team_members add column if not exists email text;
alter table public.team_members add column if not exists location text;
alter table public.team_members add column if not exists education jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-avatars', 'team-avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.messages enable row level security;
alter table public.team_members enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant insert, update, delete on table public.projects to authenticated;
grant insert on table public.messages to anon, authenticated;
grant select, update, delete on table public.messages to authenticated;
grant select on table public.team_members to anon, authenticated;
grant insert, update, delete on table public.team_members to authenticated;

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

drop policy if exists team_members_read_published_or_admin on public.team_members;
create policy team_members_read_published_or_admin
  on public.team_members for select to anon, authenticated
  using (is_published or public.is_admin());

drop policy if exists team_members_admin_insert on public.team_members;
create policy team_members_admin_insert
  on public.team_members for insert to authenticated
  with check (public.is_admin());

drop policy if exists team_members_admin_update on public.team_members;
create policy team_members_admin_update
  on public.team_members for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists team_members_admin_delete on public.team_members;
create policy team_members_admin_delete
  on public.team_members for delete to authenticated
  using (public.is_admin());

drop policy if exists team_avatars_public_read on storage.objects;
create policy team_avatars_public_read
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'team-avatars');

drop policy if exists team_avatars_admin_insert on storage.objects;
create policy team_avatars_admin_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'team-avatars' and public.is_admin());

drop policy if exists team_avatars_admin_update on storage.objects;
create policy team_avatars_admin_update
  on storage.objects for update to authenticated
  using (bucket_id = 'team-avatars' and public.is_admin())
  with check (bucket_id = 'team-avatars' and public.is_admin());

drop policy if exists team_avatars_admin_delete on storage.objects;
create policy team_avatars_admin_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'team-avatars' and public.is_admin());

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

delete from public.projects
where slug in ('northstar-workflows', 'field-notes', 'common-ground');

insert into public.projects (slug, name, client, category, year, description, github_url, live_site_url, visual, published)
values
  ('survey-profiling-tool', 'Survey Profiling Tool', 'Archdiocese of Tuguegarao', 'Digital product', 2026, 'A family profiling survey application for collecting, managing, and analyzing household data across parishes.', 'https://github.com/nathaniel-ramos-dev/survey-profiling-tool', 'https://survey-profiling-tool.vercel.app', 'project-visual-coral', true),
  ('attendance-checker', 'Attendance Checker', 'BSIT 2B', 'Digital product', 2026, 'A Flutter attendance-checking project created by BSIT 2B.', 'https://github.com/Blank-CO-PH-Solutions/attendance-checker', null, 'project-visual-blue', true),
  ('e-barker', 'E-Barker', 'Baggao PUV Van Operators', 'Digital product', 2026, 'A digital dispatching and terminal fee monitoring system for PUV van operations in Baggao, Cagayan.', 'https://github.com/nathaniel-ramos-dev/e-barker', 'https://e-barker-app.vercel.app', 'project-visual-green', true),
  ('farmers-srrt', 'Farmers SRRT', 'Blank CO PH Solutions', 'Digital product', 2026, 'A Laravel system for managing farmer service requests, office routing, referrals, and ratings.', 'https://github.com/Blank-CO-PH-Solutions/farmers-srrt', null, 'project-visual-gold', true)
on conflict (slug) do update set
  name = excluded.name,
  client = excluded.client,
  category = excluded.category,
  year = excluded.year,
  description = excluded.description,
  github_url = excluded.github_url,
  live_site_url = excluded.live_site_url,
  visual = excluded.visual,
  published = excluded.published;