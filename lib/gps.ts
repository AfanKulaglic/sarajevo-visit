export function isUserNearLocation(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters = 50
): boolean {
  const R = 6371e3;
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (targetLat * Math.PI) / 180;
  const Δφ = ((targetLat - userLat) * Math.PI) / 180;
  const Δλ = ((targetLng - userLng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusMeters;
}

export function getDistanceMeters(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number
): number {
  const R = 6371e3;
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (targetLat * Math.PI) / 180;
  const Δφ = ((targetLat - userLat) * Math.PI) / 180;
  const Δλ = ((targetLng - userLng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export type GpsPosition = {
  lat: number;
  lng: number;
};

export function getCurrentPosition(): Promise<GpsPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error("Location permission denied. Please enable it in your browser settings."));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable."));
            break;
          case err.TIMEOUT:
            reject(new Error("Location request timed out."));
            break;
          default:
            reject(new Error("An unknown error occurred."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
