-- Party Menu — Add PDP drink details
alter table drinks
  add column if not exists pdp_description text,
  add column if not exists ingredients jsonb not null default '[]'::jsonb,
  add column if not exists fun_fact text,
  add column if not exists source_url text;
