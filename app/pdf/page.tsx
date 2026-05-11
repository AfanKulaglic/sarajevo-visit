"use client";
import { useRef, useEffect } from "react";
import { locations } from "@/lib/locations";

/* ── SARAYA EXPLORE · Prezentacija (14 slajdova, BOS)
   Svaki slajd: 1280 × 720 px (16:9 landscape).
   Screenshot svakog slajda → horizontalni PDF stranica po stranica.
─────────────────────────────────────────────────────────────────────────── */

const PURPLE = "#8B5CF6";
const BLUE = "#3080FF";
const BLUE_DIM = "rgba(48,128,255,0.15)";
const BLUE_BORDER = "rgba(48,128,255,0.38)";
const PURPLE_DIM = "rgba(139,92,246,0.18)";
const PURPLE_BORDER = "rgba(139,92,246,0.4)";
const BG = "#0D0D12";
const SURFACE = "#111118";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT_DIM = "rgba(255,255,255,0.38)";
const TEXT_MID = "rgba(255,255,255,0.65)";
const W = 1280;
const H = 720;
const TOTAL = 15;

const landmarks = [
  { emoji: "⛲", name: "Sebilj", desc: "Osmanska fontana — srce Baščaršije", icon: "/models/icons/sebilj.webp", year: "1753.", story: "Najfotografisaniji objekat u BiH. Ko pije s Seblja, uvijek se vraća u Sarajevo." },
  { emoji: "🏛️", name: "Vijećnica", desc: "Austro-Ugarska gradska vijećnica", icon: "/models/icons/vijecnica.webp", year: "1896.", story: "Spaljena 1992., obnovljena 2014. — simbol otpornosti i kulturnog pamćenja." },
  { emoji: "🕰️", name: "Sahat Kula", desc: "Jedini funkcionalni lunalni sat na Balkanu", icon: "/models/icons/sahat%20kula.webp", year: "17. vijek", story: "Dan počinje sa zalaskom sunca — satovi po Alatürka sistemu još uvijek rade." },
  { emoji: "🔥", name: "Vječna Vatra", desc: "Plamen koji ne prestaje gorjeti od 1946.", icon: "/models/icons/vijecna%20vatra.webp", year: "1946.", story: "Gorjela je i tokom opsade, kada su je građani ručno palili i čuvali." },
  { emoji: "🕊️", name: "Djeca Sarajeva", desc: "Spomen 1.601 djetetu ubijenom u opsadi", icon: "/models/icons/spomenik%20poginuloj%20djeci%20sarajeva.webp", year: "1992–96.", story: "Svako dijete ima ime. Nije statistika — to su bili životi." },
  { emoji: "🌍", name: "Multikulturalni Čovjek", desc: "Bronzani simbol suživota svih naroda Sarajeva", icon: "/models/icons/multikulturalni%20covjek.webp", year: "Savremeno", story: "Džamija, crkva, katedrala i sinagoga — sve u krugu od 500 metara." },
];

const langs = [
  { code: "bs", flag: "ba", label: "Bosanski", tourists: "Lokalni posjetioci" },
  { code: "en", flag: "gb", label: "English", tourists: "Međunarodni standard" },
  { code: "tr", flag: "tr", label: "Türkçe", tourists: "#1 inozemni turisti" },
  { code: "ar", flag: "sa", label: "العربية", tourists: "Golfski turisti" },
  { code: "de", flag: "de", label: "Deutsch", tourists: "Njemci, Austrijanci" },
  { code: "sl", flag: "si", label: "Slovenščina", tourists: "Susjedi — čest gost" },
  { code: "it", flag: "it", label: "Italiano", tourists: "Rastući segment" },
  { code: "fr", flag: "fr", label: "Français", tourists: "Kulturni turisti" },
  { code: "es", flag: "es", label: "Español", tourists: "Mladi putnici" },
];

const koraci = [
  { n: "01", icon: "🔐", title: "Prijava", sub: "Gmail jednim klikom ili klasičan nalog — 10 sekundi" },
  { n: "02", icon: "📡", title: "Captive Portal", sub: "Čim se spoje na naš WiFi, prva stvar je Saraya Explore" },
  { n: "03", icon: "🗺️", title: "Interaktivna Mapa", sub: "Vide lokalitete u blizini s udaljenošću i pričama" },
  { n: "04", icon: "🚶", title: "Fizički Odlazak", sub: "GPS potvrđuje da je turist na licu mjesta" },
  { n: "05", icon: "🏆", title: "Otključavanje", sub: "Video, slike, priča, 3D model — puno iskustvo" },
];

// ── helpers ───────────────────────────────────────────────────────────────

function Blob({ x, y, size, opacity = 0.18, gold }: { x: number; y: number; size: number; opacity?: number; gold?: boolean }) {
  const c = gold ? "48,128,255" : "139,92,246";
  return <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, rgba(${c},${opacity}) 0%, transparent 70%)`, pointerEvents: "none" }} />;
}

function GridLines() {
  return (
    <svg style={{ position: "absolute", inset: 0 }} width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      {[...Array(9)].map((_, i) => <line key={`v${i}`} x1={i * 160} y1={0} x2={i * 160} y2={H} stroke="rgba(255,255,255,0.024)" strokeWidth={1} />)}
      {[...Array(6)].map((_, i) => <line key={`h${i}`} x1={0} y1={i * 144} x2={W} y2={i * 144} stroke="rgba(255,255,255,0.024)" strokeWidth={1} />)}
    </svg>
  );
}

function Tag({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: gold ? BLUE_DIM : PURPLE_DIM, border: `1px solid ${gold ? BLUE_BORDER : PURPLE_BORDER}`, borderRadius: 99, padding: "4px 14px", color: gold ? BLUE : PURPLE, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 14 }}>{children}</div>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 38, fontWeight: 800, color: "white", letterSpacing: "-1px", lineHeight: 1.18, marginBottom: 14 }}>{children}</div>;
}

function Grad({ children }: { children: React.ReactNode }) {
  return <span style={{ background: `linear-gradient(90deg, ${PURPLE}, #A78BFA, ${BLUE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{children}</span>;
}

function GG({ children }: { children: React.ReactNode }) {
  return <span style={{ background: `linear-gradient(90deg, ${BLUE}, #60A5FA)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{children}</span>;
}

function RainbowBar() {
  return <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${PURPLE}, ${BLUE}, transparent)` }} />;
}

