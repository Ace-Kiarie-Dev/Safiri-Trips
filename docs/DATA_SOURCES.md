# Data sources and terms

| Need | Source | Called from | Notes |
|---|---|---|---|
| Search | Nominatim | proxy `/api/search` | Limited to Kenya. App debounces typing, proxy edge caches for a day and sends a real User-Agent. Policy is 1 request per second, so add the Vercel Firewall rule before launch. |
| Routing | OpenRouteService | proxy `/api/route` | Needs `ORS_API_KEY` on Vercel. Up to 12 stops. |
| Weather, air quality | Open-Meteo | proxy `/api/weather` | Free tier is non-commercial. Keep v1 ad free. Move to a paid plan before adding AdMob in v1.1. |
| Nearby | Overpass, Wikipedia geosearch fallback | proxy `/api/nearby` | Small radius query, capped at 40 results, cached for a day. The public Overpass instances are often at capacity and say so in their error, so when both mirrors fail the proxy answers with nearby Wikipedia articles instead (cached one hour so Overpass is retried later). The response carries `source: "osm"` or `"wikipedia"`. |
| Place summaries | Wikipedia REST | proxy `/api/place` | Text CC BY-SA, credited in app. |
| Map tiles | OpenFreeMap (Liberty style) | app, direct | No key. Attribution is shown on the map by MapLibre and in Attributions. |

## Open item: offline map packs

OpenFreeMap says its public instance has no limits on map views or requests and needs no key, and its terms of service are short and "as is". It does not specifically mention bulk downloads for offline use. The app keeps packs small (route corridor only, zoom 5 to 12, capped near 120 MB, size shown before download), which is light use, but this was not confirmed in writing.

Before release, either email info@openfreemap.org to confirm, or switch `MAP_STYLE_URL` in `src/lib/config.ts` to a provider that explicitly allows offline packs. Nothing else in the code needs to change.

OpenTripMap from the brief is not used. Wikipedia plus the curated stories cover v1, and it saved a second API key.
