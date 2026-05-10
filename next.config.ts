import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Leaflet CSS to be imported in client components
  transpilePackages: ["leaflet"],
  // Allow mobile/network device access in dev
  allowedDevOrigins: ["192.168.1.46", "https://192.168.1.46"],
};

export default nextConfig;
