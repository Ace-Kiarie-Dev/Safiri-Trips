import { z } from "zod";
import { guarded, json, lat, lng, upstream } from "../lib/http.js";

export const maxDuration = 30;

const schema = z.object({
  lat,
  lng,
  radius: z.coerce.number().int().min(200).max(5000).default(2000),
});

type Place = { id: string; name: string; kind: string; lat: number; lng: number };

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

const geosearch = z.object({
  query: z.object({
    geosearch: z.array(
      z.object({ pageid: z.number(), title: z.string(), lat: z.number(), lon: z.number() }),
    ),
  }),
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

/** Public Overpass instances are often at capacity. Try two, then give up on Overpass. */
const MIRRORS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

async function fromOverpass(la: number, lo: number, radius: number): Promise<Place[]> {
  const around = `(around:${radius},${la},${lo})`;
  const query = `[out:json][timeout:15];(${FILTERS.map((f) => `nwr${around}${f}["name"];`).join(
    "",
  )});out center 40;`;
  const errors: string[] = [];
  for (const mirror of MIRRORS) {
    try {
      const data = overpass.parse(
        await upstream(
          mirror,
          {
            method: "POST",
            body: new URLSearchParams({ data: query }).toString(),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          },
          12_000,
        ),
      );
      return data.elements.flatMap((e) => {
        const t = e.tags ?? {};
        const name = t.name;
        const pLat = e.lat ?? e.center?.lat;
        const pLng = e.lon ?? e.center?.lon;
        if (!name || pLat === undefined || pLng === undefined) return [];
        const kind = KINDS.map((k) => t[k]).find(Boolean) ?? "place";
        return [{ id: String(e.id), name, kind, lat: pLat, lng: pLng }];
      });
    } catch (e) {
      errors.push(e instanceof Error ? e.message.slice(0, 80) : "unknown");
    }
  }
  throw new Error(`overpass: ${errors.join(" | ")}`);
}

/** Notable places with a Wikipedia article. Thinner than OSM, but reliably available. */
async function fromWikipedia(la: number, lo: number, radius: number): Promise<Place[]> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${la}%7C${lo}` +
    `&gsradius=${Math.max(radius, 1000)}&gslimit=25&format=json`;
  const data = geosearch.parse(await upstream(url));
  return data.query.geosearch.map((g) => ({
    id: `wiki-${g.pageid}`,
    name: g.title,
    kind: "landmark",
    lat: g.lat,
    lng: g.lon,
  }));
}

export const GET = guarded(schema, async ({ lat, lng, radius }) => {
  const la = Number(lat.toFixed(3));
  const lo = Number(lng.toFixed(3));
  try {
    return json({ places: await fromOverpass(la, lo, radius), source: "osm" }, 200, 86_400);
  } catch {
    // Shorter cache so Overpass gets another chance once it has calmed down.
    return json({ places: await fromWikipedia(la, lo, radius), source: "wikipedia" }, 200, 3600);
  }
});
