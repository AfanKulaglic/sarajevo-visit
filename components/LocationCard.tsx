"use client";

import { useState } from "react";
import { Location } from "@/lib/locations";
import { useLanguage } from "@/context/LanguageContext";

const NavigateIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);

export function NavMenu({ loc, onClose, onNavigate }: { loc: Location; onClose: () => void; onNavigate?: (loc: Location, mode: "foot" | "car") => void }) {
  const { t, getLocContent } = useLanguage();
  const displayName = getLocContent(loc).name;
  const [mode, setMode] = useState<"foot" | "car">("foot");

  const accent = mode === "car" ? { color: "#60a5fa", bg: "rgba(48,128,255,0.15)", border: "rgba(48,128,255,0.3)", activeBg: "rgba(48,128,255,0.22)", activeBorder: "rgba(48,128,255,0.45)" }
                                : { color: "#c084fc", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.18)", activeBg: "rgba(168,85,247,0.22)", activeBorder: "rgba(168,85,247,0.45)" };

  function openGoogle() {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&travelmode=${mode === "car" ? "driving" : "walking"}`,
      "_blank", "noopener,noreferrer"
    );
    onClose();
  }

  function openNative() {
    onNavigate?.(loc, mode);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm mx-3 mb-6 rounded-3xl"
        style={{
          background: "#0E0B1A",
          border: `1px solid ${accent.activeBorder}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
          animation: "slideUp 0.28s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <p className="text-white font-bold text-[15px] truncate mb-0.5">{displayName}</p>
          <p className="text-white/35 text-[12px]">Choose travel mode and open directions</p>
        </div>

        {/* Mode toggle - full width, prominent */}
        <div className="px-4 pb-4">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-2">Travel Mode</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("foot")}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all duration-200"
              style={mode === "foot"
                ? { background: "rgba(168,85,247,0.18)", border: "2px solid rgba(168,85,247,0.55)", color: "#c084fc" }
                : { background: "rgba(255,255,255,0.04)", border: "2px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="4" r="2"/>
                <path d="M9 20l1.5-5 2 2 1.5-3 1.5 6"/>
                <path d="M6.5 13.5C7.5 11.5 9.5 10.5 12 10.5s4.5 1 5.5 3"/>
              </svg>
              <span className="text-[12px] font-bold">Walking</span>
              {mode === "foot" && <span className="text-[10px] font-semibold" style={{ color: "#c084fc" }}>~5 km/h</span>}
            </button>
            <button
              onClick={() => setMode("car")}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all duration-200"
              style={mode === "car"
                ? { background: "rgba(48,128,255,0.18)", border: "2px solid rgba(48,128,255,0.55)", color: "#60a5fa" }
                : { background: "rgba(255,255,255,0.04)", border: "2px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="11" width="22" height="7" rx="2"/>
                <path d="M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4"/>
                <circle cx="7" cy="18" r="1.5"/>
                <circle cx="17" cy="18" r="1.5"/>
              </svg>
              <span className="text-[12px] font-bold">Driving</span>
              {mode === "car" && <span className="text-[10px] font-semibold" style={{ color: "#60a5fa" }}>~30 km/h</span>}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Action: Google Maps */}
        <button
          onClick={openGoogle}
          className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-white/[0.04]"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
            <span className="text-[22px] leading-none">🗺️</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-[14px] font-semibold">{t("nav_google_maps")}</p>
            <p className="text-[12px] mt-0.5" style={{ color: accent.color }}>via {mode === "car" ? "driving" : "walking"} &mdash; opens Google Maps</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </button>

        {/* Divider */}
        <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Action: In-app map */}
        <button
          onClick={openNative}
          className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-white/[0.04]"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white text-[14px] font-semibold">{t("nav_show_on_map")}</p>
            <p className="text-[12px] mt-0.5" style={{ color: accent.color }}>via {mode === "car" ? "driving" : "walking"} &mdash; route on this map</p>
          </div>
        </button>

        {/* Cancel */}
        <div className="px-4 pt-1 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl text-[14px] font-semibold text-white/40"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {t("btn_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface LocationCardProps {
  location: Location;
  collected: boolean;
  distance: number | null;
  onCheckIn: () => void;
  checking: boolean;
  onNavigate?: (loc: Location, mode: "foot" | "car") => void;
}

export default function LocationCard({
  location,
  collected,
  distance,
  onCheckIn,
  checking,
  onNavigate,
}: LocationCardProps) {
  const { t, lang, getLocContent } = useLanguage();
  const [showNavMenu, setShowNavMenu] = useState(false);
  const locContent = getLocContent(location);
  const withinRange = distance !== null && distance <= 50;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        collected
          ? "bg-[#0E0B1A] border-purple-500/[0.18]"
          : "bg-[#0E0B1A] border-white/[0.06]"
      }`}
    >
      {collected && (
        <div className="h-px bg-gradient-to-r from-purple-500/50 via-purple-400/20 to-transparent" />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Emoji badge */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden ${
              collected
                ? "bg-purple-500/[0.08] border border-purple-500/[0.15]"
                : "bg-white/[0.03] border border-white/[0.06]"
            }`}
          >
            {location.icon
              ? <img src={location.icon} alt={location.name} className="w-full h-full object-contain p-1" />
              : location.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-white font-semibold text-sm truncate">{locContent.name}</h3>
              {collected ? (
                <span className="flex-shrink-0 text-[10px] font-bold text-green-400 bg-green-500/[0.07] border border-green-500/[0.15] px-2 py-0.5 rounded-full">
                  {t("lbl_done")}
                </span>
              ) : distance !== null ? (
                <span
                  className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    withinRange
                      ? "text-green-400 bg-green-500/[0.07] border border-green-500/[0.15]"
                      : "text-white/35 bg-white/[0.04] border border-white/[0.07]"
                  }`}
                >
                  {withinRange ? t("lbl_in_range") : `${distance}m`}
                </span>
              ) : null}
            </div>

            <p className="text-white/35 text-[12px] mt-0.5 line-clamp-2 leading-relaxed">
              {locContent.description}
            </p>
          </div>
        </div>

        {!collected && (
          <div className="mt-3.5 flex gap-2">
            {showNavMenu && (
              <NavMenu loc={location} onClose={() => setShowNavMenu(false)} onNavigate={onNavigate} />
            )}
            <button
              onClick={() => setShowNavMenu((v) => !v)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-purple-300 transition-all duration-200 flex-shrink-0"
              style={{
                background: "rgba(168,85,247,0.09)",
                border: showNavMenu ? "1px solid rgba(168,85,247,0.45)" : "1px solid rgba(168,85,247,0.20)",
              }}
              aria-label="Navigate to landmark"
            >
              <NavigateIcon />
              {t("btn_navigate")}
            </button>
            <button
              onClick={onCheckIn}
              disabled={checking}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                checking
                  ? "bg-white/[0.04] text-white/25 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500 text-white"
              }`}
            >
              {checking ? (
                <><span className="spinner" style={{ width: 14, height: 14 }} /> {t("btn_checking")}</>
              ) : (
                t("btn_checkin")
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

