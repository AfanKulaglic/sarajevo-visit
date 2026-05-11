"use client";

import { useState } from "react";
import { SUPPORTED_LANGUAGES, LangCode } from "@/lib/i18n";
import { useLanguage } from "@/context/LanguageContext";

interface LanguagePickerOverlayProps {
  onDone: () => void;
}

export default function LanguagePickerOverlay({ onDone }: LanguagePickerOverlayProps) {
  const { lang, setLang, setLangChosen, t } = useLanguage();
  const [selected, setSelected] = useState<LangCode>(lang);

  // Preview title/subtitle in the currently highlighted language
  const previewT = (key: "onb_lang_title" | "onb_lang_subtitle") => {
    const entry = SUPPORTED_LANGUAGES.find((l) => l.code === selected);
    if (!entry) return "";
    // Use hardcoded preview strings (no override needed here — it's the first screen)
    const previews: Record<LangCode, { title: string; subtitle: string }> = {
      en: { title: "Choose your language", subtitle: "You can change this anytime" },
      bs: { title: "Odaberite jezik", subtitle: "Ovo mo\u017Eete promijeniti u bilo koje vrijeme" },
      tr: { title: "Dil se\u00E7in", subtitle: "Bunu istedi\u011Finiz zaman de\u011Fi\u015Ftirebilirsiniz" },
      ar: { title: "\u0627\u062E\u062A\u0631 \u0644\u063A\u062A\u0643", subtitle: "\u064A\u0645\u0643\u0646\u0643 \u062A\u063A\u064A\u064A\u0631 \u0647\u0630\u0627 \u0641\u064A \u0623\u064A \u0648\u0642\u062A" },
      de: { title: "Sprache w\u00E4hlen", subtitle: "Sie k\u00F6nnen dies jederzeit \u00E4ndern" },
      sl: { title: "Izberite jezik", subtitle: "To lahko kadarkoli spremenite" },
      it: { title: "Scegli la lingua", subtitle: "Puoi cambiarlo in qualsiasi momento" },
      fr: { title: "Choisir la langue", subtitle: "Vous pouvez changer cela \u00E0 tout moment" },
      es: { title: "Elige tu idioma", subtitle: "Puedes cambiarlo en cualquier momento" },
    };
    return key === "onb_lang_title" ? previews[selected].title : previews[selected].subtitle;
  };

  function handleConfirm() {
    setLang(selected);
    setLangChosen(true);
    onDone();
  }

  const isRtl = selected === "ar";

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center"
      style={{ background: "#07040D" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Logo / branding mark */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
          style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.35)" }}
        >
          <img src="/icons/logo.png" alt="Saraya Explore" className="w-full h-full object-contain" />
        </div>
        <span className="text-white/40 text-xs tracking-widest uppercase">Sarajevo Hotspot</span>
      </div>

      {/* Title (previewed in selected language) */}
      <h1 className="text-white text-2xl font-bold mb-1 text-center px-6">
        {previewT("onb_lang_title")}
      </h1>
      <p className="text-white/50 text-sm mb-8 text-center px-6">
        {previewT("onb_lang_subtitle")}
      </p>

      {/* Language grid — 2 columns */}
      <div className="w-full max-w-sm px-5 grid grid-cols-2 gap-3 mb-8">
        {SUPPORTED_LANGUAGES.map((language) => {
          const isActive = selected === language.code;
          return (
            <button
              key={language.code}
              onClick={() => setSelected(language.code)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all"
              style={{
                background: isActive
                  ? "rgba(168,85,247,0.22)"
                  : "rgba(255,255,255,0.04)",
                border: isActive
                  ? "1px solid rgba(168,85,247,0.55)"
                  : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <img
                src={`https://flagcdn.com/w40/${language.countryCode}.png`}
                srcSet={`https://flagcdn.com/w80/${language.countryCode}.png 2x`}
                width={28}
                height={21}
                alt={language.label}
                className="rounded-sm flex-shrink-0"
                style={{ objectFit: "cover" }}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className="text-sm font-semibold leading-tight truncate"
                  style={{ color: isActive ? "#E9D5FF" : "rgba(255,255,255,0.85)" }}
                >
                  {language.nativeLabel}
                </span>
                <span className="text-xs text-white/35 leading-tight">
                  {language.label}
                </span>
              </div>
              {isActive && (
                <span className="ml-auto text-purple-400 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.5"/>
                    <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      <div className="w-full max-w-sm px-5">
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}
        >
          {/* Show "Continue" in selected language */}
          {{
            en: "Continue",
            bs: "Nastavi",
            tr: "Devam",
            ar: "\u0627\u0633\u062A\u0645\u0631",
            de: "Weiter",
            sl: "Nadaljuj",
            it: "Continua",
            fr: "Continuer",
            es: "Continuar",
          }[selected]}
        </button>
      </div>
    </div>
  );
}
