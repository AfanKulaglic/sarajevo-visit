"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { User } from "@/lib/storage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? { id: firebaseUser.uid, email: firebaseUser.email || "" } : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        return "Invalid email or password.";
      }
      return "Sign in failed. Please try again.";
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create the user record in RTDB (collectedItems starts empty)
      await set(ref(db, `users/${cred.user.uid}`), { email, collectedItems: {} });
      return null;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") return "An account with this email already exists.";
      if (code === "auth/weak-password") return "Password should be at least 6 characters.";
      return "Registration failed. Please try again.";
    }
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

