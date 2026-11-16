import { z } from "zod";
import { guarded, json, lat, lng, upstream } from "../lib/http.js";

const schema = z.object({ lat, lng });

const forecast = z.object({
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_probability_max: z.array(z.number().nullable()),
    precipitation_sum: z.array(z.number().nullable()),
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
    uv_index_max: z.array(z.number().nullable()),
  }),
});

const air = z.object({ current: z.object({ us_aqi: z.number().nullable() }) });

export const GET = guarded(schema, async ({ lat, lng }) => {
  // Round to ~1 km so the edge cache is shared and exact positions are not forwarded.
  const la = lat.toFixed(2);
  const lo = lng.toFixed(2);
  const [f, a] = await Promise.all([
    upstream(
      `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&timezone=auto&forecast_days=7&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max`,
    ),
    upstream(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${la}&longitude=${lo}&current=us_aqi`,
    ).catch(() => null),
  ]);
  const d = forecast.parse(f).daily;
  const aqi = a ? air.safeParse(a) : null;
  const days = d.time.map((date, i) => ({
    date,
    code: d.weather_code[i] ?? 0,
    maxC: d.temperature_2m_max[i] ?? 0,
    minC: d.temperature_2m_min[i] ?? 0,
    rainPct: d.precipitation_probability_max[i] ?? 0,
    rainMm: d.precipitation_sum[i] ?? 0,
    sunrise: d.sunrise[i] ?? "",
    sunset: d.sunset[i] ?? "",
    uv: d.uv_index_max[i] ?? 0,
  }));
  return json({ days, aqi: aqi?.success ? aqi.data.current.us_aqi : null }, 200, 3600);
});
