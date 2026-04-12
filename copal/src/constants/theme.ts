export const COLORS = {
  black: '#000000',
  red: '#FF3B30',
  white: '#F0EDE8',       // off-white, never pure white
  gray: {
    50:  '#F0EDE8',
    100: '#C8C4C0',
    200: '#9A9490',
    300: '#6E6A66',
    400: '#444444',       // darkest allowed text on black (min 3:1 contrast)
    500: '#2A2826',
    600: '#1A1816',
    700: '#0F0E0C',
  },
  transparent: 'transparent',
} as const;

export const TYPOGRAPHY = {
  display: 'Palatino-Italic',      // Palatino Linotype / Book Antiqua — serif italiana
  displayReg: 'Palatino-Roman',
  mono: 'Courier New',             // monospace para labels, botones, metadatos
  monoAlt: 'Courier',
} as const;

export const FONT_SIZE = {
  xs:   11,
  sm:   13,
  base: 15,
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
} as const;

export const LINE_HEIGHT = {
  tight:  1.2,
  normal: 1.6,   // minimum per anti-fatigue spec
  loose:  2.0,
} as const;

export const RADIUS = {
  sm: 2,
  md: 4,   // max 4px per spec — UI severo, no friendly
  lg: 4,
} as const;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const ANIMATION = {
  skinDurationMin: 2200,  // skins: 2.2 - 3.4 segundos (anti-fatigue spec)
  skinDurationMax: 3400,
  floatDuration:   3000,  // float del xolo/AI entity: 3s ease-in-out infinite
  floatDistance:   3,     // 3px verticales
  slideIn:         280,
  fadeIn:          200,
} as const;

export const GRAIN_OPACITY = 0.016;  // grain overlay sutil — nunca > 0.02
