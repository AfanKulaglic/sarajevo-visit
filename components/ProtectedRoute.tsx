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
        <div className="text-4xl">🐺</div>
        <span className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
