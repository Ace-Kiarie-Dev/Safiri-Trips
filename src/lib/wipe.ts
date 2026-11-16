import { cancelAllAlerts } from './alerts';
import { getDb } from './db';
import { removeAllOfflineMaps } from './offline';
import { queryClient } from './queryClient';

/** "Delete all my data": trips, stops, packing lists, caches, offline maps and scheduled alerts. */
export async function deleteAllData() {
  await cancelAllAlerts();
  await removeAllOfflineMaps().catch(() => undefined);
  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(
      "DELETE FROM packing_items; DELETE FROM stops; DELETE FROM trips; DELETE FROM kv; DELETE FROM settings WHERE key != 'onboarded';",
    );
  });
  queryClient.clear();
}
