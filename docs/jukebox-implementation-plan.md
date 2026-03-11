# Jukebox Feature — Implementation Plan

A seamless guest-facing Spotify add-to-playlist experience, powered by the host's single Spotify account. Guests search for songs and add them to the house playlist. The host sees a full audit log of who added what and when. Every song in the queue shows the guest's name on their card.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Spotify Setup & OAuth](#2-spotify-setup--oauth)
3. [Database Migration](#3-database-migration)
4. [TypeScript Types](#4-typescript-types)
5. [Backend: Token Management](#5-backend-token-management)
6. [Backend: API Routes](#6-backend-api-routes)
7. [Frontend: JukeboxButton](#7-frontend-jukeboxbutton)
8. [Frontend: JukeboxSheet](#8-frontend-jukeboxsheet)
9. [Frontend: SongCard](#9-frontend-songcard)
10. [Frontend: Guest Drink Page Integration](#10-frontend-guest-drink-page-integration)
11. [Admin View: Jukebox Activity](#11-admin-view-jukebox-activity)
12. [Environment Variables](#12-environment-variables)
13. [File Map](#13-file-map)
14. [Step-by-Step Build Order](#14-step-by-step-build-order)

---

## 1. Architecture Overview

```
Guest device                  Next.js App                   Spotify Web API
──────────────                ────────────────────          ──────────────────
JukeboxButton ──tap──>
JukeboxSheet (opens)
  SearchInput ──query──> POST /api/jukebox/search ──────>  GET /v1/search
             <──results──                          <──────
  SongRow ──tap──>       POST /api/jukebox/add ──────────>  POST /v1/playlists/{id}/tracks
                                 │
                                 ▼
                          INSERT jukebox_tracks (Supabase)
                                 │
                         Realtime broadcast
                                 ▼
                    JukeboxSheet queue updates live
                    Admin JukeboxLog updates live
```

**Key design decision:** Guests never authenticate with Spotify. All API calls are made server-side using the host's stored tokens. The host connects their Spotify account once via OAuth during party setup. Guests interact only with the Party Menu backend.

---

## 2. Spotify Setup & OAuth

### 2.1 Create a Spotify App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create a new app — name it "Party Menu Jukebox"
3. Set Redirect URI to: `https://{your-domain}/api/jukebox/callback`
   - Also add `http://localhost:3000/api/jukebox/callback` for local dev
4. Copy your **Client ID** and **Client Secret** into `.env.local`

### 2.2 Required Scopes

The host authorization request must include these scopes:

```
playlist-modify-public
playlist-modify-private
playlist-read-private
user-read-currently-playing
user-read-playback-state
```

### 2.3 Authorization Flow

This is a standard OAuth Authorization Code flow, initiated from the admin panel:

```
1. Host clicks "Connect Spotify" in Admin > Setup > Party
2. App redirects to Spotify /authorize with scopes + state param (party_id)
3. Host approves on Spotify
4. Spotify redirects to GET /api/jukebox/callback?code=...&state={party_id}
5. App exchanges code for access_token + refresh_token
6. Tokens stored encrypted in spotify_credentials table
7. Host redirected back to setup with "Spotify Connected ✓"
```

### 2.4 Token Refresh Strategy

Spotify access tokens expire after **3600 seconds (1 hour)**. The refresh flow:

- Every API route that calls Spotify first calls a shared `getSpotifyToken(partyId)` utility
- That utility checks `expires_at` in the DB against `Date.now()`
- If expired (or within 60s buffer), it calls `POST https://accounts.spotify.com/api/token` with the refresh token
- New `access_token` + new `expires_at` are written back to `spotify_credentials`
- The fresh token is returned to the calling route

This means token refresh is lazy/on-demand — no cron job needed.

---

## 3. Database Migration

Create a new migration file: `supabase/migrations/002_jukebox.sql`

```sql
-- Spotify credentials (one row per party, managed by host)
create table if not exists spotify_credentials (
  id           uuid primary key default uuid_generate_v4(),
  party_id     uuid not null references parties(id) on delete cascade unique,
  host_id      uuid not null references auth.users(id) on delete cascade,
  access_token  text not null,
  refresh_token text not null,
  expires_at    timestamptz not null,
  playlist_id   text not null,        -- Spotify playlist URI the host chose
  playlist_name text not null,        -- Display name for the playlist
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Every track a guest adds to the playlist
create table if not exists jukebox_tracks (
  id              uuid primary key default uuid_generate_v4(),
  party_id        uuid not null references parties(id) on delete cascade,
  guest_id        uuid not null references guests(id) on delete cascade,
  spotify_track_id text not null,     -- e.g. "4uLU6hMCjMI75M1A2tKUQC"
  track_name      text not null,
  artist_name     text not null,
  album_name      text not null,
  album_art_url   text not null,      -- 640x640 image from Spotify
  duration_ms     integer not null,
  added_at        timestamptz not null default now()
);

-- RLS
alter table spotify_credentials enable row level security;
alter table jukebox_tracks enable row level security;

-- spotify_credentials: only host can read/write their own
create policy "Host manages spotify credentials" on spotify_credentials
  for all using (auth.uid() = host_id);

-- jukebox_tracks: anyone can insert; anyone can read (all guests see the queue)
create policy "Anyone can add a track" on jukebox_tracks
  for insert with check (true);

create policy "Anyone can read jukebox tracks" on jukebox_tracks
  for select using (true);

-- Only host can delete (remove songs from queue log)
create policy "Host can delete jukebox tracks" on jukebox_tracks
  for delete using (
    party_id in (select id from parties where host_id = auth.uid())
  );

-- Indexes
create index if not exists idx_jukebox_party_added
  on jukebox_tracks(party_id, added_at desc);

create index if not exists idx_jukebox_guest
  on jukebox_tracks(guest_id);

-- Enable Realtime so the queue updates live across all devices
alter publication supabase_realtime add table jukebox_tracks;
```

---

## 4. TypeScript Types

Add to `src/lib/supabase/types.ts`:

```typescript
// ── Jukebox ──────────────────────────────────────────────────────────────

export interface SpotifyCredentials {
  id: string
  party_id: string
  host_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  playlist_id: string
  playlist_name: string
  created_at: string
  updated_at: string
}

export interface JukeboxTrack {
  id: string
  party_id: string
  guest_id: string
  spotify_track_id: string
  track_name: string
  artist_name: string
  album_name: string
  album_art_url: string
  duration_ms: number
  added_at: string
  // Joined
  guest?: Guest
}

// Spotify API search result shape (subset we care about)
export interface SpotifyTrackResult {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string; width: number; height: number }[]
  }
  duration_ms: number
  uri: string  // "spotify:track:4uLU6hMCjMI75M1A2tKUQC"
}
```

Also extend the `Database` type to include the two new tables (follow the existing pattern in `types.ts`).

---

## 5. Backend: Token Management

### `src/lib/spotify/getToken.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/server'

export async function getSpotifyToken(partyId: string): Promise<string> {
  const supabase = createAdminClient()

  const { data: creds, error } = await supabase
    .from('spotify_credentials')
    .select('*')
    .eq('party_id', partyId)
    .single()

  if (error || !creds) throw new Error('Spotify not connected for this party')

  // Refresh if within 60 seconds of expiry
  const expiresAt = new Date(creds.expires_at).getTime()
  const nowPlusBuffer = Date.now() + 60_000

  if (expiresAt > nowPlusBuffer) {
    return creds.access_token
  }

  // Exchange refresh token
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: creds.refresh_token,
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: params,
  })

  if (!response.ok) throw new Error('Failed to refresh Spotify token')

  const json = await response.json()
  const newExpiresAt = new Date(Date.now() + json.expires_in * 1000).toISOString()

  await supabase
    .from('spotify_credentials')
    .update({
      access_token: json.access_token,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('party_id', partyId)

  return json.access_token
}
```

---

## 6. Backend: API Routes

### 6.1 OAuth Initiation — `GET /api/jukebox/connect`

**File:** `src/app/api/jukebox/connect/route.ts`

Called from admin setup when host clicks "Connect Spotify". Redirects to Spotify.

```typescript
// Query params expected: ?party_id={uuid}
// Returns: 302 redirect to Spotify authorize URL

const SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
  'user-read-currently-playing',
  'user-read-playback-state',
].join(' ')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const partyId = searchParams.get('party_id')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    state: partyId!,
  })

  return Response.redirect(
    `https://accounts.spotify.com/authorize?${params}`
  )
}
```

### 6.2 OAuth Callback — `GET /api/jukebox/callback`

**File:** `src/app/api/jukebox/callback/route.ts`

Handles the redirect from Spotify. Exchanges code for tokens, saves to DB.

```typescript
// Receives: ?code=...&state={party_id}
// 1. Exchange code for tokens via POST https://accounts.spotify.com/api/token
// 2. Fetch host's playlists via GET https://api.spotify.com/v1/me/playlists
//    (or just save the first playlist — host can pick later)
// 3. Save tokens + selected playlist_id to spotify_credentials
// 4. Redirect to /admin/setup/party?spotify=connected
```

Key implementation notes:
- The `state` param carries `party_id` — use it to associate credentials
- Fetch `GET https://api.spotify.com/v1/me` to confirm the right account
- Store `expires_at` as `new Date(Date.now() + expires_in * 1000).toISOString()`
- After saving, redirect host back to admin — don't leave them on Spotify

### 6.3 Playlist Selection — `GET /api/jukebox/playlists`

**File:** `src/app/api/jukebox/playlists/route.ts`

After connecting, the host picks which playlist guests add to.

```typescript
// Requires auth (host session)
// Calls GET https://api.spotify.com/v1/me/playlists?limit=50
// Returns: [{ id, name, tracks.total, images[0].url }]
```

The admin UI shows a dropdown of the host's playlists. On select, the chosen `playlist_id` is saved to `spotify_credentials`.

### 6.4 Search — `POST /api/jukebox/search`

**File:** `src/app/api/jukebox/search/route.ts`

Called by guests as they type in the search box.

```typescript
// Body: { party_id: string, query: string }
// 1. Call getSpotifyToken(party_id)
// 2. Call GET https://api.spotify.com/v1/search?q={query}&type=track&limit=10
// 3. Map results to SpotifyTrackResult[] (track name, artists, album art, duration)
// 4. Return results — no DB write, pure pass-through
```

Rate limiting consideration: debounce the client input to 400ms before calling this route. The Spotify Search API allows ~100 req/s per token so this is not a concern at party scale.

### 6.5 Add Track — `POST /api/jukebox/add`

**File:** `src/app/api/jukebox/add/route.ts`

The core action. Guest taps a song — this adds it to Spotify and records it.

```typescript
// Body: {
//   party_id: string,
//   guest_id: string,
//   track: SpotifyTrackResult
// }

// Steps:
// 1. Validate party is active (check parties table)
// 2. Validate guest belongs to party (check guests table)
// 3. Check for duplicate: has this track already been added to this party today?
//    - SELECT from jukebox_tracks WHERE party_id = ? AND spotify_track_id = ?
//    - If found, return 409 with message "Already in the queue"
// 4. getSpotifyToken(party_id) — refresh if needed
// 5. Fetch playlist_id from spotify_credentials
// 6. POST https://api.spotify.com/v1/playlists/{playlist_id}/tracks
//    Body: { uris: ["spotify:track:{track.id}"] }
// 7. On Spotify success (201), INSERT into jukebox_tracks
// 8. Return the new jukebox_tracks row with guest join
```

Error handling:
- Spotify 401 → token was invalid → force refresh and retry once
- Spotify 403 → playlist is private and token lost scope → surface clear error
- Spotify 404 → playlist was deleted → surface "Host's playlist not found"

### 6.6 Queue — `GET /api/jukebox/queue`

**File:** `src/app/api/jukebox/queue/route.ts`

Returns the current jukebox queue for a party, newest first, with guest join.

```typescript
// Query: ?party_id={uuid}
// SELECT jukebox_tracks.*, guests.name, guests.photo_url
// FROM jukebox_tracks
// LEFT JOIN guests ON guests.id = jukebox_tracks.guest_id
// WHERE jukebox_tracks.party_id = ?
// ORDER BY added_at ASC
// LIMIT 50
```

---

## 7. Frontend: JukeboxButton

**File:** `src/components/guest/JukeboxButton/index.tsx`

A floating action button (FAB) that lives on the drinks page. Styled to match the existing accent color system.

```tsx
// Props: { onClick: () => void }
// Renders a pill button: 🎵 Jukebox
// Position: fixed bottom-right, above the safe area inset
// Style: matches $color-accent (#ff4d6d), $radius-full
```

**`styles.module.scss`:**
```scss
.button {
  position: fixed;
  bottom: calc(#{$space-6} + env(safe-area-inset-bottom));
  right: $space-5;
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-3 $space-5;
  background: $color-accent;
  color: #fff;
  border: none;
  border-radius: $radius-full;
  font-size: $font-size-base;
  font-weight: 600;
  box-shadow: $shadow-lg;
  cursor: pointer;
  z-index: $z-sticky;
  transition: transform $transition-fast, background $transition-fast;

  &:active {
    transform: scale(0.96);
    background: $color-accent-hover;
  }
}
```

---

## 8. Frontend: JukeboxSheet

**File:** `src/components/guest/JukeboxSheet/index.tsx`

A bottom sheet (same pattern as `CustomDrinkPanel`) with three sections:
1. **Now Playing** — the song currently on the Spotify playlist (optional, shown if `/v1/me/player/currently-playing` returns data)
2. **Queue** — live list of songs guests have added (from Supabase Realtime)
3. **Search** — debounced input + results list

### Component Structure

```tsx
interface Props {
  partyId: string
  guestId: string
  guestName: string
  onClose: () => void
}

// Internal state:
// - query: string (search input)
// - searchResults: SpotifyTrackResult[]
// - queue: JukeboxTrack[] (with guest join)
// - isSearching: boolean
// - addingTrackId: string | null (optimistic loading state per track)
// - error: string | null
// - activeTab: 'queue' | 'search'
```

### Layout Sketch

```
┌─────────────────────────────────┐
│  ─── (drag handle)              │
│  🎵 Jukebox            [×]      │
│                                 │
│  [Queue]  [Add a Song]          │  ← tab switcher
│  ─────────────────────────────  │
│                                 │
│  QUEUE tab:                     │
│  ┌─────────────────────────┐   │
│  │ [art] Song Name         │   │
│  │       Artist · Album    │   │
│  │       Added by: Nick    │   │  ← guest attribution
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ [art] Song Name         │   │
│  │       Artist · Album    │   │
│  │       Added by: Sarah   │   │
│  └─────────────────────────┘   │
│                                 │
│  ADD A SONG tab:                │
│  ┌─────────────────────────┐   │
│  │ 🔍  Search songs...     │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ [art] Song Name    [+]  │   │
│  │       Artist            │   │
│  └─────────────────────────┘   │
│  ... more results               │
└─────────────────────────────────┘
```

### Real-time Queue Updates

Subscribe to `jukebox_tracks` inserts using the same pattern as `useOrders`:

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`jukebox:${partyId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'jukebox_tracks',
      filter: `party_id=eq.${partyId}`,
    }, async (payload) => {
      // Fetch the new row with guest join and prepend/append to queue
      const newTrack = await fetchTrackWithGuest(payload.new.id)
      setQueue(prev => [...prev, newTrack])
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [partyId])
```

### Search Debounce

```typescript
useEffect(() => {
  if (!query.trim()) {
    setSearchResults([])
    return
  }
  const timer = setTimeout(async () => {
    setIsSearching(true)
    const res = await fetch('/api/jukebox/search', {
      method: 'POST',
      body: JSON.stringify({ party_id: partyId, query }),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    setSearchResults(data.tracks ?? [])
    setIsSearching(false)
  }, 400)
  return () => clearTimeout(timer)
}, [query, partyId])
```

### Add Track Handler

```typescript
async function handleAdd(track: SpotifyTrackResult) {
  setAddingTrackId(track.id)
  setError(null)
  const res = await fetch('/api/jukebox/add', {
    method: 'POST',
    body: JSON.stringify({ party_id: partyId, guest_id: guestId, track }),
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const data = await res.json()
    setError(data.error ?? 'Could not add song')
  } else {
    // Switch to queue tab to show the added song
    setActiveTab('queue')
  }
  setAddingTrackId(null)
}
```

---

## 9. Frontend: SongCard

**File:** `src/components/guest/SongCard/index.tsx`

Used in both the queue view (inside JukeboxSheet) and optionally surfaced on the drinks page as a "now playing" indicator.

```tsx
interface Props {
  track: JukeboxTrack & { guest?: Guest }
  variant: 'queue' | 'search-result'
  onAdd?: (track: SpotifyTrackResult) => void  // only for search-result variant
  isAdding?: boolean
}
```

### Queue Variant Layout

```
┌──────────────────────────────────┐
│ ┌────────┐  Song Name            │
│ │  Art   │  Artist Name          │
│ │ 56×56  │  ♡ Added by: Nick    │  ← guest name in accent or muted color
│ └────────┘                       │
└──────────────────────────────────┘
```

**Styling notes:**
- Album art: 56px × 56px, `$radius-sm`, `object-fit: cover`
- Track name: `$font-size-base`, `$color-text-primary`, single line with `text-overflow: ellipsis`
- Artist: `$font-size-sm`, `$color-text-secondary`
- "Added by" line: `$font-size-xs`, use `$color-accent` for the name itself so it pops
- Card background: `$color-surface`, `$radius-md`, padding `$space-3`

### Search Result Variant Layout

```
┌──────────────────────────────────┐
│ ┌────────┐  Song Name      [+]  │
│ │  Art   │  Artist · 3:45       │
│ └────────┘                       │
└──────────────────────────────────┘
```

- `[+]` button: `$color-accent`, 32px circle, shows spinner when `isAdding === true`
- Duration formatted as `mm:ss` from `duration_ms`

---

## 10. Frontend: Guest Drink Page Integration

**File:** `src/app/guest/[guestId]/drinks/page.tsx`

Minimal changes needed here:

1. Add `<JukeboxButton onClick={() => setJukeboxOpen(true)} />` to the page
2. Conditionally render `<JukeboxSheet ... />` when `jukeboxOpen === true`
3. Pass `partyId`, `guestId`, and `guestName` as props (already available from `useGuest()` hook)
4. The button only renders if the party has Spotify connected — check by fetching `spotify_credentials` for the party on mount (a simple boolean field `has_jukebox` on the `parties` table, set to `true` when Spotify is connected, is the cleanest approach)

```tsx
// New state in the page component:
const [jukeboxOpen, setJukeboxOpen] = useState(false)
const [hasJukebox, setHasJukebox] = useState(false)

// On mount, alongside existing data fetching:
const { data: spotifyCreds } = await supabase
  .from('spotify_credentials')
  .select('id')
  .eq('party_id', partyId)
  .maybeSingle()
setHasJukebox(!!spotifyCreds)
```

---

## 11. Admin View: Jukebox Activity

### 11.1 Party Setup: Connect Spotify

**File:** `src/components/admin/PartySetupForm/index.tsx`

Add a new "Music / Jukebox" section below the existing party settings:

```
┌─────────────────────────────────────────────────┐
│ 🎵 Jukebox                                      │
│                                                  │
│  [Connect Spotify Account]                       │
│  ← redirects to /api/jukebox/connect?party_id=  │
│                                                  │
│  Once connected:                                 │
│  Playlist: [dropdown of host's playlists]        │
│  Status: ✓ Connected as Nick's Spotify           │
│  [Disconnect]                                    │
└─────────────────────────────────────────────────┘
```

### 11.2 Admin Jukebox Log Page

**File:** `src/app/admin/jukebox/page.tsx`
**Component:** `src/components/admin/JukeboxLog/index.tsx`

A new admin page showing the complete track log, with Realtime updates.

```
Jukebox Activity

  [Filter by guest ▼]

  ┌───────────────────────────────────────────────────┐
  │ [art] Blinding Lights                             │
  │       The Weeknd · After Hours                    │
  │       Added by Nick · 9:14 PM                     │
  ├───────────────────────────────────────────────────┤
  │ [art] Golden Hour                                 │
  │       JVKE · this is what falling in love feels  │
  │       Added by Sarah · 9:22 PM                    │
  └───────────────────────────────────────────────────┘

  Total: 14 songs added tonight
```

Column data per row:
- `album_art_url` — 48px square
- `track_name`, `artist_name`, `album_name`
- `guest.name` — who added it
- `added_at` — formatted as relative time ("2 min ago") or clock time ("9:14 PM")

Real-time subscription: same `postgres_changes` pattern, inserts prepended to top.

### 11.3 Admin Sidebar

Add "Jukebox" link to `AdminShell` sidebar nav, pointing to `/admin/jukebox`.

---

## 12. Environment Variables

Add to `.env.local` (and your Vercel/hosting environment):

```bash
# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://your-domain.com/api/jukebox/callback
```

These are **server-only** — do not prefix with `NEXT_PUBLIC_`. Guests never touch Spotify directly.

---

## 13. File Map

```
src/
├── app/
│   ├── api/
│   │   └── jukebox/
│   │       ├── connect/route.ts          # OAuth initiation
│   │       ├── callback/route.ts         # OAuth token exchange + save
│   │       ├── playlists/route.ts        # List host's Spotify playlists
│   │       ├── search/route.ts           # Proxy Spotify search for guests
│   │       ├── add/route.ts              # Add track to Spotify + DB
│   │       └── queue/route.ts            # Fetch jukebox_tracks with guest join
│   └── admin/
│       └── jukebox/
│           └── page.tsx                  # Admin jukebox activity log page
├── components/
│   ├── admin/
│   │   └── JukeboxLog/
│   │       ├── index.tsx                 # Admin track history list
│   │       └── styles.module.scss
│   └── guest/
│       ├── JukeboxButton/
│       │   ├── index.tsx                 # FAB trigger button
│       │   └── styles.module.scss
│       ├── JukeboxSheet/
│       │   ├── index.tsx                 # Main bottom sheet (queue + search)
│       │   └── styles.module.scss
│       └── SongCard/
│           ├── index.tsx                 # Reusable song row (queue + search variant)
│           └── styles.module.scss
├── lib/
│   └── spotify/
│       └── getToken.ts                   # Token fetch + lazy refresh utility
└── supabase/
    └── migrations/
        └── 002_jukebox.sql               # New tables + RLS + Realtime
```

---

## 14. Step-by-Step Build Order

Follow this order to avoid blocking dependencies:

### Phase 1 — Foundation (no UI yet)
1. **DB Migration** — write and apply `002_jukebox.sql`
2. **Types** — extend `src/lib/supabase/types.ts` with `SpotifyCredentials`, `JukeboxTrack`, `SpotifyTrackResult`
3. **Spotify App** — create on developer.spotify.com, copy credentials to `.env.local`
4. **`getToken` utility** — `src/lib/spotify/getToken.ts`

### Phase 2 — Backend Routes
5. **`/api/jukebox/connect`** — OAuth redirect (simple, no DB reads)
6. **`/api/jukebox/callback`** — token exchange + save to `spotify_credentials`
7. **`/api/jukebox/playlists`** — list host playlists (needs callback working)
8. **`/api/jukebox/search`** — search proxy (needs `getToken` working)
9. **`/api/jukebox/add`** — add track to Spotify + insert `jukebox_tracks`
10. **`/api/jukebox/queue`** — read queue with guest join

### Phase 3 — Admin Setup
11. **PartySetupForm** — add "Connect Spotify" + playlist picker section
12. **Test the full OAuth flow** end-to-end before building guest UI

### Phase 4 — Guest UI
13. **`SongCard`** — both variants (queue + search result)
14. **`JukeboxSheet`** — queue tab with Realtime, then search tab
15. **`JukeboxButton`** — FAB, conditionally shown based on `has_jukebox`
16. **Drinks page integration** — wire button + sheet + conditional render

### Phase 5 — Admin Log
17. **`JukeboxLog`** component with Realtime
18. **`/admin/jukebox`** page
19. **AdminShell** sidebar link

### Phase 6 — Polish
20. Empty state for queue ("No songs added yet — be the first!")
21. Duplicate track toast ("Already in the queue")
22. Error states for Spotify connectivity issues
23. Loading skeletons for search results
24. Test on mobile (safe area insets for the FAB, sheet height on small screens)

---

## Appendix: Spotify API Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Authorize user | GET | `https://accounts.spotify.com/authorize` |
| Exchange code | POST | `https://accounts.spotify.com/api/token` |
| Refresh token | POST | `https://accounts.spotify.com/api/token` |
| Get current user | GET | `https://api.spotify.com/v1/me` |
| Get user's playlists | GET | `https://api.spotify.com/v1/me/playlists` |
| Search tracks | GET | `https://api.spotify.com/v1/search?q={q}&type=track&limit=10` |
| Add to playlist | POST | `https://api.spotify.com/v1/playlists/{id}/tracks` |
| Now playing | GET | `https://api.spotify.com/v1/me/player/currently-playing` |

All endpoints except authorize/token require `Authorization: Bearer {access_token}` header.

The `add to playlist` body: `{ "uris": ["spotify:track:{trackId}"] }`
