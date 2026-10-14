create table public.tax_lines (
  id           text primary key,
  jurisdiction text not null,
  code         text not null,
  label        text not null,
  kind         text not null check (kind in ('income', 'expense')),
  unique (jurisdiction, code)
);

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade,
  key         text unique,
  name        text not null check (char_length(name) between 1 and 60),
  kind        text not null check (kind in ('income', 'expense')),
  is_system   boolean not null default false,
  sort_order  smallint not null default 0,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  check ((is_system and user_id is null and key is not null) or (not is_system and user_id is not null))
);

create table public.category_tax_lines (
  category_id  uuid not null references public.categories on delete cascade,
  jurisdiction text not null,
  tax_line_id  text references public.tax_lines,
  primary key (category_id, jurisdiction)
);

create table public.recurring_rules (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  property_id    uuid not null references public.properties on delete cascade,
  unit_id        uuid references public.units on delete set null,
  category_id    uuid not null references public.categories,
  kind           text not null check (kind in ('income', 'expense')),
  amount_cents   bigint not null check (amount_cents > 0),
  frequency      text not null default 'monthly' check (frequency in ('monthly')),
  due_day        smallint check (due_day between 1 and 28),
  due_last_day   boolean not null default false,
  split_template jsonb,
  is_capital     boolean not null default false,
  note           text check (char_length(note) <= 500),
  start_date     date not null,
  end_date       date,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check ((due_last_day and due_day is null) or (not due_last_day and due_day is not null))
);

create table public.transactions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users on delete cascade,
  property_id        uuid not null references public.properties on delete restrict,
  unit_id            uuid references public.units on delete restrict,
  category_id        uuid not null references public.categories,
  kind               text not null check (kind in ('income', 'expense')),
  amount_cents       bigint not null check (amount_cents > 0 and amount_cents <= 1000000000),
  date               date not null,
  status             text not null default 'confirmed'
                     check (status in ('pending', 'confirmed', 'skipped')),
  source             text not null default 'manual'
                     check (source in ('manual', 'recurring', 'import', 'loan')),
  is_capital         boolean not null default false,
  receipt_not_needed boolean not null default false,
  note               text check (char_length(note) <= 500),
  recurring_rule_id  uuid references public.recurring_rules on delete set null,
  occurrence_date    date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (not (is_capital and kind = 'income'))
);

create index transactions_user_date_idx on public.transactions (user_id, date desc);
create index transactions_property_idx on public.transactions (property_id, date desc);
create unique index one_entry_per_occurrence on public.transactions (recurring_rule_id, occurrence_date)
  where recurring_rule_id is not null;

create table public.transaction_splits (
  transaction_id uuid not null references public.transactions on delete cascade,
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  unit_id        uuid not null references public.units on delete restrict,
  basis_points   int not null check (basis_points between 1 and 10000),
  amount_cents   bigint not null check (amount_cents >= 0),
  primary key (transaction_id, unit_id)
);

create table public.receipts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users on delete cascade,
  transaction_id     uuid references public.transactions on delete set null,
  property_id        uuid references public.properties on delete set null,
  file_key           text not null unique,
  mime_type          text not null check (mime_type in ('image/jpeg', 'application/pdf')),
  size_bytes         int not null check (size_bytes > 0 and size_bytes <= 15000000),
  original_file_name text check (char_length(original_file_name) <= 255),
  uploaded_at        timestamptz not null default now()
);

create trigger recurring_rules_updated_at before update on public.recurring_rules
  for each row execute function public.set_updated_at();
create trigger transactions_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();

alter table public.tax_lines enable row level security;
alter table public.categories enable row level security;
alter table public.category_tax_lines enable row level security;
alter table public.recurring_rules enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_splits enable row level security;
alter table public.receipts enable row level security;

create policy "read tax lines" on public.tax_lines
  for select to authenticated
  using (true);

create policy "read system and own categories" on public.categories
  for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));

create policy "read mappings of visible categories" on public.category_tax_lines
  for select to authenticated
  using (
    exists (
      select 1 from public.categories c
      where c.id = category_id and (c.user_id is null or c.user_id = (select auth.uid()))
    )
  );

create policy "own rows" on public.recurring_rules
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = (select auth.uid())
    )
  );

create policy "own rows" on public.transactions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = (select auth.uid())
    )
  );

create policy "own rows" on public.transaction_splits
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.units u
      where u.id = unit_id and u.user_id = (select auth.uid())
    )
  );

create policy "own rows" on public.receipts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select on public.tax_lines, public.categories, public.category_tax_lines to authenticated;
grant select, insert, update, delete
  on public.recurring_rules, public.transactions, public.transaction_splits, public.receipts
  to authenticated;
