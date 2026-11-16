import { apiGet, apiPost } from './api';
import { cachedFetch } from './cache';
import { TTL } from './config';
import {
  nearbyResponseSchema,
  placeResponseSchema,
  routeResponseSchema,
  searchResponseSchema,
  weatherResponseSchema,
} from './schemas';

const r2 = (n: number) => n.toFixed(2);
const r3 = (n: number) => n.toFixed(3);

type Point = { lat: number; lng: number };

/** Cache keys, shared with the offline bundle so it can pin exactly what a trip needs. */
export const cacheKeys = {
  weather: (p: Point) => `weather:${r2(p.lat)},${r2(p.lng)}`,
  nearby: (p: Point) => `nearby:${r3(p.lat)},${r3(p.lng)}`,
  place: (p: Point, name?: string) => `place:${name ?? `${r3(p.lat)},${r3(p.lng)}`}`,
  route: (points: Point[]) => `route:${points.map((p) => `${r3(p.lat)},${r3(p.lng)}`).join('|')}`,
};

export const searchPlaces = (q: string) =>
  cachedFetch(
    `search:${q.toLowerCase()}`,
    TTL.search,
    async () => (await apiGet('/api/search', { q }, searchResponseSchema)).results,
  );

export const fetchWeather = (lat: number, lng: number) =>
  cachedFetch(cacheKeys.weather({ lat, lng }), TTL.weather, () =>
    apiGet('/api/weather', { lat: r2(lat), lng: r2(lng) }, weatherResponseSchema),
  );

export const fetchNearby = (lat: number, lng: number) =>
  cachedFetch(
    cacheKeys.nearby({ lat, lng }),
    TTL.nearby,
    async () =>
      (await apiGet('/api/nearby', { lat: r3(lat), lng: r3(lng) }, nearbyResponseSchema)).places,
  );

export const fetchWikiPlace = (lat: number, lng: number, name?: string) =>
  cachedFetch(
    cacheKeys.place({ lat, lng }, name),
    TTL.place,
    async () =>
      (
        await apiGet(
          '/api/place',
          name ? { lat: r3(lat), lng: r3(lng), name } : { lat: r3(lat), lng: r3(lng) },
          placeResponseSchema,
        )
      ).place,
  );

export const fetchRoute = (points: Point[]) =>
  cachedFetch(cacheKeys.route(points), TTL.route, () =>
    apiPost(
      '/api/route',
      { points: points.map((p) => ({ lat: p.lat, lng: p.lng })) },
      routeResponseSchema,
    ),
  );
