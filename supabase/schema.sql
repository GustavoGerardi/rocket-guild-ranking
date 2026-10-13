create table if not exists public.guild_imports (
  id text primary key check (id = 'latest'),
  data jsonb not null,
  file_name text not null,
  imported_at timestamptz not null default now()
);

alter table public.guild_imports enable row level security;

grant select, insert, update on public.guild_imports to anon, authenticated;

drop policy if exists "Anyone can read latest guild import" on public.guild_imports;
drop policy if exists "Anyone can create latest guild import" on public.guild_imports;
drop policy if exists "Anyone can update latest guild import" on public.guild_imports;

create policy "Anyone can read latest guild import"
  on public.guild_imports
  for select
  to anon, authenticated
  using (id = 'latest');

create policy "Anyone can create latest guild import"
  on public.guild_imports
  for insert
  to anon, authenticated
  with check (id = 'latest');

create policy "Anyone can update latest guild import"
  on public.guild_imports
  for update
  to anon, authenticated
  using (id = 'latest')
  with check (id = 'latest');