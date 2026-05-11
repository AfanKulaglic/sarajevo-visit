"use client";

import { useState } from "react";
import { Location } from "@/lib/locations";
import { useLanguage } from "@/context/LanguageContext";

const NavigateIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);

function NavMenu({ loc, onClose, onNavigate }: { loc: Location; onClose: () => void; onNavigate?: (loc: Location, mode: "foot" | "car") => void }) {
  const { t, getLocContent } = useLanguage();
  const displayName = getLocContent(loc).name;
  const [mode, setMode] = useState<"foot" | "car">("foot");

  function openGoogle() {
    const travelmode = mode === "car" ? "driving" : "walking";
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&travelmode=${travelmode}`,
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
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm mx-3 mb-6 rounded-3xl overflow-hidden"
        style={{
          background: "rgba(14,11,26,0.98)",
          border: "1px solid rgba(168,85,247,0.22)",
          backdropFilter: "blur(32px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(168,85,247,0.08)",
          animation: "slideUp 0.28s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.18em] px-5 pt-5 pb-3">
          {t("nav_navigate_to")} {displayName}
        </p>

        {/* Travel mode toggle */}
        <div className="px-5 pb-4">
          <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <button
              onClick={() => setMode("foot")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200"
              style={mode === "foot" ? { background: "rgba(168,85,247,0.22)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.35)" } : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1.5"/><path d="M9 20l1-5 2 2 1-2 1 5"/><path d="M6.5 14.5S8 12 12 12s5.5 2.5 5.5 2.5"/>
              </svg>
              Walking
            </button>
            <button
              onClick={() => setMode("car")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200"
              style={mode === "car" ? { background: "rgba(48,128,255,0.2)", color: "#60a5fa", border: "1px solid rgba(48,128,255,0.35)" } : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h10l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
              </svg>
              Driving
            </button>
          </div>
        </div>

        <button
          onClick={openGoogle}
          className="w-full flex items-center gap-4 px-5 py-4 text-left active:bg-white/[0.04] transition-colors"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.18)" }}
          >
            <span className="text-[22px] leading-none">🗺️</span>
          </div>
          <div>
            <p className="text-white text-[15px] font-semibold">{t("nav_google_maps")}</p>
            <p className="text-white/40 text-[12px] mt-0.5">{mode === "car" ? "Open in Google Maps (driving)" : "Open in Google Maps (walking)"}</p>
          </div>
        </button>
        <div className="h-px bg-white/[0.05] mx-5" />
        <button
          onClick={openNative}
          className="w-full flex items-center gap-4 px-5 py-4 text-left active:bg-white/[0.04] transition-colors"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.18)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-[15px] font-semibold">{t("nav_show_on_map")}</p>
            <p className="text-white/40 text-[12px] mt-0.5">{mode === "car" ? "Show route on app map (driving)" : "Show route on app map (walking)"}</p>
          </div>
        </button>
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl text-[14px] font-semibold text-white/50 transition-colors active:bg-white/[0.04]"
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
                <><span className="spinner" style={{ borderTopColor: "rgba(255,255,255,0.4)", width: 14, height: 14 }} /> {t("btn_checking")}</>
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
