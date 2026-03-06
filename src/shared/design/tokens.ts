/**
 * Design Tokens — MCO Design System Premium.
 *
 * Tokens de cor (escala completa Vale), severidade, status,
 * tipografia, raios, sombras e transicoes.
 * Referencia unica para todo o design system.
 */

// ════════════════════════════════════
// CORES — Escala Vale
// ════════════════════════════════════

export const teal = {
  50: '#e6f7f7',
  100: '#b3e8e6',
  200: '#80d9d5',
  300: '#4dcac4',
  400: '#26bfb8',
  500: '#009e99',
  600: '#008a85',
  700: '#007e7a',
  800: '#006561',
  900: '#004d49',
} as const;

export const green = {
  50: '#f0f9e6',
  100: '#d4edb3',
  200: '#b8e180',
  300: '#9cd54d',
  400: '#86cc28',
  500: '#69be28',
  600: '#57a020',
  700: '#458218',
} as const;

export const gold = {
  50: '#fdf6e1',
  100: '#fae5a6',
  200: '#f7d46b',
  300: '#f4c330',
  400: '#f2b80e',
  500: '#edb111',
  600: '#d49b0e',
  700: '#b8850c',
} as const;

export const cyan = {
  500: '#00b0ca',
  600: '#009ab1',
  700: '#008498',
} as const;

export const colors = {
  teal,
  green,
  gold,
  cyan,

  // Brand shorthand
  valeTeal: teal[700],
  valeTealLight: teal[500],
  valeGreen: green[500],
  valeCyan: cyan[500],
  valeGold: gold[500],
  valeGray: '#747678',

  // Semanticas
  success: green[500],
  warning: gold[500],
  danger: '#ef4444',
  info: cyan[500],

  // Superficies (dark)
  bgBase: '#07100f',
  bgSurface: '#0c1917',
  bgCard: '#152a28',
  bgInput: '#0e1d1b',

  // Texto
  textPrimary: '#e6f0ef',
  textSecondary: '#8fa9a6',
  textMuted: '#567370',
  textOnBrand: '#ffffff',

  // Bordas
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderDefault: 'rgba(255,255,255,0.12)',
} as const;

// ════════════════════════════════════
// SEVERIDADE (MASP visual)
// ════════════════════════════════════

export const severity = {
  critica: { bg: 'rgba(239,68,68,0.15)', fg: '#ef4444', border: '#ef4444' },
  alta:    { bg: 'rgba(249,115,22,0.15)', fg: '#f97316', border: '#f97316' },
  media:   { bg: 'rgba(237,177,17,0.15)', fg: '#edb111', border: '#edb111' },
  baixa:   { bg: 'rgba(116,118,120,0.15)', fg: '#747678', border: '#747678' },
} as const;

// ════════════════════════════════════
// STATUS (feedback visual)
// ════════════════════════════════════

export const status = {
  ok:       { bg: 'rgba(105,190,40,0.15)', fg: '#69be28', border: '#69be28' },
  aviso:    { bg: 'rgba(237,177,17,0.15)', fg: '#edb111', border: '#edb111' },
  bloqueio: { bg: 'rgba(239,68,68,0.15)', fg: '#ef4444', border: '#ef4444' },
} as const;

// ════════════════════════════════════
// ESPACAMENTO
// ════════════════════════════════════

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
} as const;

// ════════════════════════════════════
// TIPOGRAFIA
// ════════════════════════════════════

export const fontSizes = {
  xs: '0.6875rem',
  sm: '0.8125rem',
  base: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.5rem',
  '2xl': '2rem',
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
} as const;

export const fontFamilies = {
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

// ════════════════════════════════════
// RAIOS
// ════════════════════════════════════

export const radii = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

// ════════════════════════════════════
// SOMBRAS
// ════════════════════════════════════

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 12px rgba(0,0,0,0.1)',
  lg: '0 8px 32px rgba(0,0,0,0.15)',
  xl: '0 16px 48px rgba(0,0,0,0.2)',
  glow: {
    teal: '0 0 12px rgba(0,158,153,0.3)',
    green: '0 0 12px rgba(105,190,40,0.3)',
    danger: '0 0 12px rgba(239,68,68,0.3)',
  },
} as const;

// ════════════════════════════════════
// TRANSITIONS
// ════════════════════════════════════

export const transitions = {
  fast: '0.1s ease',
  normal: '0.15s ease',
  slow: '0.3s ease',
} as const;

// ════════════════════════════════════
// Z-INDEX
// ════════════════════════════════════

export const zIndex = {
  base: 1,
  dropdown: 100,
  sticky: 200,
  overlay: 400,
  modal: 500,
  toast: 1000,
} as const;
