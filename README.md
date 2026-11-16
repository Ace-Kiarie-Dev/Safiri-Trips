# Safiri Trips

Offline first Kenya trip planner for Android. Package: `com.nesture.safiritrips`. Expo SDK 58, React Native, TypeScript strict, Expo Router.

## Run (Windows, Android dev build)
1. `npm install`
2. `npx expo run:android` (needs Android Studio SDK and a device or emulator; MapLibre needs a dev build, not Expo Go)
3. `npm run start` for the dev server afterwards

## Checks before every commit
`npm run typecheck && npm run lint`

## Rules
- No API keys in this repo or the app bundle. Keys live only in the proxy's environment variables.
- Light and dark tokens live in `src/theme/tokens.ts`. Shared components live in `src/components`.
- Scope and decisions: see the Safiri Trips project brief.
