import { z } from 'zod';
import { guarded, json, lat, lng, upstream } from '../lib/http.js';

export const maxDuration = 30;

/** Sample points along a route, a handful at most. */
const schema = z.object({
  points: z.array(z.object({ lat, lng })).min(1).max(16),
  // Wikipedia caps geosearch at 10 km.
  radius: z.coerce.number().int().min(2000).max(10000).default(10000),
});

const geo = z.object({
  query: z
    .object({
      pages: z.record(
        z.string(),
        z.object({
          pageid: z.number(),
          title: z.string(),
          description: z.string().optional(),
          coordinates: z.array(z.object({ lat: z.number(), lon: z.number() })).optional(),
          thumbnail: z.object({ source: z.string() }).optional(),
        }),
      ),
    })
    .optional(),
});

/** Things that are places to live or pass through, not places to stop at. */
const NOT_A_STOP =
  /\b(town|village|city|constituency|county|ward|sub-?county|settlement|suburb|neighbou?rhood|school|university|college|hospital|airport|airstrip|railway|station|road|highway|company|church|diocese|river|stream|dam|power|mine|quarry|factory|prison|border|municipality|division|locality|human settlement|populated place|place in|location in|area in|region in|province)\b/i;

/** Signals of a worthwhile stop in a Wikipedia short description. */
const GOOD_STOP =
  /\b(park|reserve|sanctuary|conservancy|forest|hill|hills|mountain|peak|crater|volcano|lava|cave|falls|waterfall|springs?|lake|island|beach|ruins|monument|museum|temple|gurdwara|mosque|shrine|heritage|archaeolog\w*|fort|viewpoint|gorge|escarpment|wildlife|game|lodge|camp|plateau|prehistoric|botanical|garden)\b/i;

export const POST = guarded(
  schema,
  async ({ points, radius }) => {
    const pages = await Promise.all(
      points.map((p) =>
        upstream(
          `https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${p.lat.toFixed(3)}%7C${p.lng.toFixed(3)}&ggsradius=${radius}&ggslimit=20&prop=description%7Ccoordinates%7Cpageimages&pithumbsize=400&format=json`,
          {},
          8_000,
        )
          .then((d) => Object.values(geo.parse(d).query?.pages ?? {}))
          .catch(() => []),
      ),
    );
    const seen = new Set<number>();
    const places = pages.flat().flatMap((pg) => {
      const c = pg.coordinates?.[0];
      const desc = pg.description ?? '';
      if (!c || seen.has(pg.pageid)) return [];
      if (NOT_A_STOP.test(desc) && !GOOD_STOP.test(desc)) return [];
      if (!GOOD_STOP.test(desc) && !GOOD_STOP.test(pg.title)) return [];
      seen.add(pg.pageid);
      return [
        {
          id: `wiki-${pg.pageid}`,
          name: pg.title,
          description: desc,
          lat: c.lat,
          lng: c.lon,
          imageUrl: pg.thumbnail?.source ?? null,
        },
      ];
    });
    return json({ places }, 200, 86_400);
  },
  'body',
);