function SarayaLogo({ size = 14 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: size * 1.8, height: size * 1.8, borderRadius: size * 0.38, background: `linear-gradient(135deg, ${PURPLE}, ${BLUE})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.85, fontWeight: 900, color: "white" }}>S</div>
      <span style={{ fontSize: size, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>SARAYA</span>
    </div>
  );
}

function Slide({ n, children, noPad }: { n: number; children: React.ReactNode; noPad?: boolean }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, paddingLeft: 4 }}>
        <span style={{ background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}`, color: PURPLE, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 10px", borderRadius: 99 }}>SLAJD {n} / {TOTAL}</span>
        <span style={{ color: TEXT_DIM, fontSize: 11 }}>← Screenshot ovaj prostor ↓</span>
      </div>
      <div style={{ width: W, height: H, background: BG, position: "relative", overflow: "hidden", flexShrink: 0, padding: noPad ? 0 : "42px 58px", boxSizing: "border-box", fontFamily: "inherit" }}>
        {children}
        <div style={{ position: "absolute", bottom: 16, right: 22, color: TEXT_DIM, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em" }}>{n} / {TOTAL}</div>
      </div>
    </div>
  );
}

function PhoneMock({ children, scale = 1 }: { children: React.ReactNode; scale?: number }) {
  return (
    <div style={{ width: 220 * scale, flexShrink: 0, position: "relative" }}>
      <div style={{ width: 220 * scale, height: 440 * scale, borderRadius: 36 * scale, background: "#0D0D18", border: "8px solid rgba(255,255,255,0.12)", position: "relative", overflow: "hidden", boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)` }}>
        {/* notch */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 70 * scale, height: 20 * scale, background: "#0D0D18", borderRadius: "0 0 14px 14px", zIndex: 10 }} />
        {children}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────

export default function PdfPage() {
  const vijecnicaRef = useRef<HTMLIFrameElement>(null);
  const sebiljRef = useRef<HTMLIFrameElement>(null);

  function sendLoc(iframeRef: React.RefObject<HTMLIFrameElement | null>, locId: string) {
    const loc = locations.find(l => l.id === locId);
    if (!loc || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "admin_preview", loc, lang: "bs" },
      window.location.origin
    );
  }

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "preview_ready") {
        sendLoc(vijecnicaRef, "2");
        sendLoc(sebiljRef, "1");
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh", padding: "40px 0 80px", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Upute */}
      <div style={{ width: W, marginBottom: 28, padding: "14px 20px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12, color: TEXT_MID, fontSize: 13, lineHeight: 1.7 }}>
        <strong style={{ color: PURPLE }}>Export:</strong> Svaki slajd je tačno <strong style={{ color: "white" }}>1280 × 720 px</strong> (16:9). Zoom = 100%, screenshot svakog slajda posebno → horizontalni PDF.
      </div>

      {/* ═══════════════════════ SLAJD 1 — NASLOVNICA ══════════════════════ */}
      <Slide n={1} noPad>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 90% at 50% 28%, rgba(48,128,255,0.22) 0%, rgba(139,92,246,0.18) 50%, transparent 75%), #0D0D12" }} />
        <GridLines />
        <Blob x={-140} y={-120} size={520} opacity={0.22} />
        <Blob x={860} y={430} size={400} opacity={0.14} />
        <Blob x={680} y={-90} size={300} opacity={0.12} gold />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${PURPLE}, ${BLUE}, transparent)` }} />
        <div style={{ position: "absolute", top: 28, right: 40, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: TEXT_DIM, fontSize: 11, letterSpacing: "0.1em", fontWeight: 600 }}>POWERED BY</span>
          <SarayaLogo size={13} />
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <img src="/icons/icon-192.png" alt="icon" style={{ width: 84, height: 84, borderRadius: 22, border: `1px solid ${BORDER}`, marginBottom: 20 }} />
          <div style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 99, padding: "4px 18px", color: BLUE, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 16 }}>
            ● DIGITALNI TURISTIČKI PRATILAC SARAJEVA
          </div>
          <div style={{ fontSize: 78, fontWeight: 900, color: "white", letterSpacing: "-3.5px", lineHeight: 0.95, textAlign: "center" }}>SARAYA</div>
          <div style={{ fontSize: 78, fontWeight: 900, background: `linear-gradient(90deg, ${PURPLE}, #A78BFA, ${BLUE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-3.5px", lineHeight: 0.95, textAlign: "center", marginBottom: 18 }}>EXPLORE</div>
          <div style={{ fontSize: 16, color: TEXT_MID, letterSpacing: "0.05em", textAlign: "center", marginBottom: 28, maxWidth: 560, lineHeight: 1.6 }}>
            Upoznaj dušu Sarajeva korak po korak — priča po priča, lokalitet po lokalitet
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {["GPS Check-In", "3D Kolekcija", "Višejezičan", "PWA — bez instalacije", "Captive Portal integracija", "Google prijava"].map(t => (
              <div key={t} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 99, padding: "6px 14px", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600 }}>{t}</div>
            ))}
          </div>
        </div>
        <RainbowBar />
      </Slide>

      {/* ═══════════════════════ SLAJD 2 — RAZUMIJEVANJE ZA 60 SEKUNDI ══════ */}
      <Slide n={2}>
        <Blob x={-60} y={-60} size={460} opacity={0.13} />
        <Blob x={860} y={280} size={400} opacity={0.1} gold />
        {/* Top label */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <Tag>● JEDAN SLAJD DA RAZUMIJETE SVE</Tag>
          <div style={{ fontSize: 36, fontWeight: 800, color: "white", letterSpacing: "-1px" }}>
            Šta je <Grad>Saraya Explore</Grad> i zašto je važno?
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>

          {/* LEFT — what it is */}
          <div style={{ flex: "0 0 340px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "22px 22px" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📱</div>
            <div style={{ color: PURPLE, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>ŠTA JE TO?</div>
            <div style={{ color: "white", fontSize: 15, fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>Web-aplikacija otvorena direktno kroz naš WiFi</div>
            <div style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.75 }}>
              Turist se spoji na <strong style={{ color: "white" }}>Saraya Hotspot</strong>. Automatski mu se otvara stranica — kao Google ili Facebook, bez instalacije, bez App Store-a. Odatle ulazi u <strong style={{ color: "white" }}>Saraya Explore</strong> i počinje istraživanje grada.
            </div>
            <div style={{ marginTop: 14, background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ color: PURPLE, fontSize: 11, fontWeight: 700 }}>💡 Analogija</div>
              <div style={{ color: TEXT_MID, fontSize: 11, marginTop: 4, lineHeight: 1.6 }}>
                Kao captive portal u hotelu — samo što umjesto "Klikni za pristup internetu", nudi <strong style={{ color: "white" }}>Sarajevo u džepu</strong>.
              </div>
            </div>
          </div>

          {/* CENTER — 3-step visual */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: TEXT_DIM, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 2 }}>KAKO FUNKCIONIŠE — 3 KORAKA</div>
            {[
              {
                n: "1", icon: "📶", color: PURPLE,
                title: "Spoji se na naš WiFi",
                body: "Portal se otvori automatski. Turist se registruje Google nalogom — 10 sekundi.",
              },
              {
                n: "2", icon: "🗺️", color: "#60A5FA",
                title: "Vidi mapu i kreće u grad",
                body: "Interaktivna mapa prikazuje historijska mjesta u blizini. GPS prati da li je turist zaista tamo.",
              },
              {
                n: "3", icon: "🏆", color: BLUE,
                title: "Otključava sadržaj i dobija nagradu",
                body: "Na licu mjesta otvara video, slike, 3D model i historiju. Skuplja digitalnu figurinu lokaliteta. Kompletna kolekcija = Saraya nagrada.",
              },
            ].map(({ n, icon, color, title, body }) => (
              <div key={n} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "16px 18px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: `${color}22`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ background: `${color}22`, border: `1px solid ${color}44`, color, fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "1px 8px" }}>Korak {n}</span>
                    <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{title}</span>
                  </div>
                  <div style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.6 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — 3 benefits */}
          <div style={{ flex: "0 0 296px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: TEXT_DIM, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 2 }}>ZAŠTO JE OVO VRIJEDNO ZA NAS?</div>
            {[
              { icon: "🧲", color: BLUE, title: "Zadržavamo turista duže", body: "Turist koji traži lokalitete ostaje u zoni oko našeg kafea — i troši kod nas." },
              { icon: "📊", color: PURPLE, title: "Znamo ko su naši gosti", body: "Vidimo nacionalnosti, aktivne sate, omiljene lokacije — podaci za pametan marketing." },
              { icon: "🌐", color: "#34D399", title: "Saraya brend na turističkoj karti", body: "Postajemo kompanija koja čuva i dijeli sarajevsku historiju — prepoznatljivi, jedinstveni." },
            ].map(({ icon, color, title, body }) => (
              <div key={title} style={{ flex: 1, background: `${color}0E`, border: `1px solid ${color}30`, borderRadius: 16, padding: "16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 24 }}>{icon}</div>
                <div style={{ color, fontSize: 12, fontWeight: 700 }}>{title}</div>
                <div style={{ color: TEXT_MID, fontSize: 11, lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* ═══════════════════════ SLAJD 3 — ŠTA JE SARAYA EXPLORE ════════════ */}
      <Slide n={3}>
        <Blob x={-80} y={-60} size={420} opacity={0.14} />
        <Blob x={820} y={320} size={380} opacity={0.1} />
        <div style={{ display: "flex", gap: 54, height: "100%", alignItems: "center" }}>
          <div style={{ flex: "0 0 450px" }}>
            <Tag>● O PROJEKTU</Tag>
            <H2>Šta je <Grad>Saraya Explore?</Grad></H2>
            <div style={{ color: TEXT_MID, fontSize: 14, lineHeight: 1.82, marginBottom: 18 }}>
              <strong style={{ color: "white" }}>Saraya Explore</strong> je GPS-bazirana turistička web-aplikacija koja pretvara svaku šetnju Sarajevom u interaktivno, nezaboravno iskustvo. Turist fizički odlazi do historijskih lokaliteta u blizini, potvrđuje prisustvo na licu mjesta i gradi vlastitu digitalnu kolekciju sarajevskih ikona.
            </div>
            <div style={{ color: TEXT_MID, fontSize: 14, lineHeight: 1.82, marginBottom: 20 }}>
              Svaki otključan lokalitet donosi <strong style={{ color: "white" }}>punu multimedijalnu priču</strong> — video, fotografije, historijski tekst, 3D model za rotaciju i istraživanje, a po završetku — <strong style={{ color: "white" }}>nagradu</strong> koja ostaje kao trajno sjećanje.
            </div>
            <div style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: "13px 18px" }}>
              <div style={{ color: BLUE, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>💡 KLJUČNA IDEJA</div>
              <div style={{ color: TEXT_MID, fontSize: 13, lineHeight: 1.6 }}>
                Turisti ne <em>čitaju</em> o Sarajevu — oni ga <strong style={{ color: "white" }}>proživljavaju</strong>. Svaki korak je otkriće, svaki lokalitet je priča, svaka nagrada je uspomena.
              </div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13 }}>
            {[
              { num: "∞", label: "Lokaliteta — bez ograničenja", sub: "Počinjemo s historijskim lokacijama oko našeg Hotspota, a proširujemo prema viziji", accent: "rgba(139,92,246,0.14)", border: "rgba(139,92,246,0.3)" },
              { num: "9+", label: "Jezika — i više", sub: "Počeli smo s 9 najzastupljenijih u Sarajevu. Novi se dodaju jednom komandom.", accent: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.28)" },
              { num: "3D", label: "Modeli kao nagrade", sub: "Digitalne figurine lokaliteta — trajne uspomene u kolekciji", accent: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.28)" },
              { num: "0€", label: "Za turiste — besplatno", sub: "Pristupačno svima, bez barijera — Saraya zarađuje kroz prisustvo i prepoznatljivost", accent: BLUE_DIM, border: BLUE_BORDER },
            ].map(({ num, label, sub, accent, border }) => (
              <div key={label} style={{ background: accent, border: `1px solid ${border}`, borderRadius: 15, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: "white", minWidth: 62, letterSpacing: "-1px" }}>{num}</div>
                <div>
                  <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{label}</div>
                  <div style={{ color: TEXT_MID, fontSize: 11, marginTop: 2, lineHeight: 1.5 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* ══════════════ SLAJD 4 — CAPTIVE PORTAL + NAŠA VEZA ════════════════ */}
      <Slide n={4}>
        <Blob x={500} y={-80} size={480} opacity={0.12} gold />
        <Blob x={-60} y={300} size={360} opacity={0.1} />
        <Tag gold>● SARAYA HOTSPOT — ULAZNA TAČKA</Tag>
        <div style={{ fontSize: 36, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 8 }}>
          Naš WiFi je <GG>prva stvar</GG> koju turist vidi
        </div>
        <div style={{ color: TEXT_MID, fontSize: 13, marginBottom: 22, maxWidth: 760 }}>
          Kada se turist spoji na naš Saraya Hotspot, <strong style={{ color: "white" }}>captive portal</strong> — stranica koju svaki WiFi prikazuje pri prvom spajanju — odmah mu prikazuje Saraya Explore. Bez QR koda, bez app storea, bez instalacije. Samo klikne i kreće u avanturu.
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
          {[
            { icon: "📶", label: "Turist se spaja na Saraya WiFi", sub: "Captive portal se automatski otvara", color: BLUE_DIM, bc: BLUE_BORDER, tc: BLUE },
            { arrow: true },
            { icon: "📱", label: "Saraya Explore se prikazuje", sub: "Nema instalacije — direktno u pretraživaču", color: PURPLE_DIM, bc: PURPLE_BORDER, tc: PURPLE },
            { arrow: true },
            { icon: "🔐", label: "Gmail ili klasična prijava", sub: "Registracija za 10 sekundi jednim klikom", color: "rgba(59,130,246,0.12)", bc: "rgba(59,130,246,0.3)", tc: "#60A5FA" },
            { arrow: true },
            { icon: "🗺️", label: "Mapa s lokalitetima", sub: "Vidi šta je u blizini i kreće u istraživanje", color: "rgba(16,185,129,0.12)", bc: "rgba(16,185,129,0.28)", tc: "#34D399" },
            { arrow: true },
            { icon: "🎁", label: "Vraća se s nagradom", sub: "Popust ili poklon u Saraya kafeu", color: BLUE_DIM, bc: BLUE_BORDER, tc: BLUE },
          ].map((item, i) =>
            "arrow" in item ? (
              <div key={i} style={{ color: TEXT_DIM, fontSize: 20, padding: "0 4px", alignSelf: "center", flexShrink: 0 }}>→</div>
            ) : (
              <div key={i} style={{ flex: 1, background: item.color, border: `1px solid ${item.bc}`, borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 7 }}>{item.icon}</div>
                <div style={{ color: item.tc, fontSize: 11, fontWeight: 700, lineHeight: 1.45 }}>{item.label}</div>
                <div style={{ color: TEXT_DIM, fontSize: 10, marginTop: 4, lineHeight: 1.4 }}>{item.sub}</div>
              </div>
            )
          )}
        </div>
        <div style={{ display: "flex", gap: 13 }}>
          {[
            { icon: "🎯", title: "Naš brend — prva impresija", body: "Svaki turist koji se spoji na naš WiFi odmah vidi Saraya Explore. Naše ime je prva digitalna stvar s kojom se sreće u gradu." },
            { icon: "🔁", title: "Ponavljanje posjete", body: "Nakon prve prijave, Saraya Explore ostaje dostupan na svakom uređaju. Svaki ponovni dolazak donosi novu eksploraciju." },
            { icon: "📊", title: "Razumijevanje naših gostiju", body: "Vidimo iz kojih zemalja dolaze, koje lokalitete posjećuju, u koje doba dana — podaci koji nam pomažu da poboljšamo ponudu." },
          ].map(({ icon, title, body }) => (
            <div key={title} style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 15, padding: "18px 16px" }}>
              <div style={{ fontSize: 22, marginBottom: 9 }}>{icon}</div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{title}</div>
              <div style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* ══════════════ SLAJD 5 — KAKO FUNKCIONIŠE ══════════════════════════ */}
      <Slide n={5}>
        <Blob x={400} y={-100} size={500} opacity={0.11} />
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Tag>● KORISNIČKO ISKUSTVO</Tag>
          <div style={{ fontSize: 36, fontWeight: 800, color: "white", letterSpacing: "-1px" }}>Od WiFi-ja do historijske <Grad>avanture</Grad> za 5 minuta</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, position: "relative", marginBottom: 28 }}>
          <div style={{ position: "absolute", top: 44, left: "10%", right: "10%", height: 2, background: `linear-gradient(90deg, transparent, ${PURPLE_BORDER}, ${BLUE_BORDER}, transparent)`, zIndex: 0 }} />
          {koraci.map((s, i) => (
            <div key={s.n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: i === 4 ? `linear-gradient(135deg, ${PURPLE}, ${BLUE})` : SURFACE, border: `2px solid ${i === 4 ? PURPLE : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: i === 4 ? `0 0 36px rgba(139,92,246,0.5)` : "none" }}>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: i === 4 ? PURPLE : "white", fontWeight: 700, fontSize: 14 }}>{s.title}</div>
                <div style={{ color: TEXT_MID, fontSize: 11, marginTop: 4, lineHeight: 1.45, maxWidth: 150 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 13 }}>
          <div style={{ flex: 1, background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 26 }}>🔑</div>
            <div>
              <div style={{ color: BLUE, fontWeight: 700, fontSize: 13, marginBottom: 3 }}>Prijava jednim klikom — Google nalog</div>
              <div style={{ color: TEXT_MID, fontSize: 12 }}>Turisti mogu koristiti Gmail koji već imaju. Nema formulara, nema čekanja — odmah su unutra i kreću u eksploraciju.</div>
            </div>
          </div>
          <div style={{ flex: 1, background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 26 }}>📱</div>
            <div>
              <div style={{ color: PURPLE, fontWeight: 700, fontSize: 13, marginBottom: 3 }}>PWA — radi kao prava aplikacija</div>
              <div style={{ color: TEXT_MID, fontSize: 12 }}>Jednom otvorena stranica može se dodati na početni ekran telefona. Izgleda i radi kao native app — ikona, splash screen, fullscreen.</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* ══════════════ SLAJD 6 — HISTORIJSKI LOKALITETI ════════════════════ */}
      <Slide n={6}>
        <Blob x={500} y={200} size={500} opacity={0.09} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <Tag>● HISTORIJSKI LOKALITETI</Tag>
            <div style={{ fontSize: 34, fontWeight: 800, color: "white", letterSpacing: "-1px", marginTop: 2 }}>
              Priče koje Sarajevo <Grad>čine posebnim</Grad>
            </div>
          </div>
          <div style={{ color: TEXT_DIM, fontSize: 12, maxWidth: 300, textAlign: "right", lineHeight: 1.5 }}>
            Ovo su historijski najznačajnija mjesta u blizini naše trenutne lokacije. Lista se proširuje prema potrebi.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {landmarks.map(lm => (
            <div key={lm.name} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, textAlign: "center" }}>
              <img src={lm.icon} alt={lm.name} style={{ width: 80, height: 80, borderRadius: 15, objectFit: "cover", border: `1px solid ${BORDER}` }} />
              <div style={{ fontSize: 17 }}>{lm.emoji}</div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>{lm.name}</div>
              <div style={{ color: TEXT_DIM, fontSize: 10, lineHeight: 1.45 }}>{lm.desc}</div>
              <div style={{ background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 99, padding: "2px 9px", color: PURPLE, fontSize: 10, fontWeight: 700 }}>{lm.year}</div>
              <div style={{ color: TEXT_MID, fontSize: 10, lineHeight: 1.45, fontStyle: "italic" }}>{lm.story}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>➕</span>
          <span style={{ color: BLUE, fontSize: 12, fontWeight: 600 }}>Novi lokaliteti se dodaju iz admin panela za nekoliko minuta — bez programera, bez tehničkog znanja.</span>
        </div>
      </Slide>

      {/* ══════════════ SLAJD 7 — ŠTA TURIST VIDI KAD OTKLJUČA ══════════════ */}
      <Slide n={7}>
        <Blob x={-60} y={-40} size={400} opacity={0.13} />
        <Blob x={800} y={300} size={380} opacity={0.1} />
        <Tag>● ISKUSTVO OTKLJUČAVANJA</Tag>
        <div style={{ fontSize: 34, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 8 }}>
          Lokalitet otključan — <Grad>puno multimedijalnog iskustva</Grad>
        </div>
        <div style={{ color: TEXT_MID, fontSize: 13, marginBottom: 20 }}>
          Kada turist potvrdi prisustvo na lokalitetu, dobija pristup kompletnom, bogatom sadržaju koji smo pripremili za to mjesto.
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {/* Content types */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
            {[
              { icon: "🎬", color: "#EF4444", title: "Video sadržaj", body: "Kratki dokumentarni video o lokalitetu — historija, zanimljivosti, atmosfera. Može biti YouTube embed ili vlastiti video." },
              { icon: "🖼️", color: "#3B82F6", title: "Galerija fotografija", body: "Visokokvalitetne fotografije — historijske i suvremene. Turist može listati i zoumovati. Puna galerija s opisima." },
              { icon: "📖", color: "#10B981", title: "Historijska priča", body: "Detaljan tekst o historiji mjesta — napisan stručno ali pristupačno. Turist čita priču kao da je živi." },
              { icon: "🌐", color: PURPLE, title: "3D Model za istraživanje", body: "Interaktivni 3D model lokaliteta koji se rotira, zumira i istražuje iz svih uglova direktno u pretraživaču telefona." },
            ].map(({ icon, color, title, body }) => (
              <div key={title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "13px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{title}</div>
                  <div style={{ color: TEXT_MID, fontSize: 11, lineHeight: 1.55 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Phone mockup with 3D iframe */}
          <PhoneMock scale={0.88}>
            <iframe
              ref={vijecnicaRef}
              src="/admin/preview"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 320,
                height: 693,
                border: "none",
                background: BG,
                transform: `scale(${(220 * 0.88) / 320})`,
                transformOrigin: "top left",
              }}
              title="Vijećnica 3D model"
              onLoad={() => sendLoc(vijecnicaRef, "2")}
            />
          </PhoneMock>

          {/* Right side — collection card */}
          <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: "14px" }}>
              <div style={{ color: BLUE, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>🏆 DODATO U KOLEKCIJU</div>
              <img src="/models/icons/vijecnica.webp" alt="Vijećnica" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
              <div style={{ color: "white", fontSize: 11, fontWeight: 700 }}>Vijećnica</div>
              <div style={{ color: TEXT_DIM, fontSize: 10, marginTop: 2 }}>1. put viđeno: 11. maja 2026.</div>
            </div>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px" }}>
              <div style={{ color: TEXT_DIM, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>SARAYA NAGRADA</div>
              <div style={{ color: "white", fontSize: 11, fontWeight: 600, lineHeight: 1.5 }}>Pokaži kompletnu kolekciju i osvoji besplatan napitak! ☕</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* ══════════════ SLAJD 8 — 3D NAVIGACIJA ══════════════════════════════ */}
      <Slide n={8}>
        <Blob x={600} y={-60} size={480} opacity={0.13} />
        <Blob x={-60} y={350} size={360} opacity={0.1} />
        <Tag>● 3D NAVIGACIJA I INTERAKTIVNOST</Tag>
        <div style={{ fontSize: 34, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 8 }}>
          Istraži Sarajevo u <Grad>trećoj dimenziji</Grad>
        </div>
        <div style={{ color: TEXT_MID, fontSize: 13, marginBottom: 22, maxWidth: 780 }}>
          Saraya Explore ne nudi samo tekst i slike. Svaki lokalitet ima vlastiti <strong style={{ color: "white" }}>interaktivni 3D model</strong> koji se može slobodno istraživati na telefonu, tabletu ili računaru — kao da držiš sarajevski monument u rukama.
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {/* 3D feature cards */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
            {[
              { icon: "🔄", color: "#8B5CF6", title: "360° Rotacija", body: "Turist može rotirati 3D model lokaliteta u svim pravcima prstom ili mišem. Vidi svaki detalj arhitekture." },
              { icon: "🔍", color: "#3B82F6", title: "Zumiranje i istraživanje", body: "Zumi do najsitnijeg detalja — dekorativnih ukrasa Vijećnice, klesanog kamena Seblja, plamena Vječne Vatre." },
              { icon: "💡", color: BLUE, title: "Opisane točke interesa", body: "Na 3D modelu su označene istaknute tačke — klikni na bilo koji dio i dobij opis. Interaktivna historija." },
              { icon: "📱", color: "#10B981", title: "AR mogućnost (proširenje)", body: "Buduća verzija može koristiti kameru telefona za prikaz 3D modela ispred stvarnog lokaliteta — augmentirana stvarnost." },
            ].map(({ icon, color, title, body }) => (
              <div key={title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px 15px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ color: "white", fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{title}</div>
                  <div style={{ color: TEXT_MID, fontSize: 11, lineHeight: 1.55 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Center phones */}
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <PhoneMock scale={0.84}>
              <iframe
                ref={sebiljRef}
                src="/admin/preview"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 320,
                  height: 693,
                  border: "none",
                  background: BG,
                  transform: `scale(${(220 * 0.84) / 320})`,
                  transformOrigin: "top left",
                }}
                title="Sebilj 3D model"
                onLoad={() => sendLoc(sebiljRef, "1")}
              />
            </PhoneMock>
          </div>

          {/* Right info */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 14, padding: "15px 16px" }}>
              <div style={{ color: PURPLE, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>🌐 GLB format — brzo i kvalitetno</div>
              <div style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.6 }}>Koristimo moderni GLB format s ugrađenim teksturama. Učitava se brzo čak i na mobilnom internetu, bez instalacije posebnih plugina.</div>
            </div>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "15px 16px" }}>
              <div style={{ color: "white", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>📐 Radi na svim uređajima</div>
              <div style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.6 }}>iOS, Android, Windows, Mac — 3D preglednik radi u svim modernim pretraživačima. Nema ograničenja ni prepreka.</div>
            </div>
            <div style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: "15px 16px" }}>
              <div style={{ color: BLUE, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>🎨 Naš tim pravi modele</div>
              <div style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.6 }}>Svaki 3D model je ručno izrađen i optimiziran za naše lokalitete — jedinstven prikaz koji ne postoji nigdje drugdje na internetu.</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* ══════════════ SLAJD 9 — KOLEKCIJA & NAGRADE ════════════════════════ */}
      <Slide n={9}>
        <Blob x={600} y={-40} size={480} opacity={0.12} />
        <Tag gold>● KOLEKCIJA I NAGRADE</Tag>
        <div style={{ fontSize: 34, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 8 }}>
          Nagrade koje <GG>pamte cijeli život</GG>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: TEXT_MID, fontSize: 13, lineHeight: 1.75, marginBottom: 4 }}>
              Svaki posjećeni lokalitet donosi <strong style={{ color: "white" }}>digitalnu figurinu</strong> — 3D model koji ostaje u kolekciji zauvijek. To nije samo igra — to je <strong style={{ color: BLUE }}>digitalna uspomena</strong> na trenutak kada si prvi put stao ispred tog mjesta i osjetio njegovu historiju.
            </div>
            {[
              { icon: "🏛️", color: "#8B5CF6", title: "Digitalna figurina lokaliteta", body: "Rotabilni 3D model koji turist može otvoriti i pokazati prijateljima: 'Ovo sam ja prikupio u Sarajevu.' Personalizovana, jedinstven." },
              { icon: "🕰️", color: BLUE, title: "Datum i trenutak prvog susreta", body: "Svaka figurina u kolekciji nosi datum i sat kada je turist po prvi put stao pred taj lokalitet. 'Sebilj — 11. maja 2026., 14:32.' Uspomena ugravirano u digitalnom modelu." },
              { icon: "👕", color: "#F472B6", title: "Fizičke nagrade — majica, razglednica, keychain", body: "Ko sakupi kompletnu kolekciju, može odabrati fizičku nagradu: Saraya majica, razglednica s potpisom, mini figurica lokaliteta ili nešto sasvim posebno što sami odredimo." },
              { icon: "☕", color: "#10B981", title: "Nagrada u Saraya kafeu", body: "Besplatan napitak ili popust za turiste koji završe kolekciju. Oni se fizički vraćaju k nama — i troše novac. Krug se zatvara." },
            ].map(({ icon, color, title, body }) => (
              <div key={title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "13px 15px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ color: "white", fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{title}</div>
                  <div style={{ color: TEXT_MID, fontSize: 11, lineHeight: 1.55 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Collection visual */}
          <div style={{ width: 380, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "18px" }}>
              <div style={{ color: TEXT_DIM, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>TVOJA KOLEKCIJA — 4/6</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
                {landmarks.map((lm, i) => (
                  <div key={lm.name} style={{ position: "relative" }}>
                    <div style={{ width: "100%", paddingTop: "100%", borderRadius: 12, overflow: "hidden", border: `2px solid ${i < 4 ? PURPLE : BORDER}`, opacity: i < 4 ? 1 : 0.25, position: "relative" }}>
                      <img src={lm.icon} alt={lm.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      {i < 4 && <div style={{ position: "absolute", bottom: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 700 }}>✓</div>}
                      {i === 1 && <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(14,11,26,0.9)", borderRadius: 4, padding: "2px 5px", color: TEXT_DIM, fontSize: 8 }}>11.5.2026</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: "66%", height: "100%", background: `linear-gradient(90deg, ${PURPLE}, ${BLUE})`, borderRadius: 99 }} />
              </div>
              <div style={{ color: TEXT_DIM, fontSize: 10, marginTop: 5 }}>66% kolekcije · još 2 do nagrade</div>
            </div>
            <div style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ color: BLUE, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>🏆 KOMPLETNA KOLEKCIJA = SARAYA NAGRADA</div>
              <div style={{ color: TEXT_MID, fontSize: 11, lineHeight: 1.6 }}>Majica, razglednica, fizička figurica ili besplatan napitak — turist bira nagradu koja mu znači. Saraya postaje zauvijek dio te uspomene.</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* ══════════════ SLAJD 10 — VIŠEJEZIČNOST ══════════════════════════════ */}
      <Slide n={10}>
        <Blob x={700} y={-80} size={450} opacity={0.12} />
        <Blob x={-100} y={300} size={380} opacity={0.1} />
        <div style={{ display: "flex", gap: 52, height: "100%", alignItems: "center" }}>
          <div style={{ flex: "0 0 410px" }}>
            <Tag>● VIŠEJEZIČNOST</Tag>
            <H2>Govorimo jezik <Grad>svakog turiste</Grad></H2>
            <div style={{ color: TEXT_MID, fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              Sarajevo godišnje posjećuje <strong style={{ color: "white" }}>više od milion turista</strong> — iz Europe, Bliskog istoka, Azije i cijeloga svijeta. Saraya Explore automatski prepoznaje jezik uređaja i prikazuje sav sadržaj bez ikakvog podešavanja.
            </div>
            <div style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: "13px 16px", marginBottom: 16 }}>
              <div style={{ color: BLUE, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>✨ PREDNOST: Neograničen broj jezika</div>
              <div style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.6 }}>Trenutno podržavamo 9 najzastupljenijih jezika turista u Sarajevu — ali arhitektura aplikacije omogućava dodavanje bilo kojeg novog jezika za samo nekoliko minuta, bez programera.</div>
            </div>
            {[
              { icon: "🤖", text: "Automatska detekcija jezika uređaja" },
              { icon: "✍️", text: "Prijevodi se uređuju direktno iz admin panela" },
              { icon: "⚡", text: "Promjena odmah vidljiva svim korisnicima — real-time" },
              { icon: "🌙", text: "Podrška za RTL pisma (arapski, hebrejski...)" },
              { icon: "🌍", text: "Svaki novi partner može imati vlastiti jezik" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 11, color: TEXT_MID, fontSize: 12, marginBottom: 9 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>{text}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 11 }}>
            {langs.map(l => (
              <div key={l.code} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "13px 15px", display: "flex", alignItems: "center", gap: 11 }}>
                <img src={`https://flagcdn.com/w40/${l.flag}.png`} srcSet={`https://flagcdn.com/w80/${l.flag}.png 2x`} width={26} height={20} alt={l.label} style={{ borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />
                <div>
                  <div style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{l.label}</div>
                  <div style={{ color: TEXT_DIM, fontSize: 10, marginTop: 1 }}>{l.tourists}</div>
                </div>
              </div>
            ))}
            <div style={{ background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 14, padding: "13px 15px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ color: PURPLE, fontSize: 11, fontWeight: 700, textAlign: "center" }}>➕ Novi jezik<br/>po potrebi</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* ══════════════ SLAJD 11 — PREDNOSTI ZA NAS ══════════════════════════ */}
      <Slide n={11}>
        <Blob x={-60} y={200} size={400} opacity={0.12} gold />
        <Blob x={900} y={-60} size={380} opacity={0.09} />
        <Tag gold>● PREDNOSTI ZA NAS — SARAYA</Tag>
        <div style={{ fontSize: 34, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 22 }}>
          Zašto je ovo dobro za <GG>naš biznis?</GG>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 13 }}>
          {[
            { icon: "📡", color: BLUE, title: "Naš Hotspot — ulazna tačka", body: "Svaki turist koji se spoji na naš WiFi vidi Saraya Explore. Captive portal ih dovodi direktno k nama — naš brend je prva digitalna stvar s kojom se susreću u Sarajevu." },
            { icon: "🔁", color: PURPLE, title: "Turist se fizički vraća", body: "Nagrada za kompletnu kolekciju — napitak, popust, majica — tjera turiste da se vrate u Saraya kafo. Nisu više anonimni prolaznici, već naši gosti." },
            { icon: "📊", color: "#60A5FA", title: "Podaci koji vrijede", body: "Vidimo iz kojih zemalja dolaze naši gosti, koji lokaliteti ih najviše privlače, kada su aktivni. Koristimo te podatke za marketing i unapređenje ponude." },
            { icon: "🌐", color: "#34D399", title: "Višejezična usluga bez napora", body: "Turisti dobijaju uslugu na svom maternjem jeziku. Arapin, Nijemac i Bosanac — svako na svom. Mi to ne moramo ručno raditi — aplikacija to radi automatski." },
            { icon: "📱", color: "#F472B6", title: "Direktan kanal komunikacije", body: "Kroz aplikaciju možemo objaviti posebne ponude, sezonske akcije ili pozive na događaje. Imamo direktan dodir s korisnicima koji su se registrirali." },
            { icon: "🏆", color: "#FB923C", title: "Naš brend na karti Sarajeva", body: "Saraya Explore nije samo alat — to je naš doprinos gradu. Pozicioniramo se kao kompanija koja čuva i promovira sarajevsku historiju i kulturu." },
          ].map(({ icon, color, title, body }) => (
            <div key={title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 17, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}20`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{title}</div>
              <div style={{ color: TEXT_MID, fontSize: 11, lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* ══════════════ SLAJD 12 — EKSPANZIJA I PARTNERI ════════════════════ */}
      <Slide n={12}>
        <Blob x={-60} y={-40} size={420} opacity={0.12} />
        <Blob x={820} y={300} size={380} opacity={0.1} gold />
        <Tag gold>● EKSPANZIJA I PARTNERSTVA</Tag>
        <div style={{ fontSize: 34, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 8 }}>
          Saraya Explore nije ograničen <GG>samo na nas</GG>
        </div>
        <div style={{ color: TEXT_MID, fontSize: 13, marginBottom: 22, maxWidth: 780 }}>
          Platforma koju smo izgradili može se primijeniti na bilo koji lokalitet, u bilo kojoj gradskoj četvrti, za bilo kojeg klijenta — sa ili bez našeg Hotspota. To je naš proizvod koji možemo prodati, iznajmiti ili podariti gradu.
        </div>
        <div style={{ display: "flex", gap: 15 }}>
          {[
            { icon: "🗺️", color: "#8B5CF6", title: "Nova mjesta — bez Hotspota", body: "Aplikacija radi potpuno neovisno od WiFi mreže. Dodamo nove lokalitete u bilo kojoj gradskoj četvrti — Bjelave, Kovači, Ilidža, Trebević — i turisti ih otkrivaju sami.", tag: "Proširenje" },
            { icon: "🏙️", color: BLUE, title: "Visit Sarajevo — partnerstvo", body: "Saraya Explore je savršen alat za Visit Sarajevo, s kojima već surađujemo. Projektujemo i isporučujemo im platformu pod njihovim brendom — ili im nudimo white-label verziju.", tag: "Klijent" },
            { icon: "🏨", color: "#60A5FA", title: "Hoteli i turoperateri", body: "Sarajevski hoteli, turističke agencije i ture mogu koristiti Saraya Explore kao digitalni compan za svoje goste. Svaki hotel ima vlastiti onboarding.", tag: "B2B" },
            { icon: "🎭", color: "#34D399", title: "Festivali i eventi", body: "Sarajevo Film Festival, Jazz Fest, Baščaršijske noći — svaki event može imati vlastitu Saraya Explore tematsku eksploraciju gradskih kutaka.", tag: "Sezonski" },
          ].map(({ icon, color, title, body, tag }) => (
            <div key={title} style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 17, padding: "20px 17px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
                <div style={{ background: `${color}18`, border: `1px solid ${color}36`, borderRadius: 99, padding: "3px 10px", color, fontSize: 10, fontWeight: 700 }}>{tag}</div>
              </div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{title}</div>
              <div style={{ color: TEXT_MID, fontSize: 11, lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <span style={{ color: TEXT_MID, fontSize: 13 }}>
            <strong style={{ color: BLUE }}>Mi smo graditelji platforme.</strong> Saraya Explore je naš intelektualni proizvod — dizajniramo, isporučujemo i održavamo ga za sebe ili za klijenta. Svaki grad koji želi nešto ovako, mora doći do nas.
          </span>
        </div>
      </Slide>

      {/* ══════════════ SLAJD 13 — POTPUNA INOVACIJA ════════════════════════ */}
      <Slide n={13}>
        <Blob x={400} y={80} size={600} opacity={0.1} />
        <Blob x={-80} y={-60} size={380} opacity={0.12} gold />
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Tag gold>● INOVACIJA BEZ PRESEDANA</Tag>
          <div style={{ fontSize: 40, fontWeight: 800, color: "white", letterSpacing: "-1.5px" }}>
            Nijedan grad na svijetu <GG>nema ovako nešto</GG>
          </div>
          <div style={{ color: TEXT_MID, fontSize: 14, marginTop: 10, maxWidth: 700, margin: "10px auto 0" }}>
            Kombinacija GPS check-in avanture, 3D modela, multimedijalnog sadržaja, Hotspot integracije i višejezičnosti ne postoji nigdje na ovaj način.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
          {[
            { icon: "🛰️", title: "GPS verifikacija", body: "Mora se fizički biti na lokaciji — nema varanja, nema skipanja. Autentično iskustvo.", color: PURPLE },
            { icon: "🎮", title: "Gamifikacija historije", body: "Sakupljanje, progres, nagrade — turizam pretvoren u igru za odrasle.", color: BLUE },
            { icon: "🌐", title: "Captive Portal ulaz", body: "Jedini grad gdje WiFi prijava znači ulaz u interaktivnu historijsku avanturu.", color: "#60A5FA" },
            { icon: "🏺", title: "3D digitalna baština", body: "Historijska mjesta žive kao 3D modeli u džepu — dostupno svima, zauvijek.", color: "#34D399" },
          ].map(({ icon, title, body, color }) => (
            <div key={title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 17, padding: "22px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div>
              <div style={{ color, fontSize: 13, fontWeight: 700, marginBottom: 7 }}>{title}</div>
              <div style={{ color: TEXT_MID, fontSize: 11, lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1, background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ color: PURPLE, fontSize: 12, fontWeight: 700, marginBottom: 5 }}>🌍 Šta ima u ostalim gradovima?</div>
            <div style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.65 }}>Postoje audio-ture (aplikacije kao Rick Steves), AR ture (ARCity), GPS igre (Pokémon Go logika). Ali nitko nije spojio sve to s Hotspot integracijom, 3D kolekcijom kao digitalnom baštinom i fizičkim nagradama — u jednoj, besplatnoj, višejezičnoj web-aplikaciji.</div>
          </div>
          <div style={{ flex: 1, background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ color: BLUE, fontSize: 12, fontWeight: 700, marginBottom: 5 }}>🏅 Sarajevo može biti pionir</div>
            <div style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.65 }}>Saraya Explore postavlja standard za digitalni urbani turizam. Kad drugi gradovi krenu kopirati, mi ćemo već biti godinama ispred — s iskustvom, brendom i infrastrukturom. Sarajevo vodi, ostali prate.</div>
          </div>
        </div>
      </Slide>

      {/* ══════════════ SLAJD 14 — PLAN IMPLEMENTACIJE ═══════════════════════ */}
      <Slide n={14}>
        <Blob x={-60} y={-40} size={400} opacity={0.12} gold />
        <Blob x={820} y={300} size={360} opacity={0.09} />
        <Tag gold>● PLAN IMPLEMENTACIJE</Tag>
        <div style={{ fontSize: 34, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 22 }}>
          Od danas do <GG>lansiranja</GG>
        </div>
        <div style={{ display: "flex", gap: 13, marginBottom: 18 }}>
          {[
            { phase: "Faza 1", time: "Sedmica 1–2", title: "Postavljanje i branding", items: ["Finalni Saraya branding i dizajn", "Captive portal konfiguracija na Hotspotu", "Test s prvim turistima i feedback", "Gmail/Google prijava aktivacija"], color: PURPLE },
            { phase: "Faza 2", time: "Sedmica 3–4", title: "Sadržaj i prijevodi", items: ["Unos svih historijskih priča", "Prijevodi na svih 9+ jezika", "Upload galerija, videa i 3D modela", "Obuka Saraya tima za admin panel"], color: "#60A5FA" },
            { phase: "Faza 3", time: "Sedmica 5–6", title: "Lansiranje i promocija", items: ["Javno lansiranje aplikacije", "Promocija na socijalnim mrežama", "Aktivacija nagrade za kompletnu kolekciju", "Analitika — praćenje prvih rezultata"], color: BLUE },
          ].map(ph => (
            <div key={ph.phase} style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 17, padding: "18px 17px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                <div style={{ background: `${ph.color}22`, border: `1px solid ${ph.color}44`, borderRadius: 99, padding: "3px 11px", color: ph.color, fontSize: 10, fontWeight: 700 }}>{ph.phase}</div>
                <div style={{ color: TEXT_DIM, fontSize: 10 }}>{ph.time}</div>
              </div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 11 }}>{ph.title}</div>
              {ph.items.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 7, color: TEXT_MID, fontSize: 11, marginBottom: 7, lineHeight: 1.45 }}>
                  <span style={{ color: ph.color, marginTop: 1, flexShrink: 0 }}>▸</span>{item}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 13 }}>
          {[
            { icon: "🚀", text: "Aplikacija je već razvijena i funkcionalna — implementacija je brza i bez tehničkih prepreka", color: PURPLE },
            { icon: "👥", text: "Naš tim rukuje svim sadržajem — ne trebamo vanjske programere za svakodnevne izmjene", color: BLUE },
            { icon: "📈", text: "Vidljivi rezultati od prvog mieseca — povećan promet, prepoznatljivost i povratak turista", color: "#34D399" },
          ].map(({ icon, text, color }) => (
            <div key={text} style={{ flex: 1, background: `${color}0F`, border: `1px solid ${color}30`, borderRadius: 13, padding: "13px 15px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ color: TEXT_MID, fontSize: 12, lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </Slide>

      {/* ══════════════ SLAJD 15 — ZAKLJUČAK / CTA ═══════════════════════════ */}
      <Slide n={15} noPad>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 70% at 50% 60%, rgba(48,128,255,0.18) 0%, rgba(139,92,246,0.14) 50%, transparent 70%), #0D0D12" }} />
        <GridLines />
        <Blob x={-80} y={400} size={420} opacity={0.18} />
        <Blob x={880} y={-60} size={460} opacity={0.14} gold />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${PURPLE}, ${BLUE}, transparent)` }} />
        <div style={{ position: "absolute", top: 28, right: 40, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: TEXT_DIM, fontSize: 11, letterSpacing: "0.1em", fontWeight: 600 }}>POWERED BY</span>
          <SarayaLogo size={13} />
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 99, padding: "5px 18px", color: BLUE, fontSize: 11, fontWeight: 700, letterSpacing: "0.13em", marginBottom: 22 }}>
            ● SARAYA EXPLORE — DIGITALNA BUDUĆNOST SARAJEVA
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: "white", letterSpacing: "-1.5px", lineHeight: 1.1, textAlign: "center", marginBottom: 6 }}>Sarajevo zaslužuje</div>
          <div style={{ fontSize: 52, fontWeight: 900, background: `linear-gradient(90deg, ${PURPLE}, #A78BFA, ${BLUE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1.5px", lineHeight: 1.1, textAlign: "center", marginBottom: 20 }}>ovaj doživljaj.</div>
          <div style={{ color: TEXT_MID, fontSize: 15, textAlign: "center", marginBottom: 8, maxWidth: 600, lineHeight: 1.75 }}>
            Saraya Explore je <strong style={{ color: "white" }}>most između turista i duše Sarajeva</strong> — izgrađen na našem Hotspotu, s našim brendom, za naš grad.
          </div>
          <div style={{ color: TEXT_MID, fontSize: 13, textAlign: "center", marginBottom: 30, maxWidth: 540, lineHeight: 1.7 }}>
            Svaki turist koji se spoji na naš WiFi postaje ambasador Sarajeva, naš gost — i nosi uspomenu zauvijek.
          </div>
          <div style={{ display: "flex", gap: 13, marginBottom: 32 }}>
            <div style={{ background: `linear-gradient(135deg, ${PURPLE}, ${BLUE})`, borderRadius: 14, padding: "13px 28px", color: "white", fontSize: 14, fontWeight: 700 }}>
              🚀 Krećemo zajedno
            </div>
            <div style={{ background: BLUE_DIM, border: `1px solid ${BLUE_BORDER}`, borderRadius: 14, padding: "13px 28px", color: BLUE, fontSize: 14, fontWeight: 700 }}>
              💛 github.com/AfanKulaglic/sarajevo-visit
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 28 }}>
            {landmarks.map(lm => <span key={lm.name} title={lm.name}>{lm.emoji}</span>)}
          </div>
        </div>
        <RainbowBar />
      </Slide>
    </div>
  );
}
