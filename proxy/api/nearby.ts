import { z } from "zod";
import { guarded, json, lat, lng, upstream } from "../lib/http";

const schema = z.object({ lat, lng, radius: z.coerce.number().int().min(200).max(5000).default(2000) });

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

const KINDS = ["tourism", "amenity", "historic", "natural", "leisure"] as const;

export const GET = guarded(schema, async ({ lat, lng, radius }) => {
  const la = Number(lat.toFixed(3));
  const lo = Number(lng.toFixed(3));
  const q = `[out:json][timeout:12];(nwr(around:${radius},${la},${lo})["name"]["tourism"~"^(attraction|museum|viewpoint|zoo|gallery|hotel|camp_site|picnic_site)$"];nwr(around:${radius},${la},${lo})["name"]["amenity"~"^(restaurant|cafe|fuel|hospital|pharmacy)$"];nwr(around:${radius},${la},${lo})["name"]["historic"];nwr(around:${radius},${la},${lo})["name"]["natural"~"^(peak|beach|waterfall|hot_spring)$"];);out center 40;`;
  const data = overpass.parse(
    await upstream("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: new URLSearchParams({ data: q }).toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  );
  const places = data.elements.flatMap((e) => {
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
