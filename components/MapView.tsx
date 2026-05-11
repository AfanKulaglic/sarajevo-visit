"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Location } from "@/lib/locations";
import { GpsPosition } from "@/lib/gps";

function getBearing(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLng = toRad(toLng - fromLng);
  const lat1 = toRad(fromLat);
  const lat2 = toRad(toLat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function getDistanceM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

function formatWalkTime(meters: number): string {
  const minutes = Math.round(meters / 83.3); // ~5 km/h
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function formatDriveTime(meters: number): string {
  const minutes = Math.round(meters / 500); // ~30 km/h city average
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function bearingToLabel(deg: number): string {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(deg / 45) % 8];
}

interface MapViewProps {
  locations: Location[];
  collectedItems: string[];
  userPosition: GpsPosition | null;
  onMarkerClick: (location: Location) => void;
  navTarget?: Location | null;
  navMode?: "foot" | "car";
  onClearNav?: () => void;
}

export default function MapView({
  locations,
  collectedItems,
  userPosition,
  onMarkerClick,
  navTarget,
  navMode = "foot",
  onClearNav,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locMarkerRefs = useRef<Record<string, any>>({});
  const [mapReady, setMapReady] = useState(false);
  const [viewMode, setViewMode] = useState<"overview" | "3d">("overview");
  const [routeDistanceM, setRouteDistanceM] = useState<number | null>(null);

  const bearing = useMemo(() => {
    if (!userPosition || !navTarget) return 0;
    return getBearing(
      userPosition.lat,
      userPosition.lng,
      navTarget.lat,
      navTarget.lng
    );
  }, [userPosition, navTarget]);

  const straightDistM = useMemo(() => {
    if (!userPosition || !navTarget) return null;
    return getDistanceM(
      userPosition.lat,
      userPosition.lng,
      navTarget.lat,
      navTarget.lng
    );
  }, [userPosition, navTarget]);

  // Reset to overview + clear route distance when nav is cleared
  useEffect(() => {
    if (!navTarget) {
      setViewMode("overview");
      setRouteDistanceM(null);
    }
  }, [navTarget]);

  // One-time map initialisation
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!mapContainerRef.current || mapRef.current) return;
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !mapContainerRef.current) return;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "\u00a9 OpenStreetMap contributors",
              maxzoom: 19,
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [18.4131, 43.8563],
        zoom: 13,
        bearing: 0,
        pitchWithRotate: false,
        dragRotate: false,
      });

      map.on("load", () => {
        if (cancelled) return;

        map.addSource("route", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#a855f7",
            "line-width": 5,
            "line-dasharray": [2, 2],
            "line-opacity": 0.9,
          },
        });

        mapRef.current = map;
        setMapReady(true);
      });
    };

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        userMarkerRef.current = null;
        locMarkerRefs.current = {};
        setMapReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Location markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    let cancelled = false;

    const update = async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !mapRef.current) return;

      const currentIds = new Set(locations.map((l) => l.id));

      for (const id of Object.keys(locMarkerRefs.current)) {
        if (!currentIds.has(id)) {
          locMarkerRefs.current[id].remove();
          delete locMarkerRefs.current[id];
        }
      }

      for (const loc of locations) {
        const isCollected = collectedItems.includes(loc.reward);
        const bg = isCollected ? "#16a34a" : "#7c3aed";
        const border = isCollected ? "#4ade80" : "#c084fc";

        const el = document.createElement("div");
        el.style.cssText = [
          "width:44px",
          "height:44px",
          `background:${bg}`,
          `border:3px solid ${border}`,
          "border-radius:50%",
          "display:flex",
          "align-items:center",
          "justify-content:center",
          "font-size:20px",
          "box-shadow:0 2px 12px rgba(0,0,0,0.6)",
          "cursor:pointer",
          "user-select:none",
        ].join(";");
        if (loc.icon) {
          const img = document.createElement("img");
          img.src = loc.icon;
          img.style.cssText = "width:100%;height:100%;object-fit:contain;padding:4px;border-radius:50%;";
          img.alt = loc.name;
          el.appendChild(img);
        } else {
          el.textContent = loc.emoji;
        }
        el.title = loc.name;
        el.addEventListener("click", () => onMarkerClick(loc));

        if (locMarkerRefs.current[loc.id]) {
          locMarkerRefs.current[loc.id].remove();
          delete locMarkerRefs.current[loc.id];
        }

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([loc.lng, loc.lat])
          .addTo(mapRef.current);
        locMarkerRefs.current[loc.id] = marker;
      }
    };

    const t = setTimeout(update, 60);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [mapReady, locations, collectedItems, onMarkerClick]);

  // User position marker
  useEffect(() => {
    if (!mapReady || !mapRef.current || !userPosition) return;
    let cancelled = false;

    const update = async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !mapRef.current) return;

      const is3d = viewMode === "3d" && !!navTarget;

      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([userPosition.lng, userPosition.lat]);
        applyUserMarkerStyle(
          userMarkerRef.current.getElement() as HTMLElement,
          is3d
        );
      } else {
        const el = document.createElement("div");
        applyUserMarkerStyle(el, is3d);
        userMarkerRef.current = new maplibregl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([userPosition.lng, userPosition.lat])
          .addTo(mapRef.current);

        if (!navTarget) {
          mapRef.current.flyTo({
            center: [userPosition.lng, userPosition.lat],
            zoom: 15,
            duration: 1200,
          });
        }
      }
    };

    update();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, userPosition, viewMode, navTarget]);

  // View-mode switch
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (viewMode === "3d" && userPosition) {
      mapRef.current.flyTo({
        center: [userPosition.lng, userPosition.lat],
        zoom: 18,
        bearing: bearing,
        duration: 900,
      });
    } else if (viewMode === "overview") {
      mapRef.current.flyTo({ bearing: 0, duration: 700 });
      if (navTarget && userPosition) {
        const minLng = Math.min(userPosition.lng, navTarget.lng);
        const maxLng = Math.max(userPosition.lng, navTarget.lng);
        const minLat = Math.min(userPosition.lat, navTarget.lat);
        const maxLat = Math.max(userPosition.lat, navTarget.lat);
        setTimeout(() => {
          if (!mapRef.current) return;
          mapRef.current.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            { padding: 80, duration: 900 }
          );
        }, 400);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Route line
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    let cancelled = false;

    const drawRoute = async () => {
      if (!mapRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const source = mapRef.current.getSource("route") as any;
      if (!source) return;

      if (!navTarget) {
        source.setData({ type: "FeatureCollection", features: [] });
        return;
      }

      let coords: [number, number][] = [];

      if (userPosition) {
        try {
          const profile = navMode === "car" ? "driving" : "foot";
          const url =
            `https://router.project-osrm.org/route/v1/${profile}/` +
            `${userPosition.lng},${userPosition.lat};${navTarget.lng},${navTarget.lat}` +
            "?overview=full&geometries=geojson";
          const res = await fetch(url);
          if (!cancelled && res.ok) {
            const data = await res.json();
            coords = data?.routes?.[0]?.geometry?.coordinates ?? [];
            const dist = data?.routes?.[0]?.distance;
            if (typeof dist === "number") setRouteDistanceM(dist);
          }
        } catch {
          // fallback to straight line
        }
      }

      if (cancelled || !mapRef.current) return;

      if (coords.length < 2) {
        coords = [];
        if (userPosition) coords.push([userPosition.lng, userPosition.lat]);
        coords.push([navTarget.lng, navTarget.lat]);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const src = mapRef.current.getSource("route") as any;
      if (!src) return;
      src.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: coords },
          },
        ],
      });

      // Update route line color based on travel mode
      if (mapRef.current.getLayer("route-line")) {
        mapRef.current.setPaintProperty(
          "route-line",
          "line-color",
          navMode === "car" ? "#3080ff" : "#a855f7"
        );
      }

      const lngs = coords.map(([lng]) => lng);
      const lats = coords.map(([, lat]) => lat);
      mapRef.current.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 80, duration: 1100 }
      );
    };

    const t = setTimeout(drawRoute, 80);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [mapReady, navTarget, userPosition, navMode]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />

      {navTarget && (
        <div
          className="absolute top-3 left-3 right-3 z-[1000] flex items-center gap-3 px-3 py-3 rounded-2xl"
          style={{
            background: "rgba(14,11,26,0.93)",
            border: navMode === "car" ? "1px solid rgba(48,128,255,0.35)" : "1px solid rgba(168,85,247,0.35)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <span className="text-xl flex-shrink-0">{navTarget.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70 flex items-center gap-1.5"
               style={{ color: navMode === "car" ? "#60a5fa" : "#c084fc" }}>
              {navMode === "car" ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h10l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="1.5"/><path d="M9 20l1-5 2 2 1-2 1 5"/><path d="M6.5 14.5S8 12 12 12s5.5 2.5 5.5 2.5"/>
                </svg>
              )}
              {navMode === "car" ? "Driving to" : "Walking to"}
            </p>
            <p className="text-white text-[13px] font-semibold truncate">
              {navTarget.name}
            </p>
            {(routeDistanceM !== null || straightDistM !== null) && (
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[13px] font-bold" style={{ color: navMode === "car" ? "#60a5fa" : "#c084fc" }}>
                  {routeDistanceM !== null
                    ? formatDistance(routeDistanceM)
                    : straightDistM !== null
                    ? `~${formatDistance(straightDistM)}`
                    : null}
                </span>
                <span className="text-white/30 text-[11px]">·</span>
                <span className="text-white/55 text-[11px]">
                  {navMode === "car"
                    ? `${formatDriveTime(routeDistanceM ?? straightDistM ?? 0)} drive`
                    : `${formatWalkTime(routeDistanceM ?? straightDistM ?? 0)} walk`}
                </span>
                {userPosition && (
                  <>
                    <span className="text-white/30 text-[11px]">·</span>
                    <span className="text-white/55 text-[11px]">
                      {bearingToLabel(bearing)}
                    </span>
                  </>
                )}
                {routeDistanceM === null && straightDistM !== null && (
                  <span className="text-white/30 text-[10px] italic">straight line</span>
                )}
              </div>
            )}
          </div>

          <div className="flex bg-white/[0.06] rounded-xl border border-white/[0.08] p-0.5 flex-shrink-0">
            <button
              onClick={() => setViewMode("overview")}
              className={
                "px-2.5 py-1.5 rounded-[9px] text-[11px] font-semibold transition-all duration-200 " +
                (viewMode === "overview"
                  ? "bg-purple-600 text-white"
                  : "text-white/40 hover:text-white/70")
              }
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={
                "px-2.5 py-1.5 rounded-[9px] text-[11px] font-semibold transition-all duration-200 " +
                (viewMode === "3d"
                  ? "bg-purple-600 text-white"
                  : "text-white/40 hover:text-white/70")
              }
            >
              3D
            </button>
          </div>

          <button
            onClick={onClearNav}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-colors flex-shrink-0"
            aria-label="Stop navigation"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function applyUserMarkerStyle(el: HTMLElement, is3d: boolean) {
  if (is3d) {
    el.style.cssText = [
      "width:0",
      "height:0",
      "border-left:11px solid transparent",
      "border-right:11px solid transparent",
      "border-bottom:30px solid #a855f7",
      "filter:drop-shadow(0 0 8px rgba(168,85,247,0.9))",
    ].join(";");
  } else {
    el.style.cssText = [
      "width:20px",
      "height:20px",
      "background:#3b82f6",
      "border:3px solid white",
      "border-radius:50%",
      "box-shadow:0 0 0 5px rgba(59,130,246,0.35)",
    ].join(";");
  }
}
