import { z } from "zod";
import { guarded, json, lat, lng, upstream } from "../lib/http.js";

export const maxDuration = 30;

const schema = z.object({
  lat,
  lng,
  radius: z.coerce.number().int().min(200).max(5000).default(2000),
});

const overpass = z.object({
  elements: z.array(
    z.object({
      id: z.number(),
      lat: z.number().optional(),
      lon: z.number().optional(),
      center: z.object({ lat: z.number(), lon: z.number() }).optional(),
      tags: z.record(z.string(), z.string()).optional(),
    }),
  ),
});

const KINDS = ["tourism", "amenity", "historic", "natural"] as const;

/**
 * Selective tag first, then name. Anchored regexes so Overpass can use its tag
 * index instead of scanning every named object in the radius.
 */
const FILTERS = [
  '["tourism"~"^(attraction|museum|viewpoint|zoo|gallery|hotel|camp_site|picnic_site)$"]',
  '["amenity"~"^(restaurant|cafe|fuel|hospital|pharmacy)$"]',
  '["historic"~"^(ruins|monument|memorial|archaeological_site|fort|castle|church)$"]',
  '["natural"~"^(peak|beach|waterfall|hot_spring)$"]',
];

// The public instance queues requests at busy times, so try the private.coffee
// mirror (formerly kumi.systems) first. Nearby is best effort either way.
const MIRRORS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

export const GET = guarded(schema, async ({ lat, lng, radius }) => {
  const la = Number(lat.toFixed(3));
  const lo = Number(lng.toFixed(3));
  const around = `(around:${radius},${la},${lo})`;
  const query = `[out:json][timeout:20];(${FILTERS.map(
    (f) => `nwr${around}${f}["name"];`,
  ).join("")});out center 40;`;

  let data: unknown;
  let lastError: unknown;
  for (const mirror of MIRRORS) {
    try {
      data = await upstream(
        mirror,
        {
          method: "POST",
          body: new URLSearchParams({ data: query }).toString(),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
        22_000,
      );
      lastError = undefined;
      break;
    } catch (e) {
      lastError = e;
    }
  }
  if (lastError) throw lastError;

  const parsed = overpass.parse(data);
  const places = parsed.elements.flatMap((e) => {
    const t = e.tags ?? {};
    const name = t.name;
    const pLat = e.lat ?? e.center?.lat;
    const pLng = e.lon ?? e.center?.lon;
    if (!name || pLat === undefined || pLng === undefined) return [];
    const kind = KINDS.map((k) => t[k]).find(Boolean) ?? "place";
    return [{ id: String(e.id), name, kind, lat: pLat, lng: pLng }];
  });
  return json({ places }, 200, 86_400);
});