revoke truncate, references, trigger
  on public.tax_lines, public.categories, public.category_tax_lines, public.recurring_rules,
     public.transactions, public.transaction_splits, public.receipts
  from anon, authenticated;

insert into public.tax_lines (id, jurisdiction, code, label, kind) values
  ('CA-8141', 'CA', '8141', 'Gross rents', 'income'),
  ('CA-8230', 'CA', '8230', 'Other related income', 'income'),
  ('CA-8521', 'CA', '8521', 'Advertising', 'expense'),
  ('CA-8690', 'CA', '8690', 'Insurance', 'expense'),
  ('CA-8710', 'CA', '8710', 'Interest and bank charges', 'expense'),
  ('CA-8860', 'CA', '8860', 'Professional fees', 'expense'),
  ('CA-8871', 'CA', '8871', 'Management and administration fees', 'expense'),
  ('CA-8960', 'CA', '8960', 'Repairs and maintenance', 'expense'),
  ('CA-9180', 'CA', '9180', 'Property taxes', 'expense'),
  ('CA-9220', 'CA', '9220', 'Utilities', 'expense'),
  ('CA-9270', 'CA', '9270', 'Other expenses', 'expense');

with seeded as (
  insert into public.categories (key, name, kind, is_system, sort_order) values
    ('rent', 'Rent', 'income', true, 1),
    ('other_income', 'Other income', 'income', true, 2),
    ('repairs', 'Repairs and maintenance', 'expense', true, 1),
    ('utilities', 'Utilities', 'expense', true, 2),
    ('insurance', 'Insurance', 'expense', true, 3),
    ('property_taxes', 'Property taxes', 'expense', true, 4),
    ('mortgage_interest', 'Mortgage interest', 'expense', true, 5),
    ('other_expenses', 'Other expenses', 'expense', true, 6),
    ('advertising', 'Advertising', 'expense', true, 7),
    ('management_fees', 'Management and admin fees', 'expense', true, 8),
    ('professional_fees', 'Professional fees', 'expense', true, 9),
    ('mortgage_principal', 'Mortgage principal', 'expense', true, 10)
  returning id, key
)
insert into public.category_tax_lines (category_id, jurisdiction, tax_line_id)
select seeded.id, 'CA', mapping.tax_line_id
from seeded
join (values
  ('rent', 'CA-8141'),
  ('other_income', 'CA-8230'),
  ('repairs', 'CA-8960'),
  ('utilities', 'CA-9220'),
  ('insurance', 'CA-8690'),
  ('property_taxes', 'CA-9180'),
  ('mortgage_interest', 'CA-8710'),
  ('other_expenses', 'CA-9270'),
  ('advertising', 'CA-8521'),
  ('management_fees', 'CA-8871'),
  ('professional_fees', 'CA-8860'),
  ('mortgage_principal', null)
) as mapping (key, tax_line_id) on mapping.key = seeded.key;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 15000000, array['image/jpeg', 'application/pdf'])
on conflict (id) do nothing;

create policy "receipts: read own folder" on storage.objects
  for select to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "receipts: upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "receipts: delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);

