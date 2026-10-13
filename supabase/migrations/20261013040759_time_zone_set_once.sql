alter table public.user_settings
  alter column time_zone drop default,
  alter column time_zone drop not null;
