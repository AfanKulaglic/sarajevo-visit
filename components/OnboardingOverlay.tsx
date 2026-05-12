"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  locationCount: number;
  onDone: () => void;
}

const SLIDE_COUNT = 4;

// ── Inline map preview thumbnails ─────────────────────────────────────────────

function DarkMapPreview() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#1a1625", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
      {/* Water */}
      <div style={{ position: "absolute", top: "38%", left: 0, right: 0, height: "12%", background: "#0f0d1a" }} />
      {/* Roads */}
      <div style={{ position: "absolute", top: "20%", left: "45%", width: "3px", height: "65%", background: "#2d2540", borderRadius: "2px" }} />
      <div style={{ position: "absolute", top: "20%", left: "62%", width: "2px", height: "65%", background: "#2d2540", borderRadius: "2px" }} />
      <div style={{ position: "absolute", top: "30%", left: "10%", right: "10%", height: "2px", background: "#2d2540", borderRadius: "2px" }} />
      <div style={{ position: "absolute", top: "55%", left: "10%", right: "10%", height: "2px", background: "#2d2540", borderRadius: "2px" }} />
      {/* Buildings */}
      {[
        { top: "12%", left: "8%", w: "14%", h: "14%", opacity: 0.7 },
        { top: "12%", left: "26%", w: "12%", h: "10%", opacity: 0.6 },
        { top: "12%", left: "68%", w: "16%", h: "12%", opacity: 0.65 },
        { top: "62%", left: "8%", w: "10%", h: "12%", opacity: 0.6 },
        { top: "62%", left: "22%", w: "16%", h: "10%", opacity: 0.55 },
        { top: "65%", left: "52%", w: "12%", h: "10%", opacity: 0.6 },
        { top: "65%", left: "68%", w: "18%", h: "14%", opacity: 0.7 },
      ].map((b, i) => (
        <div key={i} style={{ position: "absolute", top: b.top, left: b.left, width: b.w, height: b.h, background: `rgba(60,45,90,${b.opacity})`, borderRadius: "3px" }} />
      ))}
      {/* Purple route line */}
      <div style={{ position: "absolute", top: "44%", left: "15%", right: "20%", height: "3px", background: "rgba(168,85,247,0.7)", borderRadius: "2px", boxShadow: "0 0 8px rgba(168,85,247,0.5)" }} />
      {/* Dot markers */}
      <div style={{ position: "absolute", top: "40%", left: "14%", width: "8px", height: "8px", borderRadius: "50%", background: "#8b5cf6", boxShadow: "0 0 6px rgba(139,92,246,0.8)" }} />
      <div style={{ position: "absolute", top: "40%", right: "19%", width: "8px", height: "8px", borderRadius: "50%", background: "#c084fc", boxShadow: "0 0 6px rgba(192,132,252,0.8)" }} />
    </div>
  );
}

function LightMapPreview() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#e8e4dc", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
      {/* Water */}
      <div style={{ position: "absolute", top: "38%", left: 0, right: 0, height: "12%", background: "#b8d4e8" }} />
      {/* Roads */}
      <div style={{ position: "absolute", top: "20%", left: "45%", width: "4px", height: "65%", background: "#ffffff", borderRadius: "2px" }} />
      <div style={{ position: "absolute", top: "20%", left: "62%", width: "3px", height: "65%", background: "#ffffff", borderRadius: "2px" }} />
      <div style={{ position: "absolute", top: "30%", left: "10%", right: "10%", height: "3px", background: "#ffffff", borderRadius: "2px" }} />
      <div style={{ position: "absolute", top: "55%", left: "10%", right: "10%", height: "3px", background: "#ffffff", borderRadius: "2px" }} />
      {/* Buildings */}
      {[
        { top: "12%", left: "8%", w: "14%", h: "14%", c: "#c9c5bc" },
        { top: "12%", left: "26%", w: "12%", h: "10%", c: "#cdc9c0" },
        { top: "12%", left: "68%", w: "16%", h: "12%", c: "#c4c0b8" },
        { top: "62%", left: "8%", w: "10%", h: "12%", c: "#cac6be" },
        { top: "62%", left: "22%", w: "16%", h: "10%", c: "#c6c2ba" },
        { top: "65%", left: "52%", w: "12%", h: "10%", c: "#ccc8c0" },
        { top: "65%", left: "68%", w: "18%", h: "14%", c: "#c8c4bc" },
      ].map((b, i) => (
        <div key={i} style={{ position: "absolute", top: b.top, left: b.left, width: b.w, height: b.h, background: b.c, borderRadius: "3px", border: "1px solid rgba(0,0,0,0.06)" }} />
      ))}
      {/* Purple route line */}
      <div style={{ position: "absolute", top: "44%", left: "15%", right: "20%", height: "3px", background: "rgba(139,92,246,0.8)", borderRadius: "2px", boxShadow: "0 0 6px rgba(139,92,246,0.35)" }} />
      {/* Dot markers */}
      <div style={{ position: "absolute", top: "40%", left: "14%", width: "8px", height: "8px", borderRadius: "50%", background: "#7c3aed", boxShadow: "0 0 6px rgba(124,58,237,0.6)" }} />
      <div style={{ position: "absolute", top: "40%", right: "19%", width: "8px", height: "8px", borderRadius: "50%", background: "#9333ea", boxShadow: "0 0 6px rgba(147,51,234,0.6)" }} />
    </div>
  );
}

