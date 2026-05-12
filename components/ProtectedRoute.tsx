"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07040D] flex flex-col items-center justify-center gap-4">
        <img src="/icons/logo.png" alt="Saraya Explore" className="w-16 h-16 object-contain" />
        <span className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

