"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import { SUPPORTED_LANGUAGES, LangCode } from "@/lib/i18n";

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/>
      <path d="M9 3v15M15 6v15"/>
    </svg>
  );
}

function CollectionIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V22H4V12"/>
      <path d="M22 7H2v5h20V7z"/>
      <path d="M12 22V7"/>
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/25 flex-shrink-0">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { collectedItems } = useGame();
  const { t, lang, setLang } = useLanguage();
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [mapTheme, setMapThemeState] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("saraya_map_theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  function toggleMapTheme() {
    const next = mapTheme === "dark" ? "light" : "dark";
    setMapThemeState(next);
    localStorage.setItem("saraya_map_theme", next);
    window.dispatchEvent(new CustomEvent("mapthemechange", { detail: next }));
  }

  if (!user) return null;

  const isMap = pathname === "/map";
  const isCollection = pathname === "/collection";
  const isSettings = showSettings;

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === lang) ?? SUPPORTED_LANGUAGES[0];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          SETTINGS SHEET
      ══════════════════════════════════════════════════════════════ */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[80] flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={() => { setShowSettings(false); setShowLangPicker(false); setShowPrivacy(false); setShowTerms(false); }}
        >
          <div
            className="relative w-full max-w-md mx-auto rounded-t-3xl overflow-hidden"
            style={{
              background: "#0E0B1A",
              border: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "none",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            {/* ── MAIN SETTINGS VIEW ── */}
            {!showLangPicker && !showPrivacy && !showTerms && (
              <>
                {/* Header */}
                <div className="px-5 pt-3 pb-5 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-[18px] tracking-tight">Settings</p>
                    <p className="text-white/35 text-xs mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Section: Preferences */}
                <div className="px-5 mb-2">
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.12em] uppercase mb-2">Preferences</p>
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                    {/* Language row */}
                    <button
                      onClick={() => setShowLangPicker(true)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] active:bg-white/[0.06]"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white text-sm font-medium">Language</p>
                        <p className="text-white/35 text-xs mt-0.5">{currentLang.nativeLabel}</p>
                      </div>
                      <img
                        src={`https://flagcdn.com/w40/${currentLang.countryCode}.png`}
                        srcSet={`https://flagcdn.com/w80/${currentLang.countryCode}.png 2x`}
                        width={24} height={18} alt={currentLang.label}
                        className="rounded-sm mr-1" style={{ objectFit: "cover" }}
                      />
                      <ChevronRight />
                    </button>
                    {/* Map theme row */}
                    <button
                      onClick={toggleMapTheme}
                      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] active:bg-white/[0.06]"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: mapTheme === "dark" ? "rgba(99,102,241,0.15)" : "rgba(245,158,11,0.15)" }}>
                        {mapTheme === "dark" ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(165,180,252,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white text-sm font-medium">Map Style</p>
                        <p className="text-white/35 text-xs mt-0.5">{mapTheme === "dark" ? "Dark" : "Light"}</p>
                      </div>
                      {/* Toggle pill */}
                      <div
                        className="w-11 h-6 rounded-full flex items-center transition-all duration-300 flex-shrink-0"
                        style={{
                          background: mapTheme === "dark" ? "rgba(99,102,241,0.5)" : "rgba(245,158,11,0.5)",
                          border: mapTheme === "dark" ? "1px solid rgba(165,180,252,0.3)" : "1px solid rgba(251,191,36,0.3)",
                          padding: "2px",
                          justifyContent: mapTheme === "dark" ? "flex-start" : "flex-end",
                        }}
                      >
                        <div className="w-4 h-4 rounded-full bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section: Legal */}
                <div className="px-5 mb-2 mt-4">
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.12em] uppercase mb-2">Legal</p>
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                    <button
                      onClick={() => setShowPrivacy(true)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] active:bg-white/[0.06]"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.12)" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white text-sm font-medium">Privacy Policy</p>
                        <p className="text-white/35 text-xs mt-0.5">How we handle your data</p>
                      </div>
                      <ChevronRight />
                    </button>
                    <button
                      onClick={() => setShowTerms(true)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] active:bg-white/[0.06]"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.12)" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white text-sm font-medium">Terms of Use</p>
                        <p className="text-white/35 text-xs mt-0.5">Rules for using the app</p>
                      </div>
                      <ChevronRight />
                    </button>
                  </div>
                </div>

                {/* Section: Account */}
                <div className="px-5 mb-2 mt-4">
                  <p className="text-white/30 text-[10px] font-bold tracking-[0.12em] uppercase mb-2">Account</p>
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                    <button
                      onClick={() => { logout(); setShowSettings(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] active:bg-white/[0.06]"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.12)" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                          <polyline points="16,17 21,12 16,7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-red-400 text-sm font-medium">Sign Out</p>
                        <p className="text-white/35 text-xs mt-0.5">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* App info footer */}
                <div className="px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom,24px))] flex flex-col items-center gap-1">
                  <p className="text-white/20 text-[11px]">Sarajevo Hotspot</p>
                  <p className="text-white/15 text-[10px]">v1.0.0 · Made with ♥ in Sarajevo</p>
                </div>
              </>
            )}

            {/* ── LANGUAGE PICKER SUB-VIEW ── */}
            {showLangPicker && (
              <>
                <div className="px-5 pt-3 pb-4 flex items-center gap-3">
                  <button
                    onClick={() => setShowLangPicker(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div>
                    <p className="text-white font-bold text-base">Language</p>
                    <p className="text-white/35 text-xs">Choose your preferred language</p>
                  </div>
                </div>
                <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom,24px))] grid grid-cols-2 gap-2.5">
                  {SUPPORTED_LANGUAGES.map((language) => {
                    const isActive = lang === language.code;
                    return (
                      <button
                        key={language.code}
                        onClick={() => { setLang(language.code as LangCode); setShowLangPicker(false); }}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all active:scale-95"
                        style={{
                          background: isActive ? "rgba(168,85,247,0.22)" : "rgba(255,255,255,0.04)",
                          border: isActive ? "1px solid rgba(168,85,247,0.55)" : "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${language.countryCode}.png`}
                          srcSet={`https://flagcdn.com/w80/${language.countryCode}.png 2x`}
                          width={28} height={21} alt={language.label}
                          className="rounded-sm flex-shrink-0" style={{ objectFit: "cover" }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold leading-tight truncate" style={{ color: isActive ? "#E9D5FF" : "rgba(255,255,255,0.85)" }}>
                            {language.nativeLabel}
                          </span>
                          <span className="text-xs text-white/35 leading-tight">{language.label}</span>
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
              </>
            )}

            {/* ── PRIVACY POLICY SUB-VIEW ── */}
            {showPrivacy && (
              <>
                <div className="px-5 pt-3 pb-4 flex items-center gap-3">
                  <button
                    onClick={() => setShowPrivacy(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <p className="text-white font-bold text-base">Privacy Policy</p>
                </div>
                <div className="px-5 pb-[max(32px,env(safe-area-inset-bottom,32px))] space-y-4 text-white/60 text-sm leading-relaxed">
                  <p className="text-white/40 text-xs">Last updated: May 2026</p>
                  <p>Sarajevo Hotspot ("the App") is a location-based tourism experience. We respect your privacy and are committed to protecting your personal data.</p>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">Data We Collect</p>
                    <p>We collect your email address when you register, your GPS location while using the app (only while the app is open), and your collection progress (which landmarks you have visited).</p>
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">How We Use Your Data</p>
                    <p>Your location is used solely to detect proximity to landmarks and is never stored on our servers. Your email and collection data are stored securely in Firebase (Google) and are used only to save your game progress.</p>
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">Data Sharing</p>
                    <p>We do not sell, trade, or share your personal data with third parties. Your data is stored using Firebase services governed by Google's privacy policy.</p>
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">Your Rights</p>
                    <p>You may request deletion of your account and all associated data at any time by signing out and contacting us. Uninstalling the app removes locally stored preferences from your device.</p>
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">Contact</p>
                    <p>For any privacy-related questions, contact us at <span className="text-purple-400">info@sarayasolutions.com</span>.</p>
                  </div>
                </div>
              </>
            )}

            {/* ── TERMS OF USE SUB-VIEW ── */}
            {showTerms && (
              <>
                <div className="px-5 pt-3 pb-4 flex items-center gap-3">
                  <button
                    onClick={() => setShowTerms(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <p className="text-white font-bold text-base">Terms of Use</p>
                </div>
                <div className="px-5 pb-[max(32px,env(safe-area-inset-bottom,32px))] space-y-4 text-white/60 text-sm leading-relaxed">
                  <p className="text-white/40 text-xs">Last updated: May 2026</p>
                  <p>By using Sarajevo Hotspot you agree to these terms. Please read them carefully.</p>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">Use of the App</p>
                    <p>The app is intended for personal, non-commercial use. You must be 13 years of age or older to create an account. You are responsible for keeping your login credentials secure.</p>
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">GPS & Location</p>
                    <p>The app requires access to your device's GPS to function. Location is used only to detect proximity to landmarks. You may revoke location permission at any time in your device settings, though this will prevent check-ins.</p>
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">Content</p>
                    <p>All landmark descriptions, historical texts, and 3D models are provided for educational and entertainment purposes. While we strive for accuracy, we make no warranties regarding the completeness or correctness of historical content.</p>
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">Prohibited Conduct</p>
                    <p>You agree not to attempt to bypass GPS checks, reverse-engineer the app, or use the app in any way that violates local laws or disrupts other users.</p>
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">Limitation of Liability</p>
                    <p>Sarajevo Hotspot is provided "as is". We are not liable for any injuries, losses, or damages arising from use of the app or from visiting landmark locations.</p>
                  </div>
                  <div>
                    <p className="text-white/85 font-semibold mb-1">Changes</p>
                    <p>We may update these terms at any time. Continued use of the app constitutes acceptance of any changes.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM NAV — 3 tabs: Map · Collection · Settings
      ══════════════════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 select-none">
        <div className="absolute inset-0 bg-[#0a0d14]/95 backdrop-blur-xl border-t border-white/[0.05]" />
        <div
          className="relative flex items-stretch justify-around max-w-md mx-auto"
          style={{ paddingTop: "8px", paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}
        >
          <Link
            href="/map"
            className={`relative flex flex-col items-center gap-1.5 px-8 py-1.5 transition-all duration-200 ${
              isMap ? "text-purple-400" : "text-white/30 hover:text-white/55"
            }`}
          >
            <MapIcon active={isMap} />
            <span className="text-[10px] font-bold tracking-[0.07em] uppercase">{t("nav_map")}</span>
            {isMap && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-purple-400 rounded-full" />}
          </Link>

          <Link
            href="/collection"
            className={`relative flex flex-col items-center gap-1.5 px-8 py-1.5 transition-all duration-200 ${
              isCollection ? "text-purple-400" : "text-white/30 hover:text-white/55"
            }`}
          >
            <div className="relative">
              <CollectionIcon active={isCollection} />
              {collectedItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-purple-500 text-gray-950 text-[9px] font-black rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none">
                  {collectedItems.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-[0.07em] uppercase">{t("nav_collection")}</span>
            {isCollection && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-purple-400 rounded-full" />}
          </Link>

          <button
            onClick={() => setShowSettings(true)}
            className={`relative flex flex-col items-center gap-1.5 px-8 py-1.5 transition-all duration-200 ${
              isSettings ? "text-purple-400" : "text-white/30 hover:text-white/55"
            }`}
          >
            <SettingsIcon active={isSettings} />
            <span className="text-[10px] font-bold tracking-[0.07em] uppercase">Settings</span>
            {isSettings && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-purple-400 rounded-full" />}
          </button>
        </div>
      </nav>
    </>
  );
}


