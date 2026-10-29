export const colors = {
  bg: '#FFFFFF',
  surfaceTint: '#FFF0D9',
  accentSoft: '#FFCC80',
  accent: '#FF9F68',
  accentStrong: '#FF6F59',
  ink: '#37474F',
  inkSecondary: '#5B6A72',
  line: '#ECEFF1',
  success: '#2E7D32',
  // Helper tints
  white: '#FFFFFF',
  errorBg: '#FDECEA',
  warningBg: '#FFF8E1',
  warningText: '#E65100',
  overlay: 'rgba(55, 71, 79, 0.45)',
} as const;

export const typography = {
  fontFamily: 'System',
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600' as const,
  },
  h1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  phoneSide: 16,
  tabletSide: 24,
} as const;

export const radius = {
  button: 14,
  card: 16,
  chip: 999,
  sheet: 24,
  full: 999,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#37474F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sheet: {
    shadowColor: '#37474F',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const touchTargets = {
  min: 48,
} as const;
