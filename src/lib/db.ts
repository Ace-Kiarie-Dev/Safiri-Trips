import * as SQLite from 'expo-sqlite';

const SCHEMA_VERSION = 2;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  if (current >= SCHEMA_VERSION) return;
  await db.withExclusiveTransactionAsync(async (tx) => {
    if (current < 1) {
      await tx.execAsync(`
        CREATE TABLE trips (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          start_date TEXT,
          days INTEGER NOT NULL DEFAULT 1,
          created_at INTEGER NOT NULL,
          offline_at INTEGER,
          alert_ids TEXT NOT NULL DEFAULT '[]'
        );
        CREATE TABLE stops (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          position INTEGER NOT NULL,
          name TEXT NOT NULL,
          subtitle TEXT NOT NULL DEFAULT '',
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          story_slug TEXT
        );
        CREATE INDEX stops_trip_idx ON stops(trip_id, position);
        CREATE TABLE kv (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          fetched_at INTEGER NOT NULL,
          pinned INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE packing_items (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          label TEXT NOT NULL,
          checked INTEGER NOT NULL DEFAULT 0,
          custom INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX packing_trip_idx ON packing_items(trip_id);
        CREATE TABLE settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
    }
    if (current < 2) {
      await tx.execAsync(`
        ALTER TABLE trips ADD COLUMN origin_name TEXT;
        ALTER TABLE trips ADD COLUMN origin_lat REAL;
        ALTER TABLE trips ADD COLUMN origin_lng REAL;
        ALTER TABLE trips ADD COLUMN round_trip INTEGER NOT NULL DEFAULT 0;
      `);
    }
    await tx.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  dbPromise ??= (async () => {
    const db = await SQLite.openDatabaseAsync('safiri.db');
    await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    await migrate(db);
    return db;
  })();
  return dbPromise;
}
