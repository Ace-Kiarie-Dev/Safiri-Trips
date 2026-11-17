import { Directory, File } from 'expo-file-system';

import { getDb } from './db';

const KEY = 'saveFolderUri';

async function readFolder(): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    KEY,
  );
  return row?.value ?? null;
}

async function writeFolder(uri: string) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', KEY, uri);
}

export type SaveResult =
  { ok: true; folder: string; name: string } | { ok: false; canceled: boolean };

/**
 * Saves a PNG into a folder the user picks once (Android's own folder picker, so
 * no storage permission is needed). Later saves reuse that folder; if access to
 * it was lost, the picker opens again.
 */
export async function savePng(tmpUri: string, baseName: string): Promise<SaveResult> {
  const bytes = await new File(tmpUri).bytes();
  const name = `${baseName}-${Date.now().toString(36)}.png`;

  const tryFolder = async (uri: string) => {
    const dir = new Directory(uri);
    const file = dir.createFile(name, 'image/png');
    await file.write(bytes);
    return dir.name;
  };

  const remembered = await readFolder();
  if (remembered) {
    try {
      return { ok: true, folder: await tryFolder(remembered), name };
    } catch {
      // Access revoked or folder gone: ask again below.
    }
  }
  let picked: Directory;
  try {
    picked = await Directory.pickDirectoryAsync();
  } catch {
    return { ok: false, canceled: true };
  }
  await writeFolder(picked.uri);
  return { ok: true, folder: await tryFolder(picked.uri), name };
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'trip';
