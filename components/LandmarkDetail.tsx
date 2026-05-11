"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { Location } from "@/lib/locations";
import { useLanguage } from "@/context/LanguageContext";

function NavMenu({ loc, onClose, onNavigate }: { loc: Location; onClose: () => void; onNavigate?: (loc: Location, mode: "foot" | "car") => void }) {
  const { t, getLocContent } = useLanguage();
  const displayName = getLocContent(loc).name;
  const [mode, setMode] = useState<"foot" | "car">("foot");

  const accent = mode === "car"
    ? { color: "#60a5fa", bg: "rgba(48,128,255,0.15)", border: "rgba(48,128,255,0.3)", activeBorder: "rgba(48,128,255,0.45)" }
    : { color: "#c084fc", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.18)", activeBorder: "rgba(168,85,247,0.45)" };

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


const ObjModelViewer = dynamic(() => import("@/components/ObjModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-purple-500/40 border-t-purple-500 animate-spin" />
    </div>
  ),
});

const GlbModelViewer = dynamic(() => import("@/components/GlbModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-purple-500/40 border-t-purple-500 animate-spin" />
    </div>
  ),
});

// ── Model viewer ──────────────────────────────────────────────────────────────

function ModelViewer({ loc }: { loc: Location }) {
  const { t } = useLanguage();

  // Prefer Draco-compressed GLB (smallest, fastest)
  if (loc.modelGlb) {
    return (
      <GlbModelViewer
        glbUrl={loc.modelGlb}
        emoji={loc.emoji}
        icon={loc.icon}
        className="w-full h-full"
      />
    );
  }

  // Legacy OBJ fallback
  if (loc.modelObj && loc.modelMtl) {
    return (
      <ObjModelViewer
        objUrl={loc.modelObj}
        mtlUrl={loc.modelMtl}
        emoji={loc.emoji}        icon={loc.icon}        className="w-full h-full"
      />
    );
  }

  const url = loc.modelUrl?.trim();
  if (url && url.includes("sketchfab.com")) {
    return (
      <iframe
        src={url}
        title={loc.name}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{
        background:
      "radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.14) 0%, rgba(88,28,135,0.06) 45%, #07040D 80%)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-40 h-40 rounded-full border border-purple-500/[0.07]" />
        <div className="absolute w-56 h-56 rounded-full border border-purple-500/[0.04]" />
        <div className="absolute w-72 h-72 rounded-full border border-purple-500/[0.02]" />
        <div className="absolute w-96 h-96 rounded-full border border-purple-500/[0.01]" />
      </div>
      <span
        className="relative select-none text-[100px]"
        style={{
          filter: "drop-shadow(0 0 80px rgba(168,85,247,0.40)) drop-shadow(0 0 24px rgba(168,85,247,0.22))",
          transform: "translateY(-6px)",
        }}
      >
        {loc.icon
          ? <img src={loc.icon} alt={loc.name} className="w-44 h-44 object-contain" />
          : loc.emoji}
      </span>
      <p className="absolute bottom-10 text-white/18 text-[10px] font-bold tracking-[0.2em] uppercase">
        {t("lbl_model_coming_soon")}
      </p>
    </div>
  );
}

// ── Exported detail overlay ───────────────────────────────────────────────────

interface LandmarkDetailProps {
  loc: Location;
  onClose: () => void;
  /** Label shown next to the back arrow. Default: "Collection" */
  backLabel?: string;
  /** Show a "NEW DISCOVERY" badge instead of "DISCOVERED". Default: false */
  isNew?: boolean;
  onNavigate?: (loc: Location, mode: "foot" | "car") => void;
}

export default function LandmarkDetail({
  loc,
  onClose,
  backLabel = "Collection",
  isNew = false,
  onNavigate,
}: LandmarkDetailProps) {
  const { t, lang, getLocContent } = useLanguage();
  const [showNavMenu, setShowNavMenu] = useState(false);
  const locContent = getLocContent(loc);
  const [sheetState, setSheetState] = useState<"peek" | "half" | "full">("half");
  const dragStartY = useRef<number>(0);
  const dragStartState = useRef<"peek" | "half" | "full">("half");

  function onHandlePointerDown(e: React.PointerEvent) {
    dragStartY.current = e.clientY;
    dragStartState.current = sheetState;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onHandlePointerUp(e: React.PointerEvent) {
    const delta = e.clientY - dragStartY.current;
    const cur = dragStartState.current;
    if (Math.abs(delta) < 8) {
      // tap: cycle peek→half→full→half
      setSheetState(cur === "peek" ? "half" : cur === "half" ? "full" : "half");
    } else if (delta > 40) {
      // drag down
      setSheetState(cur === "full" ? "half" : "peek");
    } else if (delta < -40) {
      // drag up
      setSheetState(cur === "peek" ? "half" : "full");
    } else {
      setSheetState(cur);
    }
  }

  const SHEET_HEIGHT: Record<typeof sheetState, string> = {
    peek: "44px",
    half: "55dvh",
    full: "92dvh",
  };

  const modelHeight =
    sheetState === "peek"
      ? "100dvh"
      : sheetState === "half"
      ? "calc(45dvh + 44px)"
      : "8dvh";

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{ animation: "fadeIn 0.18s ease both", background: "#07040D" }}
    >
      {/* Model — shrinks to visible area above the sheet */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: modelHeight,
          transition: "height 0.38s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <ModelViewer loc={loc} />
      </div>

      {/* Top gradient + controls */}
      <div
        className="absolute top-0 inset-x-0 h-36 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(3,7,18,0.92) 0%, transparent 100%)" }}
      />

      {/* Back button */}
      <button
        onClick={onClose}
        className="absolute top-5 left-4 z-10 flex items-center gap-2.5 text-white/70 hover:text-white transition-colors"
        aria-label={`Back to ${backLabel}`}
      >
        <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-xl border border-white/[0.10] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[13px] font-medium">{backLabel}</span>
      </button>

      {/* Badge */}
      <div className="absolute top-6 right-4 z-10">
        {isNew ? (
          <span className="text-[10px] font-bold text-purple-300 bg-black/60 backdrop-blur-xl border border-purple-500/[0.30] px-2.5 py-1 rounded-full animate-pulse">
            {t("lbl_new_discovered")}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-green-400 bg-black/50 backdrop-blur-xl border border-green-500/[0.18] px-2.5 py-1 rounded-full">
            {t("lbl_discovered")}
          </span>
        )}
      </div>

      {/* Sliding info sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-[28px]"
        style={{
          height: SHEET_HEIGHT[sheetState],
          transition: "height 0.38s cubic-bezier(0.22,1,0.36,1)",
          background: "linear-gradient(175deg, rgba(14,11,26,0.98) 0%, rgba(7,4,13,0.99) 100%)",
          backdropFilter: "blur(48px) saturate(1.5)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Drag handle — tap to cycle, drag to slide */}
        <div
          className="flex flex-col items-center pt-3 pb-2 flex-shrink-0 cursor-pointer select-none"
          style={{ touchAction: "none", minHeight: 44 }}
          onPointerDown={onHandlePointerDown}
          onPointerUp={onHandlePointerUp}
        >
          <div className="w-9 h-[3px] rounded-full bg-white/[0.18]" />
          {sheetState === "peek" && (
            <svg className="mt-1.5 text-white/25" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          )}
          {sheetState === "full" && (
            <svg className="mt-1.5 text-white/25" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain px-5 pt-3 pb-14">
          {isNew && (
            <p className="text-[10px] font-bold text-purple-500/50 uppercase tracking-[0.18em] mb-2">
              {t("lbl_new_unlocked")}
            </p>
          )}

          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
            {locContent.name}
          </h1>
          <p className="text-purple-500/55 text-[13px] mt-1.5 mb-4 leading-relaxed">
            {locContent.description}
          </p>

          {/* Navigate button — only for undiscovered landmarks */}
          {isNew && (
            <div className="relative mb-5">
              {showNavMenu && (
                <NavMenu loc={loc} onClose={() => setShowNavMenu(false)} onNavigate={onNavigate} />
              )}
              <button
                onClick={() => setShowNavMenu((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-purple-300 transition-all active:scale-[0.97]"
                style={{
                  background: "rgba(168,85,247,0.09)",
                  border: showNavMenu ? "1px solid rgba(168,85,247,0.45)" : "1px solid rgba(168,85,247,0.22)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                {t("btn_navigate")}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 ml-0.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
          )}

          {loc.videoUrl && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-[10px] font-bold text-white/18 uppercase tracking-[0.18em]">{t("lbl_video")}</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="rounded-xl overflow-hidden mb-5 aspect-video bg-black/40">
                <iframe
                  src={loc.videoUrl}
                  title={`${loc.name} video`}
                  allow="autoplay; fullscreen"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] font-bold text-white/18 uppercase tracking-[0.18em]">{t("lbl_historical_record")}</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <p className="text-white/45 text-[14px] leading-[1.9] font-light">
            {locContent.story || t("lbl_story_coming_soon")}
          </p>

          {/* Photo gallery */}
          {loc.images && loc.images.length > 0 && (
            <>
              <div className="flex items-center gap-3 mt-7 mb-4">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-[10px] font-bold text-white/18 uppercase tracking-[0.18em]">{t("lbl_photos")}</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                {loc.images.map((url, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 snap-start rounded-2xl overflow-hidden border border-white/[0.07]"
                    style={{
                      width: loc.images!.length === 1 ? "100%" : "78vw",
                      maxWidth: 340,
                      aspectRatio: "4/3",
                      background: "#0E0B1A",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${loc.name} photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
              {loc.images.length > 1 && (
                <p className="text-[10px] text-white/20 text-center mt-2 tracking-wide">
                  {t("lbl_swipe_more")}
                </p>
              )}
            </>
          )}

          {(loc.modelObj || (loc.modelUrl && loc.modelUrl.includes("sketchfab.com"))) && (
            <p className="text-[10px] font-semibold text-purple-500/25 mt-6 tracking-[0.12em] uppercase text-center">
              {t("lbl_drag_rotate")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
