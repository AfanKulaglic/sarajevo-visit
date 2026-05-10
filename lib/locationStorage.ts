import { db } from "./firebase";
import { ref, set, get, onValue } from "firebase/database";
import { Location, locations as defaultLocations } from "./locations";

const LOCATIONS_REF = "locations";

// IDs that were removed from the default seed and must be purged from Firebase.
const RETIRED_IDS = new Set(["3", "4", "5"]);
// IDs that belong to the current default set (derived at module load time).
const DEFAULT_IDS = new Set(defaultLocations.map((d) => d.id));

// ── RTDB helpers ──────────────────────────────────────────────────────────────

function locToClean(l: Location): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(l)) {
    if (v !== undefined) clean[k] = v;
  }
  return clean;
}

function locsToObj(locs: Location[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  locs.forEach((l) => { obj[l.id] = locToClean(l); });
  return obj;
}

/** Real-time RTDB subscription. On first load, reconciles Firebase so that:
 *  - All current defaults are always present (re-adds any that are missing)
 *  - Retired IDs are removed
 *  - User-added locations (not in defaults, not retired) are preserved
 *  Returns unsubscribe fn. */
export function subscribeLocations(callback: (locs: Location[]) => void): () => void {
  const locRef = ref(db, LOCATIONS_REF);

  get(locRef).then((snap) => {
    const val = snap.val() as Record<string, Location> | null;
    const existing = val ?? {};

    // Build the desired state:
    // 1. For each default location: merge default (provides new fields like icon/modelGlb) with
    //    existing Firebase entry (preserves admin-edited fields like images, lat/lng overrides).
    //    Firebase values win over defaults so admin edits are never lost.
    const desired: Record<string, unknown> = {};
    for (const def of defaultLocations) {
      const existingEntry = existing[def.id] ?? {};
      desired[def.id] = { ...locToClean(def), ...locToClean(existingEntry as Location) };
    }

    // 2. Preserve user-added locations (not a default ID and not retired)
    for (const [id, loc] of Object.entries(existing)) {
      if (!DEFAULT_IDS.has(id) && !RETIRED_IDS.has(id)) {
        desired[id] = locToClean(loc);
      }
    }

    // 3. Write only if something actually needs to change
    const hasRetired = Object.keys(existing).some((id) => RETIRED_IDS.has(id));
    const hasMissingDefault = defaultLocations.some((d) => !existing[d.id]);
    // Also write if any existing default location is missing a field from the code defaults
    const hasOutdatedDefault = defaultLocations.some((d) => {
      const existingEntry = existing[d.id] as unknown as Record<string, unknown> | undefined;
      if (!existingEntry) return false;
      const defEntry = locToClean(d);
      // A field is "outdated" only if it exists in the code default but is absent in Firebase
      return Object.keys(defEntry).some((k) => !(k in existingEntry));
    });
    if (hasRetired || hasMissingDefault || hasOutdatedDefault) {
      set(locRef, desired).catch(console.error);
    }
  }).catch(console.error);

  // Real-time subscription — fires on every change including admin saves.
  const defaultsById = Object.fromEntries(defaultLocations.map((d) => [d.id, d]));
  return onValue(locRef, (snap) => {
    const val = snap.val();
    if (!val) {
      callback(defaultLocations);
    } else {
      // Merge: default provides any fields missing from Firebase (e.g. newly added icon/modelGlb),
      // while Firebase values override defaults (preserving admin edits).
      const merged = (Object.values(val) as Location[]).map((loc) => {
        const def = defaultsById[loc.id];
        return def ? { ...def, ...loc } : loc;
      });
      const sorted = merged.sort((a, b) => a.name.localeCompare(b.name));
      callback(sorted);
    }
  });
}

/** Overwrite the full locations list in RTDB. */
export async function saveLocations(locs: Location[]): Promise<void> {
  await set(ref(db, LOCATIONS_REF), locsToObj(locs));
}

/** Reset RTDB locations to the 5 static defaults. */
export async function resetToDefaults(): Promise<void> {
  await set(ref(db, LOCATIONS_REF), locsToObj(defaultLocations));
}

// ── Admin auth (Firebase RTDB — password hash stored at /adminConfig/passwordHash) ─

export async function checkAdminPassword(password: string): Promise<boolean> {
  try {
    const snap = await get(ref(db, "adminConfig/passwordHash"));
    const stored = snap.exists() ? (snap.val() as string) : btoa("admin");
    return btoa(password) === stored;
  } catch {
    // Firebase rules block the read — fall back to default password
    return btoa(password) === btoa("admin");
  }
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  await set(ref(db, "adminConfig/passwordHash"), btoa(newPassword));
}

