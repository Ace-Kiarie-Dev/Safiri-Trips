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
  /** Cool counterpoint to the warm palette: weather, water, distance. */
  sky: string;
  skySoft: string;
  sunSoft: string;
  primarySoft: string;
};

export const lightColors: ColorTokens = {
  bg: '#FFF7EA',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF1DC',
  line: '#EADFCB',
  handle: '#CDBFA6',
  mapLand: '#EFE4CF',
  primary: '#1E4D3A',
  onPrimary: '#FFFFFF',
  accent: '#F07A1E',
  onAccent: '#1B1711',
  gold: '#F2B544',
  clay: '#9C4A22',
  ink: '#1B1711',
  muted: '#6B6054',
  indicator: '#DCEBE2',
  danger: '#9C4A22',
  sky: '#2B7DBF',
  skySoft: '#E3F0FA',
  sunSoft: '#FFF0C9',
  primarySoft: '#DCEBE2',
};

export const darkColors: ColorTokens = {
  bg: '#15120E',
  surface: '#211C16',
  surfaceAlt: '#2C261E',
  line: '#3B342A',
  handle: '#5E5547',
  mapLand: '#1C1813',
  primary: '#9ED0B3',
  onPrimary: '#15120E',
  accent: '#F58A33',
  onAccent: '#1B1711',
  gold: '#F2B544',
  clay: '#E6A784',
  ink: '#FFF7EA',
  muted: '#BBB09D',
  indicator: '#2E4237',
  danger: '#E6A784',
  sky: '#7FB8E8',
  skySoft: '#1E3041',
  sunSoft: '#3D3317',
  primarySoft: '#2E4237',
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
