# Safiri Trips proxy

Thin Vercel functions in front of every third party API, so the app ships with no keys.

| Route | Upstream | Cache |
|---|---|---|
| `GET /api/search?q=` | Nominatim (Kenya only) | 1 day |
| `POST /api/route` `{ points: [{lat,lng}] }` | OpenRouteService | 1 day |
| `GET /api/weather?lat=&lng=` | Open-Meteo forecast and air quality | 1 hour |
| `GET /api/nearby?lat=&lng=&radius=` | Overpass | 1 day |
| `GET /api/place?lat=&lng=&name=` | Wikipedia | 1 day |
| `POST /api/along` `{ points: [{lat,lng}] }` | Wikipedia geosearch at each sample point, filtered to attractions | 1 day |

## Deploy

1. `cd proxy && npm install`
2. `npx vercel --prod` (set the project root to this `proxy` folder)
3. In the Vercel dashboard add the environment variable `ORS_API_KEY`, then redeploy
4. Put the deployment URL in the app's `.env` as `EXPO_PUBLIC_API_BASE_URL`

## Guard rails

Every handler goes through `lib/http.ts`: Zod validation, a fixed upstream host allowlist, a body size cap, a per IP rate limit, generic error messages and no logging. The limiter is in memory per instance, so also add a Vercel Firewall rate limit rule on `/api/*`.
