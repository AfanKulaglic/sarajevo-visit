"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";

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

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { collectedItems } = useGame();
  const { t } = useLanguage();
  const pathname = usePathname();

  if (!user) return null;

  const isMap = pathname === "/map";
  const isCollection = pathname === "/collection";

  return (
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
          {isMap && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-purple-400 rounded-full" />
          )}
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
          {isCollection && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-purple-400 rounded-full" />
          )}
        </Link>

        <button
          onClick={logout}
          className="relative flex flex-col items-center gap-1.5 px-8 py-1.5 text-white/30 hover:text-white/55 transition-all duration-200"
        >
          <LogoutIcon />
          <span className="text-[10px] font-bold tracking-[0.07em] uppercase">{t("nav_logout")}</span>
        </button>
      </div>
    </nav>
  );
}
