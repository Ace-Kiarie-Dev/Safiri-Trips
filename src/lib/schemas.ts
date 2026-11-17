import { z } from 'zod';

export const placeResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  lat: z.number(),
  lng: z.number(),
  kind: z.string(),
});
export type PlaceResult = z.infer<typeof placeResultSchema>;
export const searchResponseSchema = z.object({ results: z.array(placeResultSchema) });

export const routeResponseSchema = z.object({
  distanceM: z.number(),
  durationS: z.number(),
  legs: z.array(z.object({ distanceM: z.number(), durationS: z.number() })),
  geometry: z.array(z.tuple([z.number(), z.number()])),
});
export type RouteData = z.infer<typeof routeResponseSchema>;

export const forecastDaySchema = z.object({
  date: z.string(),
  code: z.number(),
  maxC: z.number(),
  minC: z.number(),
  rainPct: z.number(),
  rainMm: z.number(),
  sunrise: z.string(),
  sunset: z.string(),
  uv: z.number(),
});
export type ForecastDay = z.infer<typeof forecastDaySchema>;
export const weatherResponseSchema = z.object({
  days: z.array(forecastDaySchema),
  aqi: z.number().nullable(),
});
export type WeatherData = z.infer<typeof weatherResponseSchema>;

export const nearbyPlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type NearbyPlace = z.infer<typeof nearbyPlaceSchema>;
export const nearbyResponseSchema = z.object({ places: z.array(nearbyPlaceSchema) });

export const alongPlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  lat: z.number(),
  lng: z.number(),
  imageUrl: z.string().nullable(),
});
export type AlongPlace = z.infer<typeof alongPlaceSchema>;
export const alongResponseSchema = z.object({ places: z.array(alongPlaceSchema) });

export const wikiPlaceSchema = z.object({
  title: z.string(),
  extract: z.string(),
  imageUrl: z.string().nullable(),
  url: z.string(),
});
export type WikiPlace = z.infer<typeof wikiPlaceSchema>;
export const placeResponseSchema = z.object({ place: wikiPlaceSchema.nullable() });
