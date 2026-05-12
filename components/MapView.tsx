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

// Decodes Valhalla's precision-6 encoded polyline into [lng, lat] pairs
function decodePolyline6(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let result = 0, shift = 0, b: number;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0; shift = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lng / 1e6, lat / 1e6]);
  }
  return coords;
}

interface MapViewProps {
  locations: Location[];
  collectedItems: string[];
  userPosition: GpsPosition | null;
  onMarkerClick: (location: Location) => void;
  navTarget?: Location | null;
  navMode?: "foot" | "car";
  onNavModeChange?: (mode: "foot" | "car") => void;
  onClearNav?: () => void;
}

export default function MapView({
  locations,
  collectedItems,
  userPosition,
  onMarkerClick,
  navTarget,
  navMode = "foot",
  onNavModeChange,
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
          if (navMode === "car") {
            // OSRM driving: follows one-way streets, turn restrictions, traffic rules
            const url =
              `https://router.project-osrm.org/route/v1/driving/` +
              `${userPosition.lng},${userPosition.lat};${navTarget.lng},${navTarget.lat}` +
              "?overview=full&geometries=geojson";
            const res = await fetch(url);
            if (!cancelled && res.ok) {
              const data = await res.json();
              coords = data?.routes?.[0]?.geometry?.coordinates ?? [];
              const dist = data?.routes?.[0]?.distance;
              if (typeof dist === "number") setRouteDistanceM(dist);
            }
          } else {
            // Valhalla pedestrian: uses pedestrian paths, parks, living streets;
            // not restricted by traffic signs or one-way rules
            const res = await fetch("https://valhalla1.openstreetmap.de/route", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                locations: [
                  { lon: userPosition.lng, lat: userPosition.lat },
                  { lon: navTarget.lng, lat: navTarget.lat },
                ],
                costing: "pedestrian",
                costing_options: {
                  pedestrian: {
                    use_living_streets: 1.0,
                    use_tracks: 0.5,
                    shortest: false,
                  },
                },
              }),
            });
            if (!cancelled && res.ok) {
              const data = await res.json();
              const shape: string | undefined = data?.trip?.legs?.[0]?.shape;
              const dist: number | undefined = data?.trip?.summary?.length; // km
              if (shape) coords = decodePolyline6(shape);
              if (typeof dist === "number") setRouteDistanceM(dist * 1000);
            }
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
          className="absolute bottom-24 left-3 right-3 z-[1000] rounded-3xl"
          style={{
            background: "rgba(14,11,26,0.96)",
            border: navMode === "car" ? "1px solid rgba(48,128,255,0.4)" : "1px solid rgba(168,85,247,0.4)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
          }}
        >
          {/* Top row: destination name + close */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <span className="text-2xl flex-shrink-0">{navTarget.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white/50 text-[11px] font-semibold uppercase tracking-widest">
                {navMode === "car" ? "Driving to" : "Walking to"}
              </p>
              <p className="text-white text-[15px] font-bold truncate leading-tight">
                {navTarget.name}
              </p>
            </div>
            <button
              onClick={onClearNav}
              className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              aria-label="Stop navigation"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Distance + time */}
          <div className="flex items-end gap-3 px-4 pb-3">
            <div>
              <p className="text-[32px] font-black leading-none" style={{ color: navMode === "car" ? "#60a5fa" : "#c084fc" }}>
                {routeDistanceM !== null
                  ? formatDistance(routeDistanceM)
                  : straightDistM !== null
                  ? `~${formatDistance(straightDistM)}`
                  : "--"}
              </p>
              <p className="text-white/40 text-[12px] mt-0.5">
                {(routeDistanceM !== null || straightDistM !== null)
                  ? (navMode === "car"
                      ? formatDriveTime(routeDistanceM ?? straightDistM ?? 0) + " drive"
                      : formatWalkTime(routeDistanceM ?? straightDistM ?? 0) + " walk")
                  : "Calculating..."}
                {userPosition && (
                  <span className="ml-1.5 text-white/25">
                    {bearingToLabel(bearing)}
                  </span>
                )}
                {routeDistanceM === null && straightDistM !== null && (
                  <span className="ml-1 italic text-white/20">straight line</span>
                )}
              </p>
            </div>
          </div>

          {/* Walk / Drive toggle + Overview / 3D */}
          <div className="flex gap-2 px-4 pb-4">
            {/* Mode toggle */}
            <div className="flex flex-1 rounded-2xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                onClick={() => onNavModeChange?.("foot")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200"
                style={navMode === "foot"
                  ? { background: "rgba(168,85,247,0.25)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.45)" }
                  : { color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="4" r="2"/>
                  <path d="M9 20l1.5-5 2 2 1.5-3 1.5 6"/>
                  <path d="M6.5 13.5C7.5 11.5 9.5 10.5 12 10.5s4.5 1 5.5 3"/>
                </svg>
                Walk
              </button>
              <button
                onClick={() => onNavModeChange?.("car")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200"
                style={navMode === "car"
                  ? { background: "rgba(48,128,255,0.25)", color: "#60a5fa", border: "1px solid rgba(48,128,255,0.45)" }
                  : { color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="11" width="22" height="7" rx="2"/>
                  <path d="M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4"/>
                  <circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>
                </svg>
                Drive
              </button>
            </div>

            {/* View toggle */}
            <div className="flex rounded-2xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                onClick={() => setViewMode("overview")}
                className={"px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 " +
                  (viewMode === "overview" ? "bg-purple-600 text-white" : "text-white/30")}
              >
                Map
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={"px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 " +
                  (viewMode === "3d" ? "bg-purple-600 text-white" : "text-white/30")}
              >
                3D
              </button>
            </div>
          </div>
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
