import { create } from 'zustand';

import { getDb } from '@/lib/db';

export type Units = 'metric' | 'imperial';

type SettingsState = {
  ready: boolean;
  units: Units;
  onboarded: boolean;
  load: () => Promise<void>;
  setUnits: (units: Units) => Promise<void>;
  setOnboarded: () => Promise<void>;
};

async function save(key: string, value: string) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

export const useSettings = create<SettingsState>((set) => ({
  ready: false,
  units: 'metric',
  onboarded: false,
  load: async () => {
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<{ key: string; value: string }>(
        'SELECT key, value FROM settings',
      );
      const map = new Map(rows.map((r) => [r.key, r.value]));
      set({
        ready: true,
        units: map.get('units') === 'imperial' ? 'imperial' : 'metric',
        onboarded: map.get('onboarded') === '1',
      });
    } catch {
      set({ ready: true });
    }
  },
  setUnits: async (units) => {
    set({ units });
    await save('units', units);
  },
  setOnboarded: async () => {
    set({ onboarded: true });
    await save('onboarded', '1');
  },
}));
