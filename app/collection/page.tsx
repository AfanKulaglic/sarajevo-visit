"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import LandmarkDetail from "@/components/LandmarkDetail";
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
  const [navSheetLoc, setNavSheetLoc] = useState<Location | null>(null);
  const [navSheetClosing, setNavSheetClosing] = useState(false);
  const navSheetClosingRef = useRef(false);

  function openNavSheet(loc: Location, e: React.MouseEvent) {
    e.stopPropagation();
    setNavSheetLoc(loc);
    setNavSheetClosing(false);
    navSheetClosingRef.current = false;
  }

  function closeNavSheet() {
    if (navSheetClosingRef.current) return;
    navSheetClosingRef.current = true;
    setNavSheetClosing(true);
    setTimeout(() => {
      setNavSheetLoc(null);
      setNavSheetClosing(false);
      navSheetClosingRef.current = false;
    }, 320);
  }

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
                    onClick={(e) => openNavSheet(loc, e)}
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

      {/* Nav mode picker sheet */}
      {navSheetLoc && (
        <div
          className="fixed inset-0 z-[90] flex flex-col justify-end"
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            animation: navSheetClosing ? "fadeOut 0.28s ease forwards" : "fadeIn 0.22s ease both",
          }}
          onClick={closeNavSheet}
        >
          <div
            className="w-full max-w-md mx-auto rounded-t-3xl px-5 pt-6 pb-10"
            style={{
              background: "#0E0B1A",
              border: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "none",
              animation: navSheetClosing
                ? "slideDown 0.32s cubic-bezier(0.4,0,1,1) forwards"
                : "slideUp 0.38s cubic-bezier(0.22,1,0.36,1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white font-semibold text-[15px] leading-tight">
                  {getLocContent(navSheetLoc).name}
                </p>
                <p className="text-white/35 text-[11px] mt-0.5">Choose how you want to get there</p>
              </div>
              <button
                onClick={closeNavSheet}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l10 10M12 2L2 12"/>
                </svg>
              </button>
            </div>

            {/* Mode buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => startNavigation(navSheetLoc, "foot")}
                className="flex flex-col items-center gap-3 py-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] active:scale-[0.97] transition-all hover:border-purple-500/30 hover:bg-purple-500/[0.06]"
              >
                <div className="w-11 h-11 rounded-2xl bg-purple-500/[0.14] border border-purple-500/20 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="1.5"/>
                    <path d="M10 9l-2 6h4l2 5M10 9l4 2 2-2M10 9l-1 4"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/85 font-semibold text-[13px]">Walk</p>
                  <p className="text-white/30 text-[10px] mt-0.5">On foot</p>
                </div>
              </button>

              <button
                onClick={() => startNavigation(navSheetLoc, "car")}
                className="flex flex-col items-center gap-3 py-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] active:scale-[0.97] transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.06]"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-500/[0.12] border border-blue-500/20 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 17H3a2 2 0 01-2-2v-4l2.5-5h13l2.5 5v4a2 2 0 01-2 2h-2"/>
                    <circle cx="7.5" cy="17.5" r="2.5"/>
                    <circle cx="16.5" cy="17.5" r="2.5"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/85 font-semibold text-[13px]">Drive</p>
                  <p className="text-white/30 text-[10px] mt-0.5">By car</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

