#!/usr/bin/env node
// Calls OpenRouteService directly with the key from proxy/.env.local, so we can
// tell a bad key apart from a proxy bug. The key is never printed.
// Usage: node scripts/check-ors.mjs

import { readFileSync } from 'node:fs';

const out = (s) => process.stdout.write(`${s}\n`);

let key = '';
try {
  const env = readFileSync(new URL('../proxy/.env.local', import.meta.url), 'utf8');
  key = /^ORS_API_KEY=(.*)$/m.exec(env)?.[1]?.trim() ?? '';
} catch {
  out('Could not read proxy/.env.local');
  process.exit(1);
}
if (!key) {
  out('ORS_API_KEY is empty in proxy/.env.local. Paste the key there first.');
  process.exit(1);
}
out(`Key found, ${key.length} characters, starts "${key.slice(0, 4)}…"`);

const res = await fetch(
  'https://api.heigit.org/openrouteservice/v2/directions/driving-car/geojson',
  {
    method: 'POST',
    headers: { Authorization: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      coordinates: [
        [36.8219, -1.2921],
        [36.4333, -0.7167],
      ],
    }),
    signal: AbortSignal.timeout(25_000),
  },
);

const text = await res.text();
out(`HTTP ${res.status}`);
if (res.ok) {
  const km = JSON.parse(text).features?.[0]?.properties?.summary?.distance;
  out(
    km
      ? `Works. Nairobi to Naivasha is ${Math.round(km / 1000)} km.`
      : `Unexpected shape: ${text.slice(0, 200)}`,
  );
} else {
  out(text.replace(key, '<key>').slice(0, 400));
}
