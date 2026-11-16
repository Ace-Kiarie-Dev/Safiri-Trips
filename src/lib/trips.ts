import { getDb } from './db';

export type Trip = {
  id: string;
  title: string;
  startDate: string | null;
  days: number;
  createdAt: number;
  offlineAt: number | null;
  stopCount: number;
};

export type Stop = {
  id: string;
  tripId: string;
  position: number;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  storySlug: string | null;
};

export type NewStop = Pick<Stop, 'name' | 'subtitle' | 'lat' | 'lng'> & {
  storySlug?: string | null;
};

type TripRow = {
  id: string;
  title: string;
  start_date: string | null;
  days: number;
  created_at: number;
  offline_at: number | null;
  stop_count: number;
};
type StopRow = {
  id: string;
  trip_id: string;
  position: number;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  story_slug: string | null;
};

export const MAX_STOPS = 12;
export const MAX_TITLE = 60;
export const MAX_DAYS = 14;

const clampDays = (n: number) => Math.min(MAX_DAYS, Math.max(1, Math.round(n)));
const cleanTitle = (t: string) => t.trim().slice(0, MAX_TITLE) || 'My trip';

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

const toTrip = (r: TripRow): Trip => ({
  id: r.id,
  title: r.title,
  startDate: r.start_date,
  days: r.days,
  createdAt: r.created_at,
  offlineAt: r.offline_at,
  stopCount: r.stop_count,
});
const toStop = (r: StopRow): Stop => ({
  id: r.id,
  tripId: r.trip_id,
  position: r.position,
  name: r.name,
  subtitle: r.subtitle,
  lat: r.lat,
  lng: r.lng,
  storySlug: r.story_slug,
});

const TRIP_SELECT = `SELECT t.id, t.title, t.start_date, t.days, t.created_at, t.offline_at,
  (SELECT COUNT(*) FROM stops s WHERE s.trip_id = t.id) AS stop_count FROM trips t`;

export async function listTrips(): Promise<Trip[]> {
  const db = await getDb();
  return (await db.getAllAsync<TripRow>(`${TRIP_SELECT} ORDER BY t.created_at DESC`)).map(toTrip);
}

export async function getTrip(id: string): Promise<Trip | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<TripRow>(`${TRIP_SELECT} WHERE t.id = ?`, id);
  return row ? toTrip(row) : null;
}

export async function listStops(tripId: string): Promise<Stop[]> {
  const db = await getDb();
  return (
    await db.getAllAsync<StopRow>('SELECT * FROM stops WHERE trip_id = ? ORDER BY position', tripId)
  ).map(toStop);
}

export type TripInput = { title: string; startDate: string | null; days: number };

export async function createTrip(input: TripInput): Promise<string> {
  const db = await getDb();
  const id = newId();
  await db.runAsync(
    'INSERT INTO trips (id, title, start_date, days, created_at) VALUES (?, ?, ?, ?, ?)',
    id,
    cleanTitle(input.title),
    input.startDate,
    clampDays(input.days),
    Date.now(),
  );
  return id;
}

export async function updateTrip(id: string, input: TripInput) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE trips SET title = ?, start_date = ?, days = ? WHERE id = ?',
    cleanTitle(input.title),
    input.startDate,
    clampDays(input.days),
    id,
  );
}

export async function deleteTrip(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM trips WHERE id = ?', id);
}

export async function setTripOffline(id: string, offlineAt: number | null) {
  const db = await getDb();
  await db.runAsync('UPDATE trips SET offline_at = ? WHERE id = ?', offlineAt, id);
}

export async function getAlertIds(id: string): Promise<string[]> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ alert_ids: string }>(
    'SELECT alert_ids FROM trips WHERE id = ?',
    id,
  );
  try {
    const parsed: unknown = JSON.parse(row?.alert_ids ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function setAlertIds(id: string, ids: string[]) {
  const db = await getDb();
  await db.runAsync('UPDATE trips SET alert_ids = ? WHERE id = ?', JSON.stringify(ids), id);
}

/** Returns false when the trip is already at the stop limit. */
export async function addStop(tripId: string, stop: NewStop): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number; next: number }>(
    'SELECT COUNT(*) AS n, COALESCE(MAX(position), -1) + 1 AS next FROM stops WHERE trip_id = ?',
    tripId,
  );
  if ((row?.n ?? 0) >= MAX_STOPS) return false;
  await db.runAsync(
    'INSERT INTO stops (id, trip_id, position, name, subtitle, lat, lng, story_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    newId(),
    tripId,
    row?.next ?? 0,
    stop.name.slice(0, 80),
    stop.subtitle.slice(0, 120),
    stop.lat,
    stop.lng,
    stop.storySlug ?? null,
  );
  return true;
}

async function renumber(tripId: string, orderedIds: string[]) {
  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const [i, id] of orderedIds.entries()) {
      await tx.runAsync(
        'UPDATE stops SET position = ? WHERE id = ? AND trip_id = ?',
        i,
        id,
        tripId,
      );
    }
  });
}

export async function removeStop(tripId: string, stopId: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM stops WHERE id = ? AND trip_id = ?', stopId, tripId);
  await renumber(
    tripId,
    (await listStops(tripId)).map((s) => s.id),
  );
}

export async function moveStop(tripId: string, stopId: string, direction: -1 | 1) {
  const ids = (await listStops(tripId)).map((s) => s.id);
  const from = ids.indexOf(stopId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to]!, ids[from]!];
  await renumber(tripId, ids);
}
