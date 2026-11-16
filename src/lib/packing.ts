import { getDb } from './db';
import type { ForecastDay } from './schemas';
import type { CategoryId } from './stories';
import { newId } from './trips';

export type PackingItem = { id: string; label: string; checked: boolean; custom: boolean };

type Input = { days: number; forecast: ForecastDay[]; categories: CategoryId[] };

/** Pure: builds the suggested list from trip length, forecast and the kinds of places visited. */
export function generatePacking({ days, forecast, categories }: Input): string[] {
  const items = [
    'National ID or passport',
    'Phone charger and power bank',
    'Drinking water',
    'Cash and M-Pesa float',
    'Basic first aid kit',
    'Insect repellent',
  ];
  if (forecast.length > 0) {
    const maxTemp = Math.max(...forecast.map((d) => d.maxC));
    const minTemp = Math.min(...forecast.map((d) => d.minC));
    const wet = forecast.some((d) => d.rainPct >= 50 || d.rainMm >= 2);
    const strongSun = forecast.some((d) => d.uv >= 6);
    if (wet) items.push('Rain jacket or umbrella', 'Waterproof bag for electronics');
    if (strongSun || maxTemp >= 26) items.push('Sunscreen', 'Hat and sunglasses');
    if (maxTemp >= 28) items.push('Light, breathable clothes');
    if (minTemp < 14) items.push('Warm jacket or fleece');
    if (minTemp < 8) items.push('Beanie and gloves');
  } else {
    items.push('Sunscreen', 'Light rain jacket');
  }
  if (days >= 2) items.push(`Clothes for ${days} days`, 'Toiletries', 'Sleepwear');
  if (days >= 4) items.push('Laundry bag');
  const has = (c: CategoryId) => categories.includes(c);
  if (has('coast')) items.push('Swimwear and towel', 'Sandals');
  if (has('safari')) items.push('Binoculars', 'Neutral coloured clothes');
  if (has('mountains')) items.push('Hiking shoes', 'Trail snacks');
  if (has('lakes')) items.push('Camera or spare phone storage');
  if (has('heritage')) items.push('Comfortable walking shoes');
  return [...new Set(items)];
}

type Row = { id: string; label: string; checked: number; custom: number };

export async function listPacking(tripId: string): Promise<PackingItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT id, label, checked, custom FROM packing_items WHERE trip_id = ? ORDER BY custom, rowid',
    tripId,
  );
  return rows.map((r) => ({ id: r.id, label: r.label, checked: !!r.checked, custom: !!r.custom }));
}

/** Replaces the suggested items, keeping ticks on labels that survive and all custom items. */
export async function syncPacking(tripId: string, labels: string[]) {
  const db = await getDb();
  const existing = await listPacking(tripId);
  const checked = new Set(existing.filter((i) => !i.custom && i.checked).map((i) => i.label));
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync('DELETE FROM packing_items WHERE trip_id = ? AND custom = 0', tripId);
    for (const label of labels) {
      await tx.runAsync(
        'INSERT INTO packing_items (id, trip_id, label, checked, custom) VALUES (?, ?, ?, ?, 0)',
        newId(),
        tripId,
        label,
        checked.has(label) ? 1 : 0,
      );
    }
  });
}

export async function togglePacking(id: string, checked: boolean) {
  const db = await getDb();
  await db.runAsync('UPDATE packing_items SET checked = ? WHERE id = ?', checked ? 1 : 0, id);
}

export async function addPacking(tripId: string, label: string) {
  const clean = label.trim().slice(0, 60);
  if (!clean) return;
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO packing_items (id, trip_id, label, checked, custom) VALUES (?, ?, ?, 0, 1)',
    newId(),
    tripId,
    clean,
  );
}

export async function removePacking(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM packing_items WHERE id = ?', id);
}
