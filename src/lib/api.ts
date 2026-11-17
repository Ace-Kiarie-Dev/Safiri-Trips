import type { z } from 'zod';

import { API_BASE_URL } from './config';

const TIMEOUT_MS = 15_000;

export class ApiError extends Error {}

async function request<S extends z.ZodType>(
  path: string,
  schema: S,
  init?: RequestInit,
  timeoutMs = TIMEOUT_MS,
): Promise<z.infer<S>> {
  if (!API_BASE_URL) throw new ApiError('API base URL is not configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new ApiError(`Request failed (${res.status})`);
  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) throw new ApiError('Unexpected response');
  return parsed.data;
}

export function apiGet<S extends z.ZodType>(
  path: string,
  params: Record<string, string | number>,
  schema: S,
  timeoutMs?: number,
) {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)] as [string, string]),
  ).toString();
  return request(`${path}?${qs}`, schema, undefined, timeoutMs);
}

export function apiPost<S extends z.ZodType>(path: string, body: unknown, schema: S) {
  return request(path, schema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
