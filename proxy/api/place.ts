import { z } from 'zod';
import { guarded, json, lat, lng, upstream } from '../lib/http.js';

const schema = z.object({ lat, lng, name: z.string().trim().max(80).optional() });

const geo = z.object({
  query: z.object({
    geosearch: z.array(z.object({ title: z.string(), dist: z.number() })),
  }),
});

const summary = z.object({
  title: z.string(),
  extract: z.string(),
  thumbnail: z.object({ source: z.string().url() }).optional(),
  content_urls: z.object({ desktop: z.object({ page: z.string().url() }) }),
});

export const GET = guarded(schema, async ({ lat, lng, name }) => {
  let title = name;
  if (!title) {
    const g = geo.parse(
      await upstream(
        `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat.toFixed(4)}%7C${lng.toFixed(4)}&gsradius=2000&gslimit=1&format=json`,
      ),
    );
    title = g.query.geosearch[0]?.title;
  }
  if (!title) return json({ place: null }, 200, 86_400);
  try {
    const s = summary.parse(
      await upstream(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(' ', '_'))}`,
      ),
    );
    return json(
      {
        place: {
          title: s.title,
          extract: s.extract,
          imageUrl: s.thumbnail?.source ?? null,
          url: s.content_urls.desktop.page,
        },
      },
      200,
      86_400,
    );
  } catch {
    return json({ place: null }, 200, 3600);
  }
});
