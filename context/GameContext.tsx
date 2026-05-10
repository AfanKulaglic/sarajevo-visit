"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, set } from "firebase/database";
import { auth, db } from "@/lib/firebase";

// localStorage key used when there is no Firebase auth (dev bypass)
const BYPASS_KEY = "dev_collected_items";

interface GameContextValue {
  collectedItems: string[];
  collect: (rewardId: string) => void;
  hasCollected: (rewardId: string) => boolean;
  refreshCollection: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [collectedItems, setCollectedItems] = useState<string[]>([]);

  useEffect(() => {
    let rtdbUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (rtdbUnsub) { rtdbUnsub(); rtdbUnsub = null; }

      if (!firebaseUser) {
        // Dev bypass: load collected items from localStorage
        try {
          const stored = JSON.parse(localStorage.getItem(BYPASS_KEY) || "{}");
          setCollectedItems(Object.keys(stored));
        } catch {
          setCollectedItems([]);
        }
        return;
      }

      // Real Firebase user — subscribe to RTDB
      rtdbUnsub = onValue(
        ref(db, `users/${firebaseUser.uid}/collectedItems`),
        (snap) => {
          const val = snap.val();
          setCollectedItems(val ? Object.keys(val) : []);
        }
      );
    });

    return () => {
      authUnsub();
      if (rtdbUnsub) rtdbUnsub();
    };
  }, []);

  const collect = useCallback((rewardId: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      // Dev bypass: persist to localStorage and update state immediately
      try {
        const stored = JSON.parse(localStorage.getItem(BYPASS_KEY) || "{}");
        stored[rewardId] = true;
        localStorage.setItem(BYPASS_KEY, JSON.stringify(stored));
        setCollectedItems(Object.keys(stored));
      } catch {
        setCollectedItems((prev) => prev.includes(rewardId) ? prev : [...prev, rewardId]);
      }
      return;
    }
    // Real user — write to RTDB; onValue listener updates state automatically
    set(ref(db, `users/${firebaseUser.uid}/collectedItems/${rewardId}`), true);
  }, []);

  const hasCollected = useCallback(
    (rewardId: string) => collectedItems.includes(rewardId),
    [collectedItems]
  );

  const refreshCollection = useCallback(() => {}, []);

  return (
    <GameContext.Provider value={{ collectedItems, collect, hasCollected, refreshCollection }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
