create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create table public.user_settings (
  user_id      uuid primary key default auth.uid() references auth.users on delete cascade,
  jurisdiction text not null default 'CA',
  time_zone    text not null default 'America/Toronto',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger user_settings_updated_at before update on public.user_settings
  for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;

create policy "own rows" on public.user_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.user_settings to authenticated;
