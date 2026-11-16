import { z } from "zod";
import { guarded, json, lat, lng, upstream } from "../lib/http.js";

const schema = z.object({
  q: z.string().trim().min(2).max(80),
  lat: lat.optional(),
  lng: lng.optional(),
});

const nominatim = z.array(
  z.object({
    place_id: z.number(),
    display_name: z.string(),
    name: z.string().optional(),
    lat: z.string(),
    lon: z.string(),
    type: z.string().optional(),
    category: z.string().optional(),
  }),
);

export const GET = guarded(schema, async ({ q }) => {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q,
    format: "jsonv2",
    countrycodes: "ke",
    limit: "8",
    addressdetails: "0",
  }).toString();
  const rows = nominatim.parse(await upstream(url.toString()));
  const results = rows.map((r) => ({
    id: String(r.place_id),
    name: r.name?.trim() || r.display_name.split(",")[0]!.trim(),
    subtitle: r.display_name.split(",").slice(1, 3).join(",").trim(),
    lat: Number(r.lat),
    lng: Number(r.lon),
    kind: r.type ?? r.category ?? "place",
  }));
  return json({ results }, 200, 86_400);
});
