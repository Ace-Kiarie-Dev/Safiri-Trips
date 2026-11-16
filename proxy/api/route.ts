import { z } from "zod";
import { fail, guarded, json, lat, lng, upstream } from "../lib/http.js";

const schema = z.object({
  points: z
    .array(z.object({ lat, lng }))
    .min(2)
    .max(12),
});

export const maxDuration = 30;

const ors = z.object({
  features: z.array(
    z.object({
      geometry: z.object({ coordinates: z.array(z.tuple([z.number(), z.number()]).rest(z.number())) }),
      properties: z.object({
        summary: z.object({ distance: z.number(), duration: z.number() }),
        segments: z.array(z.object({ distance: z.number(), duration: z.number() })),
      }),
    }),
  ),
});

export const POST = guarded(
  schema,
  async ({ points }) => {
    // All whitespace stripped: a key pasted into a dashboard can carry spaces
    // or line breaks, including in the middle of the value. A JWT has none.
    const key = process.env.ORS_API_KEY?.replace(/\s+/g, "");
    if (!key) return fail(503, "Routing unavailable");
    const body = JSON.stringify({ coordinates: points.map((p) => [p.lng, p.lat]) });
    const data = ors.parse(
      await upstream("https://api.heigit.org/openrouteservice/v2/directions/driving-car/geojson", {
        method: "POST",
        body,
        // The geojson endpoint answers with application/geo+json, so ask for it.
        headers: {
          Authorization: key,
          "Content-Type": "application/json",
          Accept: "application/geo+json, application/json",
        },
      }),
    );
    const f = data.features[0];
    if (!f) return fail(404, "No route found");
    return json(
      {
        distanceM: Math.round(f.properties.summary.distance),
        durationS: Math.round(f.properties.summary.duration),
        legs: f.properties.segments.map((s) => ({
          distanceM: Math.round(s.distance),
          durationS: Math.round(s.duration),
        })),
        geometry: f.geometry.coordinates.map((c) => [c[0], c[1]]),
      },
      200,
      86_400,
    );
  },
  "body",
);
