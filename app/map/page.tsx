"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LocationCard from "@/components/LocationCard";
import LandmarkDetail from "@/components/LandmarkDetail";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import LanguagePickerOverlay from "@/components/LanguagePickerOverlay";
import { LANG_CHOSEN_KEY, useLanguage } from "@/context/LanguageContext";
import { locations as defaultLocations, Location } from "@/lib/locations";
import { subscribeLocations } from "@/lib/locationStorage";
import { getCurrentPosition, getDistanceMeters, isUserNearLocation, GpsPosition } from "@/lib/gps";
import { useGame } from "@/context/GameContext";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0E0B1A] flex flex-col items-center justify-center gap-4">
      <img src="/icons/logo.png" alt="" className="w-12 h-12 object-contain opacity-60" />
      <div className="w-6 h-6 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
    </div>
  ),
});

type ToastType = "success" | "error" | "info";

interface Toast {
  message: string;
  type: ToastType;
}

export default function MapPage() {
  const { collectedItems, collect, hasCollected } = useGame();
  const { t } = useLanguage();
  const [activeLocations, setActiveLocations] = useState<Location[]>(defaultLocations);
  const [userPosition, setUserPosition] = useState<GpsPosition | null>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showList, setShowList] = useState(false);
  const [discoveredLoc, setDiscoveredLoc] = useState<Location | null>(null);
  const [navTarget, setNavTarget] = useState<Location | null>(null);
  const [navMode, setNavMode] = useState<"foot" | "car">("foot");
  const [mapTheme, setMapTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("saraya_map_theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });
  const [locationPermission, setLocationPermission] = useState<"unknown" | "granted" | "denied">("unknown");
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "unknown">("unknown");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Show language picker first, then onboarding, each only once
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem(LANG_CHOSEN_KEY)) {
        setShowLangPicker(true);
      } else if (!localStorage.getItem("saraya_onboarded")) {
        setShowOnboarding(true);
      }
    }
  }, []);

  // Detect device on mount
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setDeviceType("ios");
    else if (/android/i.test(ua)) setDeviceType("android");
    else setDeviceType("unknown");
  }, []);

  // Listen for map theme changes dispatched by Navbar settings
  useEffect(() => {
    const handler = (e: Event) => {
      const theme = (e as CustomEvent<"dark" | "light">).detail;
      setMapTheme(theme);
    };
    window.addEventListener("mapthemechange", handler);
    return () => window.removeEventListener("mapthemechange", handler);
  }, []);

  const [pendingNav, setPendingNav] = useState<{ id: string; mode: "foot" | "car" } | null>(null);

  // Load locations from Firebase RTDB in real-time
  useEffect(() => {
    return subscribeLocations((locs) => setActiveLocations(locs));
  }, []);

  // Read and clear pending nav intent once on mount (set by collection page)
  useEffect(() => {
    const raw = localStorage.getItem("saraya_pending_nav");
    if (!raw) return;
    localStorage.removeItem("saraya_pending_nav");
    try { setPendingNav(JSON.parse(raw)); } catch {}
  }, []);

  // Execute pending nav once locations are available
  useEffect(() => {
    if (!pendingNav || activeLocations.length === 0) return;
    const loc = activeLocations.find((l) => l.id === pendingNav.id);
    if (loc) {
      handleNavigateInApp(loc, pendingNav.mode);
      setPendingNav(null);
    }
  }, [pendingNav, activeLocations]); // eslint-disable-line react-hooks/exhaustive-deps

  // Immediately trigger the native GPS permission prompt on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }
    getCurrentPosition()
      .then((pos) => {
        setUserPosition(pos);
        setLocationPermission("granted");
      })
      .catch(() => {
        setLocationPermission("denied");
      });
  }, []);

  function showToast(message: string, type: ToastType) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const handleCheckIn = useCallback(
    async (location: Location) => {
      if (checkingId) return;
      setCheckingId(location.id);

      try {
        const pos = await getCurrentPosition();
        setUserPosition(pos);

        const dist = getDistanceMeters(pos.lat, pos.lng, location.lat, location.lng);
        setDistances((prev) => ({ ...prev, [location.id]: dist }));

        if (isUserNearLocation(pos.lat, pos.lng, location.lat, location.lng)) {
          if (hasCollected(location.reward)) {
            // Already collected — open detail view directly
            setDiscoveredLoc(location);
          } else {
            collect(location.reward);
            // Open the detail view immediately on new discovery
            setDiscoveredLoc(location);
          }
        } else {
          showToast(`You are ${dist}m away. Get within 50m to unlock!`, "error");
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Location check failed.", "error");
      } finally {
        setCheckingId(null);
      }
    },
    [checkingId, collect, hasCollected]
  );

  function handleNavigateInApp(loc: Location, mode: "foot" | "car") {
    setNavMode(mode);
    setNavTarget(loc);
    setShowList(false);
    setDiscoveredLoc(null); // close detail overlay so the map is visible
  }

  const handleLocateMe = async () => {
    try {
      const pos = await getCurrentPosition();
      setUserPosition(pos);
      setLocationPermission("granted");
      showToast("Location found!", "info");
    } catch (err) {
      setLocationPermission("denied");
      showToast(err instanceof Error ? err.message : "Could not get location.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-[#07040D] relative overflow-hidden">
        {/* Header */}
        <div className="flex-none z-20 bg-[#0E0B1A]/95 backdrop-blur-xl border-b border-white/[0.05] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/icons/logo.png" alt="Saraya Explore" className="w-[44px] h-[44px] object-contain" />
            <div>
              <h1 className="text-white font-bold text-[15px] leading-none">Sarajevo</h1>
              <p className="text-white/35 text-[11px] mt-0.5">
                {collectedItems.length}/{activeLocations.length} {t("lbl_collected")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLocateMe}
              title="Locate me"
              className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-purple-400 hover:border-purple-500/30 transition-all"
            >
              {/* Navigation arrow - my location */}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22l10-5 10 5L12 2z"/>
              </svg>
            </button>
            <div className="flex bg-white/[0.05] rounded-xl border border-white/[0.06] p-0.5">
              <button
                onClick={() => setShowList(false)}
                className={`px-3 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all duration-200 ${
                  !showList ? "bg-purple-500 text-gray-950" : "text-white/40 hover:text-white/60"
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setShowList(true)}
                className={`px-3 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all duration-200 ${
                  showList ? "bg-purple-500 text-gray-950" : "text-white/40 hover:text-white/60"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Location permission denied — device-specific instructions */}
        {locationPermission === "denied" && (
          <div className="flex-none z-20 bg-[#0E0B1A] border-b border-red-500/[0.12] px-4 py-4 overflow-y-auto max-h-60">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📵</span>
              <h2 className="text-white font-semibold text-[13px]">{t("lbl_gps_blocked")}</h2>
              <button
                onClick={() => window.location.reload()}
                className="ml-auto flex-shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors"
              >
                {t("btn_reload")}
              </button>
            </div>

            {/* iOS instructions */}
            {(deviceType === "ios" || deviceType === "unknown") && (
              <div className="mb-3">
                {deviceType === "unknown" && (
                  <p className="text-purple-400 text-xs font-semibold mb-1">🍎 iPhone / iPad</p>
                )}
                <ol className="text-gray-300 text-xs space-y-1 list-none">
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">1.</span> Open <strong>Settings</strong> on your phone</li>
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">2.</span> Scroll down → tap <strong>Chrome</strong> (or Safari)</li>
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">3.</span> Tap <strong>Location</strong> → select <strong>While Using</strong></li>
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">4.</span> Come back here and tap <strong>Reload</strong> above</li>
                </ol>
              </div>
            )}

            {deviceType === "unknown" && (
              <div className="border-t border-gray-700 my-2" />
            )}

            {/* Android instructions */}
            {(deviceType === "android" || deviceType === "unknown") && (
              <div>
                {deviceType === "unknown" && (
                  <p className="text-green-400 text-xs font-semibold mb-1">🤖 Android</p>
                )}
                <ol className="text-gray-300 text-xs space-y-1 list-none">
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">1.</span> Tap the <strong>🔒 lock icon</strong> in the address bar</li>
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">2.</span> Tap <strong>Permissions</strong> → <strong>Location</strong></li>
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">3.</span> Select <strong>Allow</strong></li>
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">4.</span> Tap <strong>Reload</strong> above</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Map */}
        {!showList && (
          <div className="flex-1 relative z-10">
            <MapView
              locations={activeLocations}
              collectedItems={collectedItems}
              userPosition={userPosition}
              onMarkerClick={handleCheckIn}
              navTarget={navTarget}
              navMode={navMode}
              onNavModeChange={(m) => setNavMode(m)}
              onClearNav={() => setNavTarget(null)}
              mapTheme={mapTheme}
            />
          </div>
        )}

        {/* Location List */}
        {showList && (
          <div className="flex-1 overflow-y-auto bg-[#07040D] px-4 pt-4 pb-28 space-y-3">
            {activeLocations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                collected={hasCollected(loc.reward)}
                distance={distances[loc.id] ?? null}
                onCheckIn={() => handleCheckIn(loc)}
                checking={checkingId === loc.id}
                onNavigate={handleNavigateInApp}
              />
            ))}
          </div>
        )}

        {/* Toast notification */}
        {toast && (
          <div className="fixed top-16 left-4 right-4 z-50 flex justify-center pointer-events-none anim-fade-down">
            <div
              className={`px-4 py-3 rounded-2xl text-[13px] font-medium shadow-2xl border pointer-events-auto max-w-xs w-full backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-green-950/90 text-green-300 border-green-700/40"
                  : toast.type === "error"
                  ? "bg-red-950/90 text-red-300 border-red-700/40"
                  : "bg-[#0E0B1A]/95 text-white/75 border-white/[0.08]"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        <Navbar />
      </div>

      {/* Landmark detail overlay — opens immediately on check-in */}
      {discoveredLoc && (
        <LandmarkDetail
          loc={discoveredLoc}
          onClose={() => setDiscoveredLoc(null)}
          backLabel="Map"
          isNew={!collectedItems.includes(discoveredLoc.reward)}
          onNavigate={handleNavigateInApp}
        />
      )}

      {/* Language picker — shown before onboarding on first ever launch */}
      {showLangPicker && (
        <LanguagePickerOverlay
          onDone={() => {
            setShowLangPicker(false);
            if (!localStorage.getItem("saraya_onboarded")) {
              setShowOnboarding(true);
            }
          }}
        />
      )}

      {/* First-time onboarding overlay */}
      {showOnboarding && (
        <OnboardingOverlay
          locationCount={activeLocations.length}
          onDone={() => {
            localStorage.setItem("saraya_onboarded", "1");
            setShowOnboarding(false);
          }}
        />
      )}
    </ProtectedRoute>
  );
}

