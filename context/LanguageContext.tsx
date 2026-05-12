"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { LangCode, TranslationKey, TRANSLATIONS, translate } from "@/lib/i18n";
import { Location } from "@/lib/locations";
import {
  getLocationContent,
  subscribeLocationTranslations,
  LocTranslationOverrides,
  LocationContent,
} from "@/lib/locationTranslations";

const STORAGE_KEY = "saraya_lang";
export const LANG_CHOSEN_KEY = "saraya_lang_chosen";

// Admin-editable overrides: { [langCode]: { [key]: overrideString } }
type Overrides = Partial<Record<LangCode, Partial<Record<TranslationKey, string>>>>;

interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  langChosen: boolean;
  setLangChosen: (v: boolean) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
  /** Returns translated name/description/story for a location, with Firebase overrides applied. */
  getLocContent: (loc: Location) => LocationContent;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");
  const [langChosen, setLangChosenState] = useState(false);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [locContentOverrides, setLocContentOverrides] = useState<LocTranslationOverrides>({});

  // Hydrate from localStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && stored in TRANSLATIONS) setLangState(stored);
    if (localStorage.getItem(LANG_CHOSEN_KEY)) setLangChosenState(true);
  }, []);

  // Subscribe to admin overrides in Firebase RTDB at /translations
  useEffect(() => {
    const translationsRef = ref(db, "translations");
    const unsub = onValue(translationsRef, (snap) => {
      if (snap.exists()) {
        setOverrides(snap.val() as Overrides);
      } else {
        setOverrides({});
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to location content overrides in Firebase RTDB at /locationTranslations
  useEffect(() => {
    return subscribeLocationTranslations(setLocContentOverrides);
  }, []);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const setLangChosen = useCallback((v: boolean) => {
    setLangChosenState(v);
    if (typeof window !== "undefined") {
      if (v) {
        localStorage.setItem(LANG_CHOSEN_KEY, "1");
      } else {
        localStorage.removeItem(LANG_CHOSEN_KEY);
      }
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      // Admin override takes priority, then local translation, then English fallback
      const adminVal = overrides[lang]?.[key];
      if (adminVal) return adminVal;
      return translate(lang, key);
    },
    [lang, overrides]
  );

  const getLocContent = useCallback(
    (loc: Location): LocationContent => {
      return getLocationContent(loc.id, lang, loc, locContentOverrides);
    },
    [lang, locContentOverrides]
  );

  const isRtl = lang === "ar";

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, langChosen, setLangChosen, t, isRtl, getLocContent }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

