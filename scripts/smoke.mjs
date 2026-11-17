#!/usr/bin/env node
// Checks every proxy endpoint end to end.
// Usage: node scripts/smoke.mjs https://safiri-trips-proxy.vercel.app

const base = (process.argv[2] ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
if (!base) {
  console.error('Usage: node scripts/smoke.mjs <proxy-url>');
  process.exit(1);
}

const out = (s) => process.stdout.write(`${s}\n`);

const CHECKS = [
  {
    name: 'search ',
    path: '/api/search?q=naivasha',
    expect: (d) => d.results?.length > 0,
    show: (d) => d.results[0].name,
  },
  {
    name: 'weather',
    path: '/api/weather?lat=-0.77&lng=36.35',
    expect: (d) => d.days?.length === 7,
    show: (d) => `${d.days[0].maxC}C max, ${d.days[0].rainPct}% rain, AQI ${d.aqi ?? 'n/a'}`,
  },
  {
    name: 'nearby ',
    path: '/api/nearby?lat=-0.77&lng=36.35',
    expect: (d) => Array.isArray(d.places),
    show: (d) => `${d.places.length} places`,
  },
  {
    name: 'place  ',
    path: '/api/place?lat=-4.0626&lng=39.6797&name=Fort%20Jesus',
    expect: (d) => 'place' in d,
    show: (d) => d.place?.title ?? 'no match',
  },
  {
    name: 'along  ',
    path: '/api/along',
    body: {
      points: [
        { lat: -2.0, lng: 37.3 },
        { lat: -2.3, lng: 37.6 },
      ],
    },
    expect: (d) => Array.isArray(d.places),
    show: (d) => `${d.places.length} places, e.g. ${d.places[0]?.name ?? 'none'}`,
  },
  {
    name: 'route  ',
    path: '/api/route',
    body: {
      points: [
        { lat: -1.2921, lng: 36.8219 },
        { lat: -0.7167, lng: 36.4333 },
      ],
    },
    expect: (d) => d.distanceM > 0 && d.legs?.length > 0,
    show: (d) => `${Math.round(d.distanceM / 1000)} km, ${Math.round(d.durationS / 60)} min`,
  },
];

let failed = 0;
out(`\nTesting ${base}\n`);

for (const check of CHECKS) {
  try {
    const res = await fetch(base + check.path, {
      method: check.body ? 'POST' : 'GET',
      headers: check.body ? { 'Content-Type': 'application/json' } : undefined,
      body: check.body ? JSON.stringify(check.body) : undefined,
      signal: AbortSignal.timeout(25_000),
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      failed += 1;
      out(`FAIL ${check.name}  HTTP ${res.status}, not JSON: ${text.slice(0, 120)}`);
      continue;
    }
    if (res.ok && check.expect(data)) {
      out(`OK   ${check.name}  ${check.show(data)}`);
    } else {
      failed += 1;
      out(`FAIL ${check.name}  HTTP ${res.status}  ${JSON.stringify(data).slice(0, 400)}`);
    }
  } catch (e) {
    failed += 1;
    out(`FAIL ${check.name}  ${e instanceof Error ? e.message : String(e)}`);
  }
}

out(
  failed === 0
    ? '\nAll five endpoints are working.\n'
    : `\n${failed} of ${CHECKS.length} failed. See above.\n`,
);
process.exit(failed === 0 ? 0 : 1);
