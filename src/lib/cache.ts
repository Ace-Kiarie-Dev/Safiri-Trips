import { getDb } from './db';

type Row = { value: string; fetched_at: number };

export async function cacheRead<T>(key: string): Promise<{ value: T; fetchedAt: number } | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>('SELECT value, fetched_at FROM kv WHERE key = ?', key);
  if (!row) return null;
  try {
    return { value: JSON.parse(row.value) as T, fetchedAt: row.fetched_at };
  } catch {
    return null;
  }
}

export async function cacheWrite(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO kv (key, value, fetched_at) VALUES (?, ?, ?)',
    key,
    JSON.stringify(value),
    Date.now(),
  );
}

export async function cacheClear(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM kv WHERE pinned = 0');
}

/** Pinned rows belong to offline trips: they survive "clear cache". */
export async function cacheSetPins(keys: string[]): Promise<void> {
  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync('UPDATE kv SET pinned = 0');
    for (const key of keys) await tx.runAsync('UPDATE kv SET pinned = 1 WHERE key = ?', key);
  });
}

/**
 * Fresh cache first, then network, then stale cache. Throws only when there is
 * neither a network answer nor anything cached.
 */
export async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = await cacheRead<T>(key);
  if (hit && Date.now() - hit.fetchedAt < ttlMs) return hit.value;
  try {
    const fresh = await fetcher();
    await cacheWrite(key, fresh);
    return fresh;
  } catch (e) {
    if (hit) return hit.value;
    throw e;
  }
}
