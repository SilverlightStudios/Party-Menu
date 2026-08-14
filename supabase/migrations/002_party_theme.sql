-- Party Menu — Add theme color columns to parties table
alter table parties
  add column if not exists theme_color1 text not null default '#FF9FFC',
  add column if not exists theme_color2 text not null default '#5227FF',
  add column if not exists theme_color3 text not null default '#B19EEF';
