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
  const prevPositionRef = useRef<GpsPosition | null>(null);

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
      const isMoving = prevPositionRef.current !== null &&
        (prevPositionRef.current.lat !== userPosition.lat || prevPositionRef.current.lng !== userPosition.lng);
      prevPositionRef.current = userPosition;

      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([userPosition.lng, userPosition.lat]);
        applyUserMarkerStyle(
          userMarkerRef.current.getElement() as HTMLElement,
          is3d,
          navMode,
          isMoving
        );
      } else {
        const el = document.createElement("div");
        applyUserMarkerStyle(el, is3d, navMode, isMoving);
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
  }, [mapReady, userPosition, viewMode, navTarget, navMode]);

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
        <>
          {/* Top card: mode + view toggles */}
          <div
            className="absolute top-3 left-3 right-3 z-[1000] flex gap-2 p-2 rounded-2xl"
            style={{
              background: "rgba(14,11,26,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            {/* Walk / Drive toggle */}
            <div className="flex flex-1 rounded-xl p-0.5 gap-0.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => onNavModeChange?.("foot")}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] text-[13px] font-bold transition-all duration-200"
                style={navMode === "foot"
                  ? { background: "rgba(168,85,247,0.25)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.45)" }
                  : { color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="4" r="2"/>
                  <path d="M9 20l1.5-5 2 2 1.5-3 1.5 6"/>
                  <path d="M6.5 13.5C7.5 11.5 9.5 10.5 12 10.5s4.5 1 5.5 3"/>
                </svg>
                Walk
              </button>
              <button
                onClick={() => onNavModeChange?.("car")}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] text-[13px] font-bold transition-all duration-200"
                style={navMode === "car"
                  ? { background: "rgba(48,128,255,0.25)", color: "#60a5fa", border: "1px solid rgba(48,128,255,0.45)" }
                  : { color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="11" width="22" height="7" rx="2"/>
                  <path d="M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4"/>
                  <circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>
                </svg>
                Drive
              </button>
            </div>

            {/* Map / 3D toggle */}
            <div className="flex rounded-xl p-0.5 gap-0.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => setViewMode("overview")}
                className={"px-3 py-2 rounded-[10px] text-[13px] font-bold transition-all duration-200 " +
                  (viewMode === "overview" ? "bg-purple-600 text-white" : "text-white/30")}
              >
                Map
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={"px-3 py-2 rounded-[10px] text-[13px] font-bold transition-all duration-200 " +
                  (viewMode === "3d" ? "bg-purple-600 text-white" : "text-white/30")}
              >
                3D
              </button>
            </div>
          </div>

          {/* Bottom card: destination info */}
          <div
            className="absolute bottom-24 left-3 right-3 z-[1000] rounded-3xl"
            style={{
              background: "rgba(14,11,26,0.96)",
              border: navMode === "car" ? "1px solid rgba(48,128,255,0.4)" : "1px solid rgba(168,85,247,0.4)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
            }}
          >
            {/* Destination name + close */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.15)" }}>
                {navTarget.icon
                  ? <img src={navTarget.icon} alt={navTarget.name} className="w-full h-full object-contain p-1" />
                  : <span className="text-xl">{navTarget.emoji}</span>}
              </div>
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
            <div className="px-4 pb-4">
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
                  <span className="ml-1.5 text-white/25">{bearingToLabel(bearing)}</span>
                )}
                {routeDistanceM === null && straightDistM !== null && (
                  <span className="ml-1 italic text-white/20">straight line</span>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function applyUserMarkerStyle(el: HTMLElement, is3d: boolean, navMode: "foot" | "car" = "foot", isMoving = false) {
  if (is3d && navMode === "foot") {
    const animStyle = isMoving
      ? `<style>
          @keyframes legF{0%,100%{transform:rotate(-28deg) translateX(0)}50%{transform:rotate(28deg) translateX(0)}}
          @keyframes legB{0%,100%{transform:rotate(28deg) translateX(0)}50%{transform:rotate(-28deg) translateX(0)}}
          @keyframes armF{0%,100%{transform:rotate(22deg)}50%{transform:rotate(-22deg)}}
          @keyframes armB{0%,100%{transform:rotate(-22deg)}50%{transform:rotate(22deg)}}
          .lf{transform-origin:12px 19px;animation:legF 0.5s ease-in-out infinite}
          .lb{transform-origin:12px 19px;animation:legB 0.5s ease-in-out infinite}
          .af{transform-origin:12px 13px;animation:armF 0.5s ease-in-out infinite}
          .ab{transform-origin:12px 13px;animation:armB 0.5s ease-in-out infinite}
        </style>` : "";
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 24 32">
        ${animStyle}
        <!-- head -->
        <circle cx="12" cy="4.5" r="3" fill="#c084fc"/>
        <!-- body -->
        <path d="M9 9 Q12 8 15 9 L14 19 Q12 20 10 19 Z" fill="#c084fc"/>
        <!-- back arm -->
        <rect class="ab" x="11" y="12" width="2.2" height="8" rx="1.1" fill="#a855f7"/>
        <!-- back leg -->
        <rect class="lb" x="11" y="18" width="2.2" height="9" rx="1.1" fill="#a855f7"/>
        <!-- front arm -->
        <rect class="af" x="11" y="12" width="2.2" height="8" rx="1.1" fill="#c084fc"/>
        <!-- front leg -->
        <rect class="lf" x="11" y="18" width="2.2" height="9" rx="1.1" fill="#c084fc"/>
      </svg>`;
    el.style.cssText = [
      "width:40px",
      "height:52px",
      "filter:drop-shadow(0 0 10px rgba(168,85,247,0.95)) drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
    ].join(";");
  } else if (is3d && navMode === "car") {
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="56" viewBox="0 0 40 56">
        <!-- shadow -->
        <ellipse cx="20" cy="50" rx="10" ry="3" fill="rgba(0,0,0,0.3)"/>
        <!-- front bumper -->
        <rect x="11" y="3" width="18" height="4" rx="2" fill="#1a6fff"/>
        <!-- headlights -->
        <rect x="11" y="3" width="6" height="3" rx="1.5" fill="#e0f0ff" opacity="0.9"/>
        <rect x="23" y="3" width="6" height="3" rx="1.5" fill="#e0f0ff" opacity="0.9"/>
        <!-- body -->
        <path d="M10 7 Q8 8 7 12 L7 42 Q7 47 10 48 L30 48 Q33 47 33 42 L33 12 Q32 8 30 7 Z" fill="#3080ff"/>
        <!-- roof / cabin highlight -->
        <path d="M13 14 Q14 12 20 12 Q26 12 27 14 L28 30 Q27 32 20 32 Q13 32 12 30 Z" fill="rgba(180,220,255,0.22)"/>
        <!-- windshield -->
        <path d="M14 13 Q20 11 26 13 L27 22 Q20 24 13 22 Z" fill="rgba(200,230,255,0.35)" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
        <!-- rear window -->
        <path d="M14 33 Q20 35 26 33 L27 28 Q20 30 13 28 Z" fill="rgba(200,230,255,0.2)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
        <!-- left front wheel -->
        <rect x="5" y="10" width="5" height="9" rx="2.5" fill="#1a1a2e" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
        <!-- right front wheel -->
        <rect x="30" y="10" width="5" height="9" rx="2.5" fill="#1a1a2e" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
        <!-- left rear wheel -->
        <rect x="5" y="34" width="5" height="9" rx="2.5" fill="#1a1a2e" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
        <!-- right rear wheel -->
        <rect x="30" y="34" width="5" height="9" rx="2.5" fill="#1a1a2e" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
        <!-- wheel rims -->
        <circle cx="7.5" cy="14.5" r="2" fill="rgba(255,255,255,0.15)"/>
        <circle cx="32.5" cy="14.5" r="2" fill="rgba(255,255,255,0.15)"/>
        <circle cx="7.5" cy="38.5" r="2" fill="rgba(255,255,255,0.15)"/>
        <circle cx="32.5" cy="38.5" r="2" fill="rgba(255,255,255,0.15)"/>
        <!-- rear taillights -->
        <rect x="11" y="44" width="6" height="3" rx="1.5" fill="rgba(255,60,60,0.85)"/>
        <rect x="23" y="44" width="6" height="3" rx="1.5" fill="rgba(255,60,60,0.85)"/>
        <!-- body shine -->
        <path d="M15 8 Q20 7 25 8 L25 11 Q20 10 15 11 Z" fill="rgba(255,255,255,0.12)"/>
      </svg>`;
    el.style.cssText = [
      "width:40px",
      "height:56px",
      "filter:drop-shadow(0 0 10px rgba(48,128,255,0.95)) drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
    ].join(";");
  } else {
    el.innerHTML = "";
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

