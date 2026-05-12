"use client";

import { useEffect, useState } from "react";
import { TRANSLATIONS, LangCode, TranslationKey } from "@/lib/i18n";

type T = Record<TranslationKey, string>;

function t(translations: T | null, key: TranslationKey): string {
  return translations?.[key] ?? TRANSLATIONS.en[key] ?? key;
}

export default function TranslationsPreviewPage() {
  const [lang, setLang] = useState<LangCode>("en");
  const [translations, setTranslations] = useState<T | null>(null);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "admin_trans_preview") {
        setLang(e.data.lang as LangCode);
        setTranslations(e.data.translations as T);
      }
    }
    window.addEventListener("message", onMsg);
    if (window.parent !== window) {
      window.parent.postMessage({ type: "trans_preview_ready" }, "*");
    }
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const isRtl = lang === "ar";
  const tr = (key: TranslationKey) => t(translations, key);

  return (
    <div
      className="bg-[#07040D] text-white min-h-full overflow-y-auto"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif", direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* ── Welcome screen ─────────────────────────────────────── */}
      <div className="px-6 pt-10 pb-8 border-b border-white/[0.06]">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-purple-500/[0.10] border border-purple-500/[0.18]">
          <span className="text-[9px] font-bold text-purple-300 uppercase tracking-[0.14em]">
            {tr("onb_welcome_eyebrow")}
          </span>
        </div>
        <h1
          className="text-white font-black leading-[1.12] mb-3 whitespace-pre-line"
          style={{ fontSize: 26 }}
        >
          {tr("onb_welcome_headline")}
        </h1>
        <p className="text-white/50 text-[13px] leading-relaxed mb-5">
          {tr("onb_welcome_body")}
        </p>
        <button className="w-full bg-purple-600 text-white text-sm font-bold py-3 rounded-2xl">
          {tr("btn_continue")}
        </button>
        <button className="w-full mt-2 text-white/30 text-xs py-2">
          {tr("btn_skip")}
        </button>
      </div>

      {/* ── How it works ────────────────────────────────────────── */}
      <div className="px-6 pt-7 pb-8 border-b border-white/[0.06]">
        <p className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-5">
          {tr("onb_how_eyebrow")}
        </p>
        <div className="space-y-5">
          {(["onb_step1", "onb_step2", "onb_step3", "onb_step4"] as const).map((step, i) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-300 text-[11px] font-bold">{i + 1}</span>
              </div>
              <div>
                <p className="text-white text-[13px] font-semibold leading-tight">
                  {tr(`${step}_label` as TranslationKey)}
                </p>
                <p className="text-white/40 text-[11px] mt-0.5">
                  {tr(`${step}_sub` as TranslationKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-6 bg-purple-600 text-white text-sm font-bold py-3 rounded-2xl">
          {tr("btn_next")}
        </button>
      </div>

      {/* ── Ready screen ────────────────────────────────────────── */}
      <div className="px-6 pt-7 pb-8 border-b border-white/[0.06]">
        <p className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
          {tr("onb_ready_eyebrow")}
        </p>
        <p className="text-white/55 text-[13px] leading-relaxed mb-5">
          {tr("onb_ready_body")}
        </p>
        <button className="w-full bg-purple-600 text-white text-sm font-bold py-3 rounded-2xl">
          {tr("onb_ready_cta")}
        </button>
        <p className="text-white/25 text-[11px] text-center mt-3">
          6 {tr("onb_landmarks_await")}
        </p>
      </div>

      {/* ── Map / nav bar labels ─────────────────────────────────── */}
      <div className="px-6 pt-7 pb-3 border-b border-white/[0.06]">
        <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.14em] mb-3">
          Navigation &amp; Map
        </p>
        {/* Fake nav bar */}
        <div
          className="rounded-2xl overflow-hidden border border-white/[0.08] mb-4"
          style={{ background: "rgba(18,12,30,0.97)" }}
        >
          <div className="flex">
            {(["nav_map", "nav_collection"] as TranslationKey[]).map((key) => (
              <div key={key} className="flex-1 py-3 text-center">
                <p className="text-white/60 text-[11px] font-semibold">{tr(key)}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Distance badges */}
        <div className="flex gap-2 mb-4">
          <span className="text-[10px] font-bold text-green-400 bg-green-400/[0.12] border border-green-400/20 rounded-full px-3 py-1">
            {tr("lbl_in_range")}
          </span>
          <span className="text-[10px] font-semibold text-white/45 bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1">
            {tr("lbl_nearby")}
          </span>
          <span className="text-[10px] font-semibold text-white/30 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1">
            2.4 km {tr("lbl_far")}
          </span>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex-1 bg-purple-600 text-white text-[11px] font-bold py-2.5 rounded-xl">
            {tr("btn_checkin")}
          </button>
          <button className="flex-1 bg-white/[0.07] text-white/70 text-[11px] font-semibold py-2.5 rounded-xl border border-white/[0.08]">
            {tr("btn_navigate")}
          </button>
        </div>
      </div>

      {/* ── Collection + detail labels ───────────────────────────── */}
      <div className="px-6 pt-6 pb-10">
        <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.14em] mb-3">
          Collection &amp; Detail
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              "lbl_your_collection",
              "lbl_historical_record",
              "lbl_discovered",
              "lbl_visit_to_unlock",
              "lbl_model_coming_soon",
              "btn_read_story",
              "lbl_photos",
              "lbl_drag_rotate",
            ] as TranslationKey[]
          ).map((key) => (
            <div key={key} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
              <p className="text-purple-400/45 text-[8px] font-mono mb-0.5 truncate">{key}</p>
              <p className="text-white/75 text-[11px] font-medium leading-tight">{tr(key)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

