import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAsm3xiBYRmG4S3W2QVmdywPtzfKBnEzts",
  authDomain: "bosnaespirits.firebaseapp.com",
  databaseURL: "https://bosnaespirits-default-rtdb.firebaseio.com",
  projectId: "bosnaespirits",
  storageBucket: "bosnaespirits.firebasestorage.app",
  messagingSenderId: "715547166322",
  appId: "1:715547166322:web:630e9442cd6265d84c24eb",
  measurementId: "G-ZVT0MERD1K",
};

// Avoid re-initializing on hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

// Analytics only on client (no SSR)
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
    isSupported().then((yes) => yes && getAnalytics(app));
  });
}
