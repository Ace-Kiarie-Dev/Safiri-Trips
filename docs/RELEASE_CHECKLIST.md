# Release checklist

Status key: [x] done in code, [ ] needs Peter or a real device.

## One-time setup (Peter)

- [ ] `git push -u origin main`
- [ ] Get a free OpenRouteService key at openrouteservice.org
- [ ] Deploy the proxy: `cd proxy && npx vercel --prod`, then add `ORS_API_KEY` in the Vercel project's environment variables and redeploy
- [ ] Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL` to the Vercel URL (no trailing slash)
- [ ] `npm install`, then `npx expo run:android` (dev build, MapLibre does not run in Expo Go)
- [ ] Host docs/PRIVACY_POLICY.md at https://nesturex.com/safiri-trips/privacy

## Security gate (nx-security)

- [x] No API keys in the app bundle or repo. The only key (ORS) is read from the proxy environment
- [x] `.env*` ignored from the first commit, `.env.example` holds no values
- [x] Proxy: Zod on every param, fixed upstream host allowlist, request size cap, per IP rate limit, generic errors, no logging
- [x] Proxy rounds coordinates before forwarding weather and nearby lookups
- [x] App: `allowBackup=false`, cleartext off, R8 minify and resource shrink on release, background location and storage permissions blocked
- [x] Permissions: foreground location (optional, asked only on near me) and notifications (asked only when alerts are turned on)
- [x] Parameterised SQL everywhere, Zod on every API response and on route params, search capped at 80 characters
- [x] No deep link handlers beyond the default scheme, share is plain text
- [x] External links limited to the fixed privacy URL and Wikipedia URLs checked against an `https://en.wikipedia.org/` prefix
- [x] Delete all my data wipes SQLite, caches, offline maps and scheduled notifications
- [ ] Add a Vercel Firewall rate limit rule for `/api/*` (the in-code limiter is per instance and best effort)
- [ ] Remove the temporary upstream error `detail` from proxy responses in `proxy/lib/http.ts` (marked TEMPORARY), and delete the `PROXY_DEBUG` variable from Vercel if it was added
- [ ] `npm audit` in the root and in `proxy/` right before release
- [ ] Secret scan before every push (for example `gitleaks detect`)
- [ ] Confirm the release manifest with `aapt dump permissions` on the built AAB

## QA on a real device

- [ ] First run with zero permissions: search, plan a trip, read a story
- [ ] Near me: allow, and deny
- [ ] Trip with 3 stops under 2 minutes, route and legs correct
- [ ] Save offline, turn on airplane mode, reopen the trip, map and forecast still show
- [ ] Rain alert fires (set a start date for tomorrow and check scheduled notifications)
- [ ] Delete all my data, then confirm trips, maps and alerts are gone
- [ ] Dark mode, large font size, TalkBack pass on Home and Trip detail
- [ ] Low RAM device, cold start under 2 seconds
- [ ] Offline banner spacing at the top of the Trips and Discover tabs

## Before publishing

- [ ] Fact check the stories (docs/STORIES_FACT_CHECK.md)
- [ ] Re-read the OpenFreeMap terms on offline packs (see docs/DATA_SOURCES.md)
- [ ] Check the API level Play currently requires and the Expo SDK target
- [ ] Search Play for name collisions with "Safiri Trips"
- [ ] `eas build -p android --profile production`, upload the AAB to internal testing, then closed testing
- [ ] Fill in Data Safety and content rating from docs/PLAY_LISTING.md
