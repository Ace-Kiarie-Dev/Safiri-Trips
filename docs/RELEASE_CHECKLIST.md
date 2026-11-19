# Release checklist

Status key: [x] done in code, [ ] needs Peter or a real device.

## One-time setup (Peter)

- [ ] `git push -u origin main`
- [ ] Get a free OpenRouteService key at openrouteservice.org
- [ ] Deploy the proxy: `cd proxy && npx vercel --prod`, then add `ORS_API_KEY` in the Vercel project's environment variables and redeploy
- [ ] Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL` to the Vercel URL (no trailing slash)
- [ ] `npm install`, then `npx eas-cli build -p android --profile development` and install the APK (MapLibre does not run in Expo Go). Rebuild whenever a native module is added; the last native change was react-native-view-shot and expo-sharing for picture sharing.
- [x] Privacy policy live at https://nesturex.com/safiri-trips/privacy (19 Nov 2026)

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
- [x] Removed the temporary upstream error `detail` from proxy responses (19 Nov). Delete the `PROXY_DEBUG` variable in Vercel if it was added
- [x] `npm audit` (19 Nov): proxy 0 issues; app 4 moderate in build tooling only (minimatch via @expo/fingerprint), nothing shipped in the APK, fix needs a breaking Expo downgrade so left as is. Re-run before each release
- [x] Secret scan (19 Nov): no keys in tracked files or git history, only `.env.example` files tracked. Repeat before each release push
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

- [x] Target API: Expo SDK 58 builds with targetSdk 36, which Play requires for new apps since 31 Aug 2026
- [x] Generated manifest strips background location, storage, audio and overlay permissions (`tools:node="remove"`). Libraries add POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED (so alerts survive a reboot), VIBRATE and INTERNET

## Before publishing

- [ ] Fact check the stories (docs/STORIES_FACT_CHECK.md)
- [ ] Re-read the OpenFreeMap terms on offline packs (see docs/DATA_SOURCES.md)
- [ ] Check the API level Play currently requires and the Expo SDK target
- [ ] Search Play for name collisions with "Safiri Trips"
- [ ] `eas build -p android --profile production`, upload the AAB to internal testing, then closed testing
- [ ] Fill in Data Safety and content rating from docs/PLAY_LISTING.md
