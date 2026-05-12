import { Location } from "./locations";

/** In-memory pending navigation request.
 *  Set by the Collection page before navigating to /map.
 *  Consumed (and cleared) by the Map page on mount.
 *  Module-level variable survives Next.js route transitions in the same tab. */
let pending: { loc: Location; mode: "foot" | "car" } | null = null;

export function setPendingNav(loc: Location, mode: "foot" | "car") {
  pending = { loc, mode };
}

export function consumePendingNav(): { loc: Location; mode: "foot" | "car" } | null {
  const p = pending;
  pending = null;
  return p;
}
