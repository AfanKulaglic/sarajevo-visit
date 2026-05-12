"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LandmarkDetail from "@/components/LandmarkDetail";
import { NavMenu } from "@/components/LocationCard";
import { locations as defaultLocations, Location } from "@/lib/locations";
import { subscribeLocations } from "@/lib/locationStorage";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";


// ── Collection page ────────────────────────────────────────────────────────────

export default function CollectionPage() {
  const router = useRouter();
  const { hasCollected, collectedItems } = useGame();
  const { t, lang, getLocContent } = useLanguage();
  const [activeLocations, setActiveLocations] = useState<Location[]>(defaultLocations);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [navMenuLoc, setNavMenuLoc] = useState<Location | null>(null);

  function startNavigation(loc: Location, mode: "foot" | "car") {
    localStorage.setItem("saraya_pending_nav", JSON.stringify({ id: loc.id, mode }));
    router.push("/map");
  }

  useEffect(() => {
    return subscribeLocations((locs) => setActiveLocations(locs));
  }, []);

  const total = activeLocations.length;
  const count = collectedItems.length;
  const pct = total > 0 ? (count / total) * 100 : 0;
  const allDone = count === total && total > 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#07040D]">

        {/* ── Header ── */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.055) 0%, transparent 65%)",
            }}
          />
          <div className="relative px-5 pt-14 pb-7">
            <p className="text-[10px] font-bold text-white/18 uppercase tracking-[0.22em] mb-4">
              Sarajevo
            </p>
            <h1 className="text-[36px] font-bold text-white tracking-tight leading-none">
              {t("lbl_your_collection")}
            </h1>
            <p className="text-white/28 text-[13px] mt-2.5 leading-relaxed">
              {count === 0
                ? t("lbl_visit_to_unlock")
                : allDone
                ? t("lbl_all_discovered")
                : `${total - count} ${t("lbl_landmarks_remaining")}`}
            </p>

            {/* Progress row */}
            <div className="flex items-center gap-3.5 mt-5">
              <div className="flex-1 h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                  }}
                />
              </div>
              <span className="text-[12px] font-semibold text-white/35 tabular-nums flex-shrink-0">
                {count}
                <span className="text-white/18 font-light"> / {total}</span>
              </span>
            </div>
          </div>

          {/* Header bottom border */}
          <div className="h-px bg-white/[0.04] mx-0" />
        </div>

        {/* ── Completion banner ── */}
        {allDone && (
          <div className="mx-4 mt-4 anim-fade-in">
            <div
              className="rounded-2xl border border-purple-500/[0.30] px-4 py-3.5 flex items-center gap-3.5"
              style={{
                background:
                  "linear-gradient(115deg, rgba(59,7,100,0.7) 0%, rgba(88,28,135,0.45) 100%)",
              }}
            >
              <div className="w-10 h-10 rounded-[12px] bg-purple-500/[0.18] border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              </div>
              <div>
                <p className="text-purple-200 font-semibold text-[13px] tracking-tight">
                  {t("lbl_complete_collection")}
                </p>
                <p className="text-purple-300/55 text-[11px] mt-0.5">
                  {t("lbl_complete_collection_sub")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Landmark grid ── */}
        <div className="px-4 pt-4 pb-32 grid grid-cols-2 gap-3">
          {activeLocations.map((loc, idx) => {
            const collected = hasCollected(loc.reward);
            const locContent = getLocContent(loc);
            return (
              <div
                key={loc.id}
                className={`relative rounded-2xl overflow-hidden border flex flex-col transition-all duration-200 ${
                  collected
                    ? "border-purple-500/[0.15]"
                    : "border-white/[0.05]"
                }`}
                style={{ background: "#0E0B1A" }}
              >
                {/* Image section */}
                <button
                  onClick={() => collected && setSelectedLoc(loc)}
                  disabled={!collected}
                  className="relative w-full flex-shrink-0 flex items-center justify-center"
                  style={{ height: 120 }}
                >
                  {loc.icon && (
                    <img
                      src={loc.icon}
                      alt={locContent.name}
                      draggable={false}
                      className="w-full h-full object-contain p-4 select-none"
                      style={
                        collected
                          ? { opacity: 1 }
                          : { filter: "brightness(0) invert(1)", opacity: 0.2 }
                      }
                    />
                  )}
                  {/* Number badge */}
                  <div className="absolute top-2 right-2.5">
                    <span className={`text-[9px] font-bold tabular-nums tracking-wider ${
                      collected ? "text-purple-400/40" : "text-white/12"
                    }`}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                </button>

                {/* Divider */}
                <div className={`h-px mx-0 ${collected ? "bg-purple-500/[0.08]" : "bg-white/[0.04]"}`} />

                {/* Text + navigate */}
                <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3">
                  <p className={`text-[12px] font-semibold leading-tight ${
                    collected ? "text-white/90" : "text-white/22"
                  }`}>
                    {locContent.name}
                  </p>
                  <p className={`text-[10px] leading-snug line-clamp-2 mt-1 ${
                    collected ? "text-white/35" : "text-white/12"
                  }`}>
                    {locContent.description}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setNavMenuLoc(loc); }}
                    className="mt-auto pt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold tracking-wide transition-all active:scale-[0.97] bg-purple-500/[0.14] text-purple-300 border border-purple-500/[0.18]"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                    Navigate
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <Navbar />
      </div>

      {/* Detail sheet */}
      {selectedLoc && (
        <LandmarkDetail loc={selectedLoc} onClose={() => setSelectedLoc(null)} />
      )}

      {/* Shared NavMenu — identical to map list */}
      {navMenuLoc && (
        <NavMenu
          loc={navMenuLoc}
          onClose={() => setNavMenuLoc(null)}
          onNavigate={(loc, mode) => { setNavMenuLoc(null); startNavigation(loc, mode); }}
        />
      )}
    </ProtectedRoute>
  );
}

