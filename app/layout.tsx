import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GameProvider } from "@/context/GameContext";
import { LanguageProvider } from "@/context/LanguageContext";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Saraya Hotspot",
  description: "Explore Sarajevo and collect wolves",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Saraya Hotspot",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={geist.className} suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <GameProvider>{children}</GameProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
