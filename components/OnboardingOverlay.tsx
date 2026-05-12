"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  locationCount: number;
  onDone: () => void;
}

const SLIDE_COUNT = 3;

export default function OnboardingOverlay({ locationCount, onDone }: Props) {
  const { t } = useLanguage();
  const [slide, setSlide] = useState(0);

  const isLast = slide === SLIDE_COUNT - 1;

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

        {/* Slide 2 — Ready */}
        {slide === 2 && (
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

