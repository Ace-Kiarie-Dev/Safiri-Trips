type LngLat = [number, number];
type Point = { lat: number; lng: number };

const R = 6371;
const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: Point, b: Point): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Nearest distance from a point to a route line, and how far along the line
 * that nearest spot is (0 at the start, 1 at the end). Uses an equirectangular
 * projection, which is plenty accurate at the scale of a road trip.
 */
export function distanceToRoute(point: Point, line: LngLat[]): { km: number; along: number } {
  if (line.length === 0) return { km: Infinity, along: 0 };
  const cosLat = Math.cos(toRad(point.lat));
  const px = point.lng * cosLat;
  const py = point.lat;

  let best = { d2: Infinity, cumAt: 0 };
  let cum = 0;
  const segLens: number[] = [];
  for (let i = 0; i < line.length - 1; i++) {
    const [lng1, lat1] = line[i]!;
    const [lng2, lat2] = line[i + 1]!;
    const ax = lng1 * cosLat;
    const ay = lat1;
    const bx = lng2 * cosLat;
    const by = lat2;
    const vx = bx - ax;
    const vy = by - ay;
    const len2 = vx * vx + vy * vy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len2));
    const cx = ax + t * vx;
    const cy = ay + t * vy;
    const d2 = (px - cx) ** 2 + (py - cy) ** 2;
    const segLen = Math.sqrt(len2);
    segLens.push(segLen);
    if (d2 < best.d2) best = { d2, cumAt: cum + t * segLen };
    cum += segLen;
  }
  if (line.length === 1) {
    const [lng, lat] = line[0]!;
    return { km: haversineKm(point, { lat, lng }), along: 0 };
  }
  // Degrees to km: one degree of latitude is about 111 km.
  const km = Math.sqrt(best.d2) * 111;
  return { km, along: cum === 0 ? 0 : best.cumAt / cum };
}
