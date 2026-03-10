-- Party Menu — Initial Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Parties
create table if not exists parties (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  welcome_message text not null default '',
  host_id uuid references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Guests
create table if not exists guests (
  id uuid primary key default uuid_generate_v4(),
  party_id uuid not null references parties(id) on delete cascade,
  name text not null,
  photo_url text,
  joined_at timestamptz not null default now()
);

-- Drinks
create table if not exists drinks (
  id uuid primary key default uuid_generate_v4(),
  party_id uuid not null references parties(id) on delete cascade,
  name text not null,
  description text,
  photo_url text,
  is_available boolean not null default true,
  display_order integer not null default 0
);

-- Orders
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  party_id uuid not null references parties(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  drink_id uuid references drinks(id) on delete set null,
  custom_request text,
  status text not null default 'pending' check (status in ('pending', 'fulfilled')),
  created_at timestamptz not null default now()
);

-- Pokes
create table if not exists pokes (
  id uuid primary key default uuid_generate_v4(),
  party_id uuid not null references parties(id) on delete cascade,
  from_guest_id uuid not null references guests(id) on delete cascade,
  to_guest_id uuid not null references guests(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Push Subscriptions (for host notifications)
create table if not exists push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid not null references auth.users(id) on delete cascade,
  party_id uuid not null references parties(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique(endpoint)
);

-- Row Level Security
alter table parties enable row level security;
alter table guests enable row level security;
alter table drinks enable row level security;
alter table orders enable row level security;
alter table pokes enable row level security;
alter table push_subscriptions enable row level security;

-- Parties: host can read/write their own; public can read active parties
create policy "Host manages their parties" on parties
  for all using (auth.uid() = host_id);

create policy "Public can read active parties" on parties
  for select using (is_active = true);

-- Guests: public read for party guests; anyone can insert (join party)
create policy "Public can read guests" on guests
  for select using (true);

create policy "Anyone can join as guest" on guests
  for insert with check (true);

create policy "Guest can update their own record" on guests
  for update using (true);

-- Drinks: public read; host manages
create policy "Public can read available drinks" on drinks
  for select using (is_available = true);

create policy "Host manages drinks" on drinks
  for all using (
    party_id in (select id from parties where host_id = auth.uid())
  );

-- Orders: guests can insert; host can read/update
create policy "Anyone can place an order" on orders
  for insert with check (true);

create policy "Public can read orders for a party" on orders
  for select using (true);

create policy "Host can update order status" on orders
  for update using (
    party_id in (select id from parties where host_id = auth.uid())
  );

-- Pokes: anyone can insert/read
create policy "Anyone can poke" on pokes
  for insert with check (true);

create policy "Anyone can read pokes" on pokes
  for select using (true);

-- Push subscriptions: host manages their own
create policy "Host manages push subscriptions" on push_subscriptions
  for all using (auth.uid() = host_id);

-- Enable Realtime on orders and pokes
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table pokes;

-- Indexes
create index if not exists idx_guests_party_id on guests(party_id);
create index if not exists idx_drinks_party_id on drinks(party_id, display_order);
create index if not exists idx_orders_party_id on orders(party_id, created_at desc);
create index if not exists idx_pokes_to_guest on pokes(to_guest_id, created_at desc);
