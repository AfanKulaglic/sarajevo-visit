"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LandmarkDetail from "@/components/LandmarkDetail";
import { locations as defaultLocations, Location } from "@/lib/locations";
import { subscribeLocations } from "@/lib/locationStorage";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";

// Dynamically import the WebGL viewer so it never runs on the server
const ObjModelViewer = dynamic(() => import("@/components/ObjModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-purple-500/40 border-t-purple-500 animate-spin" />
    </div>
  ),
});

// ── Mini model strip (list row thumbnail) ──────────────────────────────────────
// Uses emoji only — no WebGL Canvas per row (avoids context limit + crash)

function MiniModelStrip({ loc, collected }: { loc: Location; collected: boolean }) {
  if (collected && loc.icon) {
    return (
      <img
        src={loc.icon}
        alt={loc.name}
        className="w-[34px] h-[34px] object-contain transition-all duration-200"
      />
    );
  }
  return (
    <div
      className={`w-10 h-10 transition-all duration-200 ${
        collected ? "" : "grayscale opacity-20"
      }`}
    >
      {collected
        ? (loc.icon
            ? <img src={loc.icon} alt={loc.name} className="w-full h-full object-contain" />
            : <span className="text-[30px]">{loc.emoji}</span>)
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white/40">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>}
    </div>
  );
}

// ── Collection page ────────────────────────────────────────────────────────────

export default function CollectionPage() {
  const { hasCollected, collectedItems } = useGame();
  const { t, lang, getLocContent } = useLanguage();
  const [activeLocations, setActiveLocations] = useState<Location[]>(defaultLocations);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);

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
                    background: "linear-gradient(90deg, #d97706, #f59e0b)",
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
              className="rounded-2xl border border-purple-700/[0.22] px-4 py-3.5 flex items-center gap-3.5"
              style={{
                background:
                  "linear-gradient(115deg, rgba(69,26,3,0.85) 0%, rgba(109,40,10,0.65) 100%)",
              }}
            >
              <div className="w-10 h-10 rounded-[12px] bg-purple-500/[0.10] border border-purple-600/20 flex items-center justify-center text-xl flex-shrink-0">
                🏆
              </div>
              <div>
                <p className="text-purple-200 font-semibold text-[13px] tracking-tight">
                  {t("lbl_complete_collection")}
                </p>
                <p className="text-purple-600/60 text-[11px] mt-0.5">
                  {t("lbl_complete_collection_sub")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Landmark list ── */}
        <div className="px-4 pt-4 pb-32 space-y-2">
          {activeLocations.map((loc, idx) => {
            const collected = hasCollected(loc.reward);
            const locContent = getLocContent(loc);
            return (
              <button
                key={loc.id}
                onClick={() => collected && setSelectedLoc(loc)}
                disabled={!collected}
                className={`w-full text-left rounded-2xl border overflow-hidden transition-all duration-200 group ${
                  collected
                    ? "bg-[#0E0B1A] border-white/[0.07] hover:border-purple-500/[0.15] active:scale-[0.99]"
                    : "bg-[#07090f] border-white/[0.04]"
                }`}
              >
                <div className="flex items-stretch" style={{ minHeight: 80 }}>
                  {/* Visual strip */}
                  <div
                    className={`w-[68px] flex-shrink-0 flex items-center justify-center relative ${
                      collected ? "bg-[#0f1520]" : "bg-[#050609]"
                    }`}
                  >
                    {/* Separator */}
                    <div
                      className={`absolute right-0 top-4 bottom-4 w-px ${
                        collected ? "bg-purple-500/[0.08]" : "bg-white/[0.03]"
                      }`}
                    />
                    <MiniModelStrip loc={loc} collected={collected} />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 px-4 py-3.5 flex flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className={`font-semibold text-[14px] tracking-tight leading-tight truncate ${
                          collected ? "text-white" : "text-white/22"
                        }`}
                      >
                        {locContent.name}
                      </span>
                      {collected ? (
                        <svg
                          className="text-white/18 group-hover:text-purple-500/40 transition-colors flex-shrink-0"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M5 2.5l4.5 4.5L5 11.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span className="text-[10px] font-bold text-white/12 flex-shrink-0 tabular-nums">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[12px] leading-snug line-clamp-2 ${
                        collected ? "text-white/32" : "text-white/12"
                      }`}
                    >
                      {locContent.description}
                    </p>
                    {collected && (
                      <p className="text-[10px] font-semibold text-purple-500/35 mt-1.5 tracking-[0.06em] uppercase">
                        {t("btn_read_story")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom accent for collected */}
                {collected && (
                  <div className="h-px bg-gradient-to-r from-purple-500/[0.15] via-purple-500/[0.06] to-transparent" />
                )}
              </button>
            );
          })}
        </div>

        <Navbar />
      </div>

      {/* Detail sheet */}
      {selectedLoc && (
        <LandmarkDetail loc={selectedLoc} onClose={() => setSelectedLoc(null)} />
      )}
    </ProtectedRoute>
  );
}

// ── Detail sheet ───────────────────────────────────────────────────────────────
