"use client";
import { useEffect, useRef } from "react";
import { Location } from "@/lib/locations";
import { useLanguage } from "@/context/LanguageContext";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  rot: number; rotV: number;
  shape: "rect" | "circle";
  alpha: number;
}

interface Props {
  loc: Location;
  collectedCount: number;
  totalCount: number;
  onViewDetails: () => void;
  onClose: () => void;
}

export default function DiscoveryCelebration({ loc, collectedCount, totalCount, onViewDetails, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#8b5cf6", "#c084fc", "#f0abfc", "#fbbf24", "#ffffff", "#a78bfa", "#ec4899", "#60a5fa"];
    const particles: Particle[] = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height * 0.7,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 3,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.18,
      shape: Math.random() > 0.4 ? "rect" : "circle",
      alpha: 1,
    }));

    let frame: number;
    let tick = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;
        p.vy += 0.04;
        if (tick > 150) p.alpha = Math.max(0, p.alpha - 0.016);
        if (p.alpha <= 0) continue;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (particles.some((p) => p.alpha > 0)) {
        frame = requestAnimationFrame(draw);
      }
    }

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  const progress = totalCount > 0 ? collectedCount / totalCount : 0;
  const remaining = totalCount - collectedCount;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 90,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Canvas confetti */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />

      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(7,4,13,0.84)", backdropFilter: "blur(6px)" }} />

      {/* Card */}
      <div
        style={{
          position: "relative",
          background: "#0E0B1A",
          border: "1px solid rgba(139,92,246,0.35)",
          borderRadius: "24px",
          padding: "32px 24px 28px",
          width: "100%",
          maxWidth: "340px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 0 60px rgba(139,92,246,0.2), 0 24px 48px rgba(0,0,0,0.55)",
        }}
      >
        {/* Unlock badge */}
        <div
          style={{
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.4)",
            borderRadius: "999px",
            padding: "5px 16px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#c084fc",
            textTransform: "uppercase",
          }}
        >
          ✦ {t("lbl_new_unlocked")}
        </div>

        {/* Icon */}
        <div
          style={{
            width: "96px", height: "96px",
            borderRadius: "50%",
            background: "rgba(139,92,246,0.12)",
            border: "2px solid rgba(139,92,246,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(139,92,246,0.45), 0 0 14px rgba(139,92,246,0.25)",
          }}
        >
          {loc.icon ? (
            <img src={loc.icon} alt="" style={{ width: "68px", height: "68px", objectFit: "contain" }} />
          ) : (
            <span style={{ fontSize: "44px" }}>{loc.emoji}</span>
          )}
        </div>

        {/* Name */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: "rgba(255,255,255,0.4)", fontSize: "11px",
              letterSpacing: "0.08em", textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            {t("lbl_discovered")}
          </p>
          <h2 style={{ color: "white", fontSize: "22px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
            {loc.name}
          </h2>
        </div>

        {/* Progress */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
              {remaining > 0
                ? `${remaining} ${t("lbl_landmarks_remaining")}`
                : t("lbl_all_discovered")}
            </span>
            <span style={{ color: "#c084fc", fontSize: "13px", fontWeight: 600 }}>
              {collectedCount} / {totalCount}
            </span>
          </div>
          <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)",
                borderRadius: "999px",
                transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={onViewDetails}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            color: "white",
            fontWeight: 700,
            fontSize: "15px",
            border: "none",
            cursor: "pointer",
            marginTop: "2px",
          }}
        >
          {t("btn_view_details")} →
        </button>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none",
            color: "rgba(255,255,255,0.28)", fontSize: "13px",
            cursor: "pointer", padding: "4px",
          }}
        >
          {t("btn_cancel")}
        </button>
      </div>
    </div>
  );
}