create function public.create_transaction(p jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_kind         text := p->>'kind';
  v_amount       bigint := (p->>'amount_cents')::bigint;
  v_property_id  uuid := (p->>'property_id')::uuid;
  v_category_id  uuid := (p->>'category_id')::uuid;
  v_date         date := (p->>'date')::date;
  v_is_capital   boolean := coalesce((p->>'is_capital')::boolean, false);
  v_note         text := nullif(trim(p->>'note'), '');
  v_repeat       boolean := coalesce((p->>'repeat_monthly')::boolean, false);
  v_receipt_id   uuid := nullif(p->>'receipt_id', '')::uuid;
  v_target       jsonb := p->'target';
  v_target_type  text := p->'target'->>'type';
  v_split_units  jsonb;
  v_split_count  int := 0;
  v_unit_id      uuid;
  v_unit_count   int;
  v_category_kind text;
  v_category_key text;
  v_id           uuid;
  v_rule_id      uuid;
  v_day          int;
begin
  if v_kind is null or v_kind not in ('income', 'expense') then
    raise exception 'Pick expense or income' using errcode = '22023';
  end if;
  if v_amount is null or v_amount <= 0 then
    raise exception 'Enter an amount above $0' using errcode = '22023';
  end if;
  if v_date is null or v_date > (current_date + interval '1 year')::date then
    raise exception 'Pick a date within the next year' using errcode = '22023';
  end if;
  if v_is_capital and v_kind = 'income' then
    raise exception 'Only expenses can be capital improvements' using errcode = '22023';
  end if;

  if not exists (select 1 from public.properties where id = v_property_id) then
    raise exception 'Property not found' using errcode = '22023';
  end if;
  select count(*) into v_unit_count from public.units where property_id = v_property_id;

  select c.kind, c.key into v_category_kind, v_category_key
  from public.categories c
  where c.id = v_category_id and c.archived_at is null;
  if not found then
    raise exception 'Category not found' using errcode = '22023';
  end if;
  if v_category_kind <> v_kind then
    raise exception 'That category is for %', v_category_kind using errcode = '22023';
  end if;

  if v_target_type = 'building' then
    if v_unit_count = 1 then
      select id into v_unit_id from public.units where property_id = v_property_id;
    elsif v_category_key = 'rent' then
      raise exception 'Pick the unit this rent is for' using errcode = '22023';
    end if;
  elsif v_target_type = 'unit' then
    v_unit_id := (v_target->>'unit_id')::uuid;
    if not exists (
      select 1 from public.units where id = v_unit_id and property_id = v_property_id
    ) then
      raise exception 'That unit isn''t part of this property' using errcode = '22023';
    end if;
  elsif v_target_type = 'split' then
    if v_kind = 'income' then
      raise exception 'Income goes to one unit' using errcode = '22023';
    end if;
    v_split_units := v_target->'units';
    if jsonb_typeof(v_split_units) is distinct from 'array' then
      raise exception 'Split units must be a list' using errcode = '22023';
    end if;
    v_split_count := jsonb_array_length(v_split_units);
    if v_split_count < 2 then
      raise exception 'A split needs at least two units' using errcode = '22023';
    end if;
    if (
      select coalesce(sum((u->>'basis_points')::int), 0)
      from jsonb_array_elements(v_split_units) u
    ) <> 10000 then
      raise exception 'Split must add up to 100%%' using errcode = '22023';
    end if;
    if (
      select count(distinct un.id)
      from jsonb_array_elements(v_split_units) u
      join public.units un on un.id = (u->>'unit_id')::uuid and un.property_id = v_property_id
    ) <> v_split_count then
      raise exception 'Every unit in the split must belong to this property' using errcode = '22023';
    end if;
  else
    raise exception 'Pick where this money belongs' using errcode = '22023';
  end if;

  if v_kind = 'income' and v_unit_id is not null and exists (
    select 1 from public.units where id = v_unit_id and status = 'owner_occupied'
  ) then
    raise exception 'Income can''t go to a unit you live in' using errcode = '22023';
  end if;

  insert into public.transactions (
    property_id, unit_id, category_id, kind, amount_cents, date, is_capital, note
  )
  values (
    v_property_id, v_unit_id, v_category_id, v_kind, v_amount, v_date, v_is_capital, v_note
  )
  returning id into v_id;

  if v_target_type = 'split' then
    with parts as (
      select
        (u->>'unit_id')::uuid as unit_id,
        (u->>'basis_points')::int as basis_points,
        ord,
        (v_amount * (u->>'basis_points')::int) / 10000 as share
      from jsonb_array_elements(v_split_units) with ordinality as t(u, ord)
    )
    insert into public.transaction_splits (transaction_id, unit_id, basis_points, amount_cents)
    select
      v_id,
      unit_id,
      basis_points,
      case when ord = v_split_count then v_amount - (sum(share) over () - share) else share end
    from parts;
  end if;

  if v_repeat then
    v_day := extract(day from v_date)::int;
    insert into public.recurring_rules (
      property_id, unit_id, category_id, kind, amount_cents, due_day, due_last_day,
      split_template, is_capital, note, start_date
    )
    values (
      v_property_id,
      v_unit_id,
      v_category_id,
      v_kind,
      v_amount,
      case when v_day <= 28 then v_day end,
      v_day > 28,
      case when v_target_type = 'split' then (
        select jsonb_agg(
          jsonb_build_object('unit_id', u->>'unit_id', 'basis_points', (u->>'basis_points')::int)
        )
        from jsonb_array_elements(v_split_units) u
      ) end,
      v_is_capital,
      v_note,
      v_date
    )
    returning id into v_rule_id;

    update public.transactions
    set recurring_rule_id = v_rule_id, occurrence_date = v_date
    where id = v_id;
  end if;

  if v_receipt_id is not null then
    update public.receipts
    set transaction_id = v_id, property_id = v_property_id
    where id = v_receipt_id and transaction_id is null;
    if not found then
      raise exception 'That receipt is missing or already attached' using errcode = '22023';
    end if;
  end if;

  return v_id;
end $$;

revoke execute on function public.create_transaction(jsonb) from public, anon;
grant execute on function public.create_transaction(jsonb) to authenticated;
