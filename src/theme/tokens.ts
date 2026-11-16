export type ColorTokens = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  line: string;
  handle: string;
  mapLand: string;
  primary: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  gold: string;
  clay: string;
  ink: string;
  muted: string;
  indicator: string;
  danger: string;
};

export const lightColors: ColorTokens = {
  bg: '#F4E9D8',
  surface: '#FBF6EC',
  surfaceAlt: '#F4E9D8',
  line: '#E7DFD0',
  handle: '#CBBFA8',
  mapLand: '#EADFC8',
  primary: '#2F4A3A',
  onPrimary: '#F4E9D8',
  accent: '#E2792B',
  onAccent: '#1E1B16',
  gold: '#D9A441',
  clay: '#8B4A2B',
  ink: '#1E1B16',
  muted: '#5C5448',
  indicator: '#DCE3D0',
  danger: '#8B4A2B',
};

export const darkColors: ColorTokens = {
  bg: '#17140F',
  surface: '#211D17',
  surfaceAlt: '#2C2720',
  line: '#3A342B',
  handle: '#5C5448',
  mapLand: '#1D1A14',
  primary: '#9CC2A9',
  onPrimary: '#17140F',
  accent: '#E2792B',
  onAccent: '#1E1B16',
  gold: '#D9A441',
  clay: '#E0A07F',
  ink: '#F4E9D8',
  muted: '#B9AE9B',
  indicator: '#33402F',
  danger: '#E0A07F',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

export const radius = { sm: 12, md: 16, lg: 24, xl: 28, pill: 999 } as const;

export const layout = {
  tapTarget: 48,
  buttonHeight: 52,
  navBarHeight: 80,
  searchBarHeight: 52,
} as const;

export const fonts = {
  display: 'Fraunces_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  headline: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  title: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 16 },
} as const;

export type TextVariant = keyof typeof typography;

export const shadow = {
  card: {
    shadowColor: '#1E1B16',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sheet: {
    shadowColor: '#1E1B16',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
} as const;

export const motion = {
  spring: { damping: 20, stiffness: 220, mass: 0.9 },
  fast: 160,
  pulse: 900,
} as const;
