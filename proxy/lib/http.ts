import { z } from "zod";

export const USER_AGENT = "SafiriTrips/1.0 (+https://nesturex.com; hello@nesturex.com)";

/** Only these upstream hosts may ever be contacted. Blocks open-proxy and SSRF abuse. */
const ALLOWED_HOSTS = new Set([
  "nominatim.openstreetmap.org",
  "api.heigit.org",
  "api.open-meteo.com",
  "air-quality-api.open-meteo.com",
  "overpass-api.de",
  "overpass.kumi.systems",
  "en.wikipedia.org",
]);

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const hits = new Map<string, { count: number; resetAt: number }>();

/** Best-effort per-instance limiter. Vercel's firewall rules should back this up. */
function limited(request: Request): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export function json(body: unknown, status = 200, cacheSeconds = 0): Response {
  const cache =
    status === 200 && cacheSeconds > 0
      ? `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 4}`
      : "no-store";
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });
}

export const fail = (status: number, message: string): Response => json({ error: message }, status);

type Handler<T> = (input: T, request: Request) => Promise<Response>;

/** Wraps a handler with rate limit, input validation and generic error handling. */
export function guarded<S extends z.ZodType>(
  schema: S,
  handler: Handler<z.infer<S>>,
  source: "query" | "body" = "query",
) {
  return async (request: Request): Promise<Response> => {
    if (limited(request)) return fail(429, "Too many requests");
    try {
      let raw: unknown;
      if (source === "query") {
        raw = Object.fromEntries(new URL(request.url).searchParams);
      } else {
        const text = await request.text();
        if (text.length > 8_000) return fail(413, "Request too large");
        raw = JSON.parse(text);
      }
      const parsed = schema.safeParse(raw);
      if (!parsed.success) return fail(400, "Invalid request");
      return await handler(parsed.data, request);
    } catch (e) {
      const detail = e instanceof Error ? e.message : "unknown error";
      // Server side log: path and message only, no query text and no coordinates.
      console.error(`${new URL(request.url).pathname} ${detail}`);
      // PROXY_DEBUG also returns the detail to the caller. Set it while
      // diagnosing, remove it before release.
      return json(
        process.env.PROXY_DEBUG ? { error: "Upstream unavailable", detail } : { error: "Upstream unavailable" },
        502,
      );
    }
  };
}

export async function upstream(
  url: string,
  init: RequestInit = {},
  timeoutMs = 15_000,
): Promise<unknown> {
  const host = new URL(url).hostname;
  if (!ALLOWED_HOSTS.has(host)) throw new Error("host not allowed");
  const res = await fetch(url, {
    ...init,
    headers: { "User-Agent": USER_AGENT, Accept: "application/json", ...init.headers },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 200).replace(/\s+/g, " ");
    throw new Error(`upstream ${host} ${res.status} ${detail}`);
  }
  return res.json();
}

export const lat = z.coerce.number().min(-90).max(90);
export const lng = z.coerce.number().min(-180).max(180);
