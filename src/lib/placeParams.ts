import { z } from 'zod';

/** A place passed between screens as route params. Validated on arrival. */
const schema = z.object({
  name: z.string().min(1).max(80),
  subtitle: z.string().max(120).default(''),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  slug: z.string().max(80).optional(),
});

export type PlaceParams = z.infer<typeof schema>;

export const parsePlaceParams = (raw: unknown): PlaceParams | null => {
  const parsed = schema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

export const toPlaceParams = (p: PlaceParams): Record<string, string> => ({
  name: p.name,
  subtitle: p.subtitle,
  lat: String(p.lat),
  lng: String(p.lng),
  ...(p.slug ? { slug: p.slug } : {}),
});
