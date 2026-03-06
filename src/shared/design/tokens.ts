/**
 * Design Tokens — MCO Design System.
 *
 * Tokens de cor, espaçamento, tipografia e sombra.
 * Referência única para todo o design system.
 * CSS variables definidas em index.css; aqui ficam os valores TS.
 */

// ════════════════════════════════════
// CORES
// ════════════════════════════════════

export const colors = {
  // Brand Vale
  valeTeal: '#009e99',
  valeTealLight: '#00c4b4',
  valeGreen: '#69be28',
  valeCyan: '#00b0f0',
  valeGold: '#f2c94c',
  valeGray: '#6b7280',

  // Semânticas
  success: '#69be28',
  warning: '#f2c94c',
  danger: '#e53935',
  info: '#00b0f0',

  // Superfícies (dark theme defaults)
  bgBase: '#0a0e14',
  bgSurface: '#111921',
  bgCard: '#1a2332',
  bgInput: '#0d1117',

  // Texto
  textPrimary: '#e6edf3',
  textSecondary: '#8b949e',
  textMuted: '#6e7681',
  textOnBrand: '#ffffff',

  // Bordas
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderDefault: 'rgba(255,255,255,0.12)',
} as const;

// ════════════════════════════════════
// ESPAÇAMENTO
// ════════════════════════════════════

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
} as const;

// ════════════════════════════════════
// TIPOGRAFIA
// ════════════════════════════════════

export const fontSizes = {
  xs: '0.6875rem',   // 11px
  sm: '0.8125rem',   // 13px
  base: '0.875rem',  // 14px
  md: '1rem',        // 16px
  lg: '1.125rem',    // 18px
  xl: '1.5rem',      // 24px
  '2xl': '2rem',     // 32px
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
    danger: '0 0 12px rgba(229,57,53,0.3)',
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
