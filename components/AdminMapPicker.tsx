"use client";

import { useEffect, useRef } from "react";

interface AdminMapPickerProps {
  lat: number;
  lng: number;
  emoji: string;
  onPick: (lat: number, lng: number) => void;
}

export default function AdminMapPicker({ lat, lng, emoji, onPick }: AdminMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  const onPickRef = useRef(onPick);

  // Always keep callback ref fresh
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  // Initialize map once
  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || mapInstanceRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))">${emoji}</div>`,
        className: "",
        iconAnchor: [16, 32],
        iconSize: [32, 32],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      markerRef.current = marker;
      mapInstanceRef.current = map;

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const newLat = parseFloat(e.latlng.lat.toFixed(6));
        const newLng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        onPickRef.current(newLat, newLng);
      });
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        leafletRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker + pan when lat/lng change from the number inputs
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    mapInstanceRef.current.panTo([lat, lng]);
  }, [lat, lng]);

  // Update marker emoji when the emoji field changes
  useEffect(() => {
    if (!leafletRef.current || !markerRef.current) return;
    const L = leafletRef.current;
    const icon = L.divIcon({
      html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))">${emoji}</div>`,
      className: "",
      iconAnchor: [16, 32],
      iconSize: [32, 32],
    });
    markerRef.current.setIcon(icon);
  }, [emoji]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl overflow-hidden border border-gray-600"
      style={{ height: "220px" }}
    />
  );
}

