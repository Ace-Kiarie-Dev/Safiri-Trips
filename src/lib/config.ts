/** Base URL of the Safiri proxy (Vercel). Set EXPO_PUBLIC_API_BASE_URL in .env. No secrets here. */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

/** OpenFreeMap vector style: no key. Check its offline terms before shipping map packs. */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export const PRIVACY_URL = 'https://nesturex.com/safiri-trips/privacy';

/** Kenya overview used before the user picks anything. [lng, lat] */
export const KENYA_CENTER: [number, number] = [37.9, 0.2];
export const KENYA_ZOOM = 5.2;

export const TTL = {
  weather: 60 * 60 * 1000,
  route: 7 * 24 * 60 * 60 * 1000,
  nearby: 7 * 24 * 60 * 60 * 1000,
  place: 30 * 24 * 60 * 60 * 1000,
  search: 24 * 60 * 60 * 1000,
  along: 7 * 24 * 60 * 60 * 1000,
} as const;
