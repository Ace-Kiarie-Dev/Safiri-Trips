# Safiri Trips

Offline first Kenya trip planner for Android. Package: `com.nesture.safiritrips`. Expo SDK 58, React Native, TypeScript strict, Expo Router.

## Run (Android dev build via EAS, no Android Studio needed)
0. Deploy the proxy (see `proxy/README.md`), then copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL`
1. `npm install`
2. Once: `npx eas-cli build -p android --profile development`, then install the APK it gives you on the phone
3. Every session after that: `npm run start`, open Safiri Trips on the phone, it loads the JS from your PC over Wi-Fi
4. Rebuild (step 2) only when a native dependency or `app.json` changes

MapLibre is a native module, so Expo Go cannot run this app. The three EAS profiles are `development` (dev client APK),
`preview` (standalone APK for testers) and `production` (AAB for Play).

## Checks before every commit
`npm run typecheck && npm run lint`

## Rules
- No API keys in this repo or the app bundle. Keys live only in the proxy's environment variables.
- Light and dark tokens live in `src/theme/tokens.ts`. Shared components live in `src/components`.
- Scope and decisions: see the Safiri Trips project brief.

## Layout
- `src/app` screens (Expo Router). `src/features/trip` trip detail parts. `src/components` shared UI.
- `src/lib` data: `api` and `queries` (proxy calls with a SQLite cache), `trips`, `packing`, `offline`, `alerts`, `stories`.
- `proxy/` Vercel functions. `assets/stories/kenya.json` is built by `python scripts/build_stories.py`.
- `docs/` release checklist, privacy policy, Play listing, data source terms, story fact check.
