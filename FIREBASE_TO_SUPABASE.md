# Firebase → Supabase Migration Guide

> This project currently uses **Firebase** (Auth + Realtime Database).  
> When switching to **Supabase**, follow this guide to replace each layer.

---

## Current Firebase Architecture

| What | Firebase Service | Where in code |
|------|-----------------|---------------|
| User auth (register/login/logout/session) | Firebase Authentication | `context/AuthContext.tsx`, `lib/firebase.ts` |
| User collected items | Firebase Realtime Database `/users/{uid}/collectedItems` | `context/GameContext.tsx` |
| Game locations (CRUD) | Firebase Realtime Database `/locations` | `lib/locationStorage.ts` |
| Admin password | `localStorage` (no Firebase) | `lib/locationStorage.ts` |

---

## Step 1 — Install Supabase

```bash
npm remove firebase
npm install @supabase/supabase-js
```

---

## Step 2 — Create `lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 3 — Supabase Database Schema

Run this SQL in the Supabase SQL editor:

```sql
-- Locations table (replaces RTDB /locations)
create table public.locations (
  id text primary key,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  reward text not null,
  description text default '',
  emoji text default '🐺',
  wolf_name text
);

alter table public.locations enable row level security;
-- Anyone can read locations
create policy "Public read" on public.locations for select using (true);
-- Only authenticated users can write (admin panel)
create policy "Auth write" on public.locations for all using (auth.role() = 'authenticated');

-- Collected items table (replaces RTDB /users/{uid}/collectedItems)
create table public.collected_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  reward_id text not null,
  collected_at timestamptz default now(),
  unique(user_id, reward_id)
);

alter table public.collected_items enable row level security;
create policy "Own rows" on public.collected_items for all using (auth.uid() = user_id);
```

Seed default locations after running the schema:
```sql
insert into public.locations values
  ('1','Baščaršija',43.8597,18.4286,'wolf_waiter','The historic bazaar and old town of Sarajevo','🐺','Wolf Waiter'),
  ('2','Ilidža',43.8266,18.3000,'wolf_gamer','A spa town at the foot of Mount Igman','🎮','Wolf Gamer'),
  ('3','Vijećnica',43.8592,18.4342,'wolf_scholar','The historic City Hall of Sarajevo','📚','Wolf Scholar'),
  ('4','Latin Bridge',43.8579,18.4313,'wolf_explorer','Historic bridge over the Miljacka river','🌉','Wolf Explorer'),
  ('5','Yellow Fortress',43.8621,18.4258,'wolf_guardian','An old fortress overlooking Sarajevo','🏰','Wolf Guardian');
```

---

## Step 4 — Replace `context/AuthContext.tsx`

Replace Firebase Auth calls with Supabase equivalents:

| Firebase | Supabase |
|----------|----------|
| `onAuthStateChanged(auth, cb)` | `supabase.auth.onAuthStateChange((event, session) => ...)` |
| `signInWithEmailAndPassword(auth, email, pw)` | `supabase.auth.signInWithPassword({ email, password })` |
| `createUserWithEmailAndPassword(auth, email, pw)` | `supabase.auth.signUp({ email, password })` |
| `signOut(auth)` | `supabase.auth.signOut()` |
| `auth.currentUser.uid` | `session.user.id` |

```ts
// AuthContext.tsx (Supabase version)
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ? { id: session.user.id, email: session.user.email || "" } : null);
    setLoading(false);
  });
  return () => subscription.unsubscribe();
}, []);
```

---

## Step 5 — Replace `context/GameContext.tsx`

| Firebase RTDB | Supabase |
|--------------|----------|
| `onValue(ref(db, path), cb)` | `supabase.from('collected_items').select().eq('user_id', uid)` + Realtime subscription |
| `set(ref(db, path), true)` | `supabase.from('collected_items').insert({ user_id, reward_id })` |

```ts
// GameContext.tsx (Supabase version — collect fn)
const collect = useCallback((rewardId: string) => {
  const userId = supabase.auth.getUser(); // or from AuthContext
  supabase.from("collected_items").insert({ user_id: userId, reward_id: rewardId });
}, []);

// Real-time subscription
supabase
  .channel("collected")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "collected_items", filter: `user_id=eq.${uid}` },
    (payload) => {
      setCollectedItems((prev) => [...prev, payload.new.reward_id]);
    })
  .subscribe();
```

---

## Step 6 — Replace `lib/locationStorage.ts`

| Firebase RTDB | Supabase |
|--------------|----------|
| `onValue(ref(db, 'locations'), cb)` | `supabase.from('locations').select('*')` + Realtime |
| `set(ref(db, 'locations'), obj)` | `supabase.from('locations').upsert(rows)` |

```ts
// subscribeLocations (Supabase version)
export function subscribeLocations(callback: (locs: Location[]) => void): () => void {
  supabase.from("locations").select("*").then(({ data }) => {
    callback((data || []).map(dbRowToLocation));
  });

  const channel = supabase.channel("locations")
    .on("postgres_changes", { event: "*", schema: "public", table: "locations" }, () => {
      supabase.from("locations").select("*").then(({ data }) => {
        callback((data || []).map(dbRowToLocation));
      });
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// saveLocations (Supabase version)
export async function saveLocations(locs: Location[]): Promise<void> {
  // Delete all and re-insert (simplest for MVP full-array saves)
  await supabase.from("locations").delete().neq("id", "");
  await supabase.from("locations").insert(locs.map(locationToDbRow));
}
```

---

## Firebase RTDB Security Rules

> **Set these rules in Firebase Console → Realtime Database → Rules** before going live:

```json
{
  "rules": {
    "locations": {
      ".read": true,
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

> Currently, if you leave the default rules (`".read": false, ".write": false`), the app will fail silently. Set these rules in the Firebase Console first!

---

## Delete Firebase after migration

```bash
npm remove firebase
rm lib/firebase.ts
```

Update imports in:
- `context/AuthContext.tsx` → `lib/supabase.ts`
- `context/GameContext.tsx` → `lib/supabase.ts`
- `lib/locationStorage.ts` → `lib/supabase.ts`
