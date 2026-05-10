// Auth is handled by Firebase Auth (see context/AuthContext.tsx)
// Collection data lives in Firebase RTDB (see context/GameContext.tsx)
// This file keeps the shared User type for backward compatibility.

export interface User {
  id: string;
  email: string;
}

