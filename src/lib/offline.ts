import { OfflineManager, type LngLatBounds } from '@maplibre/maplibre-react-native';

import { cacheSetPins } from './cache';
import { MAP_STYLE_URL } from './config';
import { cacheKeys, fetchNearby, fetchRoute, fetchWeather, fetchWikiPlace } from './queries';
import { listStops, listTrips, setTripOffline, type Stop } from './trips';

const MIN_ZOOM = 5;
const MAX_ZOOM = 12;
const MAX_PACK_BYTES = 120 * 1024 * 1024;
/** Rough average for a vector tile plus its share of fonts and sprites. An estimate only. */
const BYTES_PER_TILE = 30 * 1024;
const PAD_DEG = 0.08;

export type PackPlan = { bounds: LngLatBounds; maxZoom: number; tiles: number; bytes: number };

function tileRange(bounds: LngLatBounds, z: number): number {
  const n = 2 ** z;
  const x = (lng: number) => Math.floor(((lng + 180) / 360) * n);
  const y = (lat: number) => {
    const r = (lat * Math.PI) / 180;
    return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n);
  };
  const [w, s, e, nth] = bounds;
  return (Math.abs(x(e) - x(w)) + 1) * (Math.abs(y(s) - y(nth)) + 1);
}

/** Bounding box around the route, with the deepest zoom that stays under the size cap. */
export function planPack(points: [number, number][]): PackPlan {
  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const bounds: LngLatBounds = [
    Math.min(...lngs) - PAD_DEG,
    Math.min(...lats) - PAD_DEG,
    Math.max(...lngs) + PAD_DEG,
    Math.max(...lats) + PAD_DEG,
  ];
  let maxZoom = MAX_ZOOM;
  let tiles = 0;
  for (;;) {
    tiles = 0;
    for (let z = MIN_ZOOM; z <= maxZoom; z++) tiles += tileRange(bounds, z);
    if (tiles * BYTES_PER_TILE <= MAX_PACK_BYTES || maxZoom <= 8) break;
    maxZoom -= 1;
  }
  return { bounds, maxZoom, tiles, bytes: tiles * BYTES_PER_TILE };
}

export const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${Math.round(bytes / (1024 * 1024))} MB`;

function keysFor(stops: Stop[]): string[] {
  const keys = stops.flatMap((s) => [
    cacheKeys.weather(s),
    cacheKeys.nearby(s),
    cacheKeys.place(s, s.storySlug ? undefined : s.name),
  ]);
  if (stops.length >= 2) keys.push(cacheKeys.route(stops));
  return keys;
}

/** Re-pins the cache rows of every offline trip, so "clear cache" never breaks a saved trip. */
async function repin() {
  const offline = (await listTrips()).filter((t) => t.offlineAt);
  const keys: string[] = [];
  for (const t of offline) keys.push(...keysFor(await listStops(t.id)));
  await cacheSetPins(keys);
}

async function deletePackFor(tripId: string) {
  const packs = await OfflineManager.getPacks();
  await Promise.all(
    packs.filter((p) => p.metadata.tripId === tripId).map((p) => OfflineManager.deletePack(p.id)),
  );
}

/**
 * Saves everything a trip needs: route, forecast snapshot, nearby places and place
 * summaries go into the pinned SQLite cache, and map tiles for the route corridor go
 * into a MapLibre offline pack. Resolves when the map download completes.
 */
export async function saveTripOffline(
  tripId: string,
  stops: Stop[],
  plan: PackPlan,
  onProgress: (percent: number) => void,
): Promise<void> {
  if (stops.length >= 2) await fetchRoute(stops);
  await Promise.all(
    stops.flatMap((s) => [
      fetchWeather(s.lat, s.lng),
      // Extras are nice to have offline, but a trip is still usable without them.
      fetchNearby(s.lat, s.lng).catch(() => null),
      fetchWikiPlace(s.lat, s.lng, s.storySlug ? undefined : s.name).catch(() => null),
    ]),
  );

  await deletePackFor(tripId);
  await new Promise<void>((resolve, reject) => {
    OfflineManager.createPack(
      {
        mapStyle: MAP_STYLE_URL,
        bounds: plan.bounds,
        minZoom: MIN_ZOOM,
        maxZoom: plan.maxZoom,
        metadata: { tripId },
      },
      (_pack, status) => {
        onProgress(Math.round(status.percentage));
        if (status.state === 'complete') resolve();
      },
      (_pack, error) => reject(new Error(error.message)),
    ).catch(reject);
  });

  await setTripOffline(tripId, Date.now());
  await repin();
}

export async function removeTripOffline(tripId: string) {
  await deletePackFor(tripId);
  await setTripOffline(tripId, null);
  await repin();
}

export async function offlineStorageBytes(): Promise<number> {
  const packs = await OfflineManager.getPacks();
  const statuses = await Promise.all(packs.map((p) => p.status()));
  return statuses.reduce((sum, s) => sum + s.completedResourceSize, 0);
}

export const removeAllOfflineMaps = () => OfflineManager.resetDatabase();
