create table public.properties (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  name          text not null check (char_length(name) between 1 and 80),
  address       text not null check (char_length(address) between 1 and 200),
  ownership_pct numeric(5, 2) not null default 100 check (ownership_pct > 0 and ownership_pct <= 100),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index properties_user_id_idx on public.properties (user_id);

create trigger properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

create table public.units (
  id                uuid primary key default gen_random_uuid(),
  property_id       uuid not null references public.properties on delete cascade,
  user_id           uuid not null default auth.uid() references auth.users on delete cascade,
  label             text not null check (char_length(label) between 1 and 40),
  status            text not null default 'occupied'
                    check (status in ('occupied', 'vacant', 'owner_occupied')),
  rent_cents        bigint check (rent_cents >= 0),
  rent_due_day      smallint check (rent_due_day between 1 and 28),
  rent_due_last_day boolean not null default false,
  rent_start_date   date check (extract(day from rent_start_date) = 1),
  tenant_name       text check (char_length(tenant_name) <= 80),
  sort_order        smallint not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint units_status_fields_check check (
    case status
      when 'occupied' then
        rent_cents is not null and rent_cents > 0
        and rent_start_date is not null
        and ((rent_due_last_day and rent_due_day is null)
             or (not rent_due_last_day and rent_due_day is not null))
      when 'vacant' then
        rent_due_day is null and not rent_due_last_day
        and rent_start_date is null and tenant_name is null
      when 'owner_occupied' then
        rent_cents is null and rent_due_day is null and not rent_due_last_day
        and rent_start_date is null and tenant_name is null
    end
  )
);

create index units_property_id_idx on public.units (property_id);
create unique index units_property_label_uidx on public.units (property_id, lower(label));

create trigger units_updated_at before update on public.units
  for each row execute function public.set_updated_at();

alter table public.properties enable row level security;
alter table public.units enable row level security;

create policy "own rows" on public.properties
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own rows" on public.units
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = (select auth.uid())
    )
  );

grant select, insert, update, delete on public.properties, public.units to authenticated;
revoke truncate, references, trigger on public.properties, public.units from anon, authenticated;

create function public.create_property(
  p_name text,
  p_address text,
  p_units jsonb,
  p_ownership_pct numeric default 100
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_count int;
begin
  if jsonb_typeof(p_units) is distinct from 'array' then
    raise exception 'Units must be a list' using errcode = '22023';
  end if;

  v_count := jsonb_array_length(p_units);
  if v_count = 0 then
    raise exception 'A property needs at least one unit' using errcode = '22023';
  end if;

  if not exists (
    select 1 from jsonb_array_elements(p_units) u
    where u->>'status' in ('occupied', 'vacant')
  ) then
    raise exception 'At least one unit has to be rented or vacant' using errcode = '22023';
  end if;

  if v_count = 1 and p_units->0->>'status' = 'owner_occupied' then
    raise exception 'A single-unit property cannot be owner-occupied' using errcode = '22023';
  end if;

  insert into public.properties (name, address, ownership_pct)
  values (trim(p_name), trim(p_address), coalesce(p_ownership_pct, 100))
  returning id into v_id;

  insert into public.units (
    property_id, label, status, rent_cents, rent_due_day, rent_due_last_day,
    rent_start_date, tenant_name, sort_order
  )
  select
    v_id,
    trim(u->>'label'),
    u->>'status',
    case when u->>'status' in ('occupied', 'vacant') then (u->>'rent_cents')::bigint end,
    case when u->>'status' = 'occupied' and u->'rent_due'->>'type' = 'day'
         then (u->'rent_due'->>'day')::smallint end,
    coalesce(u->>'status' = 'occupied' and u->'rent_due'->>'type' = 'last', false),
    case when u->>'status' = 'occupied' then (u->>'rent_start_date')::date end,
    case when u->>'status' = 'occupied' then nullif(trim(u->>'tenant_name'), '') end,
    (ord - 1)::smallint
  from jsonb_array_elements(p_units) with ordinality as t(u, ord);

  return v_id;
end $$;

revoke execute on function public.create_property(text, text, jsonb, numeric) from public, anon;
grant execute on function public.create_property(text, text, jsonb, numeric) to authenticated;
