import { useColorScheme } from 'react-native';

import { useSettings } from '@/state/settings';
import { darkColors, lightColors, type ColorTokens } from './tokens';

export type { ColorTokens };

/** The scheme in force: the user's choice in Settings, or the phone's when set to System. */
export function useScheme(): 'light' | 'dark' {
  const pref = useSettings((s) => s.theme);
  const system = useColorScheme();
  if (pref === 'system') return system === 'dark' ? 'dark' : 'light';
  return pref;
}

export function useColors(): ColorTokens {
  return useScheme() === 'dark' ? darkColors : lightColors;
}
