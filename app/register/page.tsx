"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const err = await register(email.trim().toLowerCase(), password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/map");
    }
  }

  return (
    <main className="min-h-screen bg-[#07040D] flex items-center justify-center p-5 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-sm relative anim-fade-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[20px] bg-purple-500/[0.08] border border-purple-500/[0.14] mb-4 overflow-hidden">
            <img src="/icons/logo.png" alt="Saraya Explore" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Sarajevo Hotspot</h1>
          <p className="text-white/35 text-sm mt-1.5">Start your journey through the city</p>
        </div>

        {/* Card */}
        <div className="bg-[#0E0B1A] rounded-2xl border border-white/[0.06] p-6 shadow-2xl shadow-black/60">
          <h2 className="text-white font-semibold text-[15px] mb-5">Create your account</h2>

          {error && (
            <div className="bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] rounded-xl px-4 py-3 mb-4 anim-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                suppressHydrationWarning
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-[0.08em] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                suppressHydrationWarning
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-purple-600 hover:bg-purple-500 disabled:bg-white/[0.06] disabled:text-white/25 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <><span className="spinner" /> Creating account…</> : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-sm mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

