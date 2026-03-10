# Party Menu

A mobile-first party menu app that lets guests scan a QR code, find themselves on the guest list, browse drinks, and place orders — while the host gets real-time notifications on their phone.

## Features

- **Guest flow** — Welcome screen → find yourself → profile photo → order drinks → poke guests 🔫
- **Drink ordering** — PLP grid with confirmation sheet + custom drink requests
- **Real-time** — Orders and pokes delivered instantly via Supabase Realtime
- **Host dashboard** — Live order feed with Web Push notifications
- **Admin panel** — Set up the party, guest list, and drink menu

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **SCSS Modules** — mobile-first, dark theme
- **Supabase** — Postgres, Realtime, Storage, Auth
- **Web Push API** — push notifications for the host
- **Vercel** — deployment target

## Getting Started

### 1. Set up Supabase

Create a project at [supabase.com](https://supabase.com) and run the migration:

```sql
-- In the Supabase SQL editor, run:
-- supabase/migrations/001_initial_schema.sql
```

Also create a `party-photos` storage bucket in Supabase (set to public).

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your keys in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=host@yourparty.com
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|---|---|
| `/` | Guest onboarding — welcome + find yourself |
| `/guest/[guestId]` | Guest profile + order/poke actions |
| `/guest/[guestId]/drinks` | Drink menu (PLP) |
| `/host` | Host live order dashboard |
| `/admin/login` | Host magic-link login |
| `/admin/setup/party` | Party configuration |
| `/admin/setup/guests` | Guest list manager |
| `/admin/setup/drinks` | Drink menu manager |
| `/admin/orders` | Admin order overview |

## Deploy

Deploy to [Vercel](https://vercel.com) and set all environment variables in the Vercel dashboard. The QR code guests scan should point to your Vercel URL (`/`).
