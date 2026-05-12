"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Location } from "@/lib/locations";
import { type LangCode, translate } from "@/lib/i18n";
import { getLocationContent, subscribeLocationTranslations, type LocTranslationOverrides } from "@/lib/locationTranslations";

const ObjModelViewer = dynamic(() => import("@/components/ObjModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500/40 border-t-purple-500 animate-spin" />
    </div>
  ),
});

const GlbModelViewer = dynamic(() => import("@/components/GlbModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500/40 border-t-purple-500 animate-spin" />
    </div>
  ),
});

export default function AdminPreviewPage() {
  const [loc, setLoc] = useState<Location | null>(null);
  const [lang, setLang] = useState<LangCode>("en");
  const [locTransOverrides, setLocTransOverrides] = useState<LocTranslationOverrides>({});

  useEffect(() => {
    return subscribeLocationTranslations(setLocTransOverrides);
  }, []);

  useEffect(() => {
    // Tell parent frame we are ready to receive data
    try {
      window.parent.postMessage({ type: "preview_ready" }, window.location.origin);
    } catch {
      // cross-origin guard (shouldn't happen in same-origin admin)
    }

    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "admin_preview") return;
      if (e.data.loc) setLoc(e.data.loc as Location);
      if (e.data.lang) setLang(e.data.lang as LangCode);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function t(key: Parameters<typeof translate>[1]) {
    return translate(lang, key);
  }

  if (!loc) {
    return (
      <div
        className="h-screen bg-[#07040D] flex flex-col items-center justify-center gap-4"
        style={{ direction: "ltr" }}
      >
        <div className="text-5xl opacity-20">📱</div>
        <p className="text-white/20 text-[11px] text-center px-10 leading-relaxed">
          Open a location in Edit mode to see a live preview here
        </p>
      </div>
    );
  }

  const content = getLocationContent(loc.id, lang, loc, locTransOverrides);
  const hasGlb = !!loc.modelGlb;
  const hasObjModel = !!(loc.modelObj && loc.modelMtl);
  const hasSketchfab = !!loc.modelUrl;
  const isRtl = lang === "ar";
  const imageList = Array.isArray(loc.images) ? loc.images : [];

  return (
    <div
      className="h-screen bg-[#07040D] overflow-hidden flex flex-col"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* ── Model / hero area ─────────────────────────────────────────── */}
      <div className="relative flex-none" style={{ height: "42%" }}>
        {hasGlb ? (
          <GlbModelViewer glbUrl={loc.modelGlb!} emoji={loc.emoji} icon={loc.icon} className="w-full h-full" />
        ) : hasObjModel ? (
          <ObjModelViewer objUrl={loc.modelObj!} mtlUrl={loc.modelMtl!} emoji={loc.emoji} icon={loc.icon} />
        ) : hasSketchfab ? (
          <iframe
            src={loc.modelUrl}
            title={content.name}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        ) : (
          /* Emoji fallback */
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.16) 0%, rgba(88,28,135,0.07) 45%, #07040D 80%)",
            }}
          >
            {[160, 224, 288, 384].map((s) => (
              <div
                key={s}
                className="absolute rounded-full border border-purple-500/[0.07] pointer-events-none"
                style={{ width: s, height: s }}
              />
            ))}
            <span
              className="relative text-[80px] select-none"
              style={{
                filter: "drop-shadow(0 0 60px rgba(168,85,247,0.45))",
                transform: "translateY(-8px)",
              }}
            >
              {loc.icon
                ? <img src={loc.icon} alt={loc.name} className="w-32 h-32 object-contain" />
                : loc.emoji}
            </span>
            <p className="absolute bottom-5 text-white/[0.18] text-[9px] font-bold tracking-[0.22em] uppercase">
              {t("lbl_model_coming_soon")}
            </p>
          </div>
        )}

        {/* Top gradient overlay */}
        <div
          className="absolute top-0 inset-x-0 h-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7,4,13,0.75) 0%, transparent 100%)",
          }}
        />

        {/* Mock back button */}
        <div
          className="absolute top-3 flex items-center pointer-events-none"
          style={{ [isRtl ? "right" : "left"]: 12 }}
        >
          <div className="w-7 h-7 rounded-full bg-black/50 border border-white/[0.10] flex items-center justify-center">
            <svg
              width="11"
              height="11"
              viewBox="0 0 14 14"
              fill="none"
              style={{ transform: isRtl ? "scaleX(-1)" : "none" }}
            >
              <path
                d="M9 2L4 7l5 5"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Done badge */}
        <div
          className="absolute top-3 pointer-events-none"
          style={{ [isRtl ? "left" : "right"]: 12 }}
        >
          <span className="text-[9px] font-bold text-green-400 bg-black/50 border border-green-500/[0.18] px-2 py-0.5 rounded-full tracking-wider">
            {t("lbl_done")}
          </span>
        </div>
      </div>

      {/* ── Info sheet ────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-3 pb-6"
        style={{
          background:
            "linear-gradient(175deg, rgba(14,11,26,0.99) 0%, rgba(7,4,13,1) 100%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "22px 22px 0 0",
          marginTop: -6,
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-3">
          <div className="w-8 h-[3px] rounded-full bg-white/[0.14]" />
        </div>

        <h1 className="text-[21px] font-bold text-white tracking-tight leading-tight">
          {content.name}
        </h1>
        <p className="text-purple-500/55 text-[11.5px] mt-1 mb-3 leading-relaxed">
          {content.description}
        </p>

        {/* Section divider */}
        <div className="flex items-center gap-2 my-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[9px] font-bold text-white/[0.18] uppercase tracking-[0.18em]">
            {t("lbl_historical_record")}
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        <p className="text-white/45 text-[11.5px] leading-[1.85] font-light">
          {content.story || t("lbl_story_coming_soon")}
        </p>

        {/* Photos */}
        {imageList.length > 0 && (
          <>
            <div className="flex items-center gap-2 mt-5 mb-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[9px] font-bold text-white/[0.18] uppercase tracking-[0.18em]">
                {t("lbl_photos")}
              </span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imageList.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="h-[72px] w-[100px] rounded-xl object-cover flex-shrink-0 bg-white/[0.04]"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

