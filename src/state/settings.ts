import { create } from 'zustand';

import { getDb } from '@/lib/db';

export type Units = 'metric' | 'imperial';
export type ThemePref = 'light' | 'dark' | 'system';

type SettingsState = {
  ready: boolean;
  units: Units;
  theme: ThemePref;
  onboarded: boolean;
  load: () => Promise<void>;
  setUnits: (units: Units) => Promise<void>;
  setTheme: (theme: ThemePref) => Promise<void>;
  setOnboarded: () => Promise<void>;
};

async function save(key: string, value: string) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

export const useSettings = create<SettingsState>((set) => ({
  ready: false,
  units: 'metric',
  theme: 'light',
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
        theme:
          (['light', 'dark', 'system'] as const).find((t) => t === map.get('theme')) ?? 'light',
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
  setTheme: async (theme) => {
    set({ theme });
    await save('theme', theme);
  },
  setOnboarded: async () => {
    set({ onboarded: true });
    await save('onboarded', '1');
  },
}));