export default function OnboardingOverlay({ locationCount, onDone }: Props) {
  const { t } = useLanguage();
  const [slide, setSlide] = useState(0);
  const [mapTheme, setMapTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("saraya_map_theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  const isLast = slide === SLIDE_COUNT - 1;

  function selectTheme(theme: "dark" | "light") {
    setMapTheme(theme);
    localStorage.setItem("saraya_map_theme", theme);
    window.dispatchEvent(new CustomEvent("mapthemechange", { detail: theme }));
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col"
      style={{ background: "rgba(3,7,18,0.97)", backdropFilter: "blur(24px)" }}
    >
      {/* Skip */}
      {!isLast && (
        <button
          onClick={onDone}
          className="absolute top-5 right-5 text-[12px] text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-full border border-white/[0.06]"
        >
          {t("btn_skip")}
        </button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">

        {/* Slide 0 — Welcome */}
        {slide === 0 && (
          <>
            <div className="text-[72px] leading-none select-none" style={{ filter: "drop-shadow(0 0 40px rgba(168,85,247,0.40))" }}>
              🕌
            </div>
            <div>
              <p className="text-[11px] font-bold text-purple-500/60 uppercase tracking-[0.18em] mb-3">
                {t("onb_welcome_eyebrow")}
              </p>
              <h1
                className="text-[38px] font-bold text-white leading-[1.08] tracking-tight whitespace-pre-line"
                style={{ textShadow: "0 0 60px rgba(168,85,247,0.20)" }}
              >
                {t("onb_welcome_headline")}
              </h1>
            </div>
            <p className="text-white/40 text-[15px] leading-relaxed max-w-[280px]">
              {t("onb_welcome_body")}
            </p>
          </>
        )}

        {/* Slide 1 — How it works */}
        {slide === 1 && (
          <>
            <p className="text-[11px] font-bold text-purple-500/60 uppercase tracking-[0.18em]">
              {t("onb_how_eyebrow")}
            </p>
            <div className="w-full max-w-[320px] flex flex-col gap-4">
              {[
                { icon: "📍", label: t("onb_step1_label"), sub: t("onb_step1_sub") },
                { icon: "🔓", label: t("onb_step2_label"), sub: t("onb_step2_sub") },
                { icon: "🏛️", label: t("onb_step4_label"), sub: t("onb_step4_sub") },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl px-5 py-4 text-left"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-[28px] leading-none mt-0.5 flex-shrink-0">{step.icon}</span>
                  <div>
                    <p className="text-white text-[15px] font-semibold leading-snug">{step.label}</p>
                    <p className="text-white/35 text-[13px] mt-0.5 leading-snug">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Slide 2 — Map theme picker */}
        {slide === 2 && (
          <>
            <p className="text-[11px] font-bold text-purple-500/60 uppercase tracking-[0.18em]">
              {t("onb_map_eyebrow")}
            </p>
            <div className="w-full max-w-[320px] grid grid-cols-2 gap-3">
              {(["dark", "light"] as const).map((theme) => {
                const selected = mapTheme === theme;
                return (
                  <button
                    key={theme}
                    onClick={() => selectTheme(theme)}
                    style={{
                      background: selected ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                      border: selected ? "2px solid rgba(139,92,246,0.65)" : "2px solid rgba(255,255,255,0.07)",
                      borderRadius: "16px",
                      padding: "10px 10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      transition: "all 0.18s",
                      boxShadow: selected ? "0 0 20px rgba(139,92,246,0.18)" : "none",
                    }}
                  >
                    {/* Map preview */}
                    <div style={{ width: "100%", height: "110px", borderRadius: "10px", overflow: "hidden", border: selected ? "1.5px solid rgba(139,92,246,0.4)" : "1.5px solid rgba(255,255,255,0.07)" }}>
                      {theme === "dark" ? <DarkMapPreview /> : <LightMapPreview />}
                    </div>
                    {/* Label row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {selected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="rgba(139,92,246,0.9)" />
                          <path d="M7 12l3.5 3.5L17 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <span style={{ color: selected ? "#c084fc" : "rgba(255,255,255,0.45)", fontSize: "13px", fontWeight: 600 }}>
                        {theme === "dark" ? t("onb_map_dark") : t("onb_map_light")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Slide 3 — Ready */}
        {slide === 3 && (
          <>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-[32px]"
              style={{
                background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, rgba(168,85,247,0.04) 100%)",
                border: "1px solid rgba(168,85,247,0.30)",
                boxShadow: "0 0 48px rgba(168,85,247,0.18)",
              }}
            >
              ✦
            </div>
            <div>
              <p className="text-[11px] font-bold text-purple-500/60 uppercase tracking-[0.18em] mb-3">
                {t("onb_ready_eyebrow")}
              </p>
              <h2 className="text-[30px] font-bold text-white leading-tight">
                {locationCount} {t("onb_landmarks_await")}
              </h2>
            </div>
            <p className="text-white/35 text-[14px] leading-relaxed max-w-[260px]">
              {t("onb_ready_body")}
            </p>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="pb-10 px-8 flex flex-col items-center gap-5">
        {/* Dots */}
        <div className="flex gap-2">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 20 : 6,
                height: 6,
                background: i === slide ? "rgba(168,85,247,0.90)" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        {isLast ? (
          <button
            onClick={onDone}
            className="w-full max-w-[320px] py-4 rounded-2xl text-[15px] font-bold text-white transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              boxShadow: "0 4px 24px rgba(168,85,247,0.40)",
            }}
          >
            {t("onb_ready_cta")}
          </button>
        ) : (
          <button
            onClick={() => setSlide((p) => p + 1)}
            className="w-full max-w-[320px] py-4 rounded-2xl text-[15px] font-semibold text-white transition-all active:scale-[0.97]"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            {t("btn_next")}
          </button>
        )}
      </div>
    </div>
  );
}

