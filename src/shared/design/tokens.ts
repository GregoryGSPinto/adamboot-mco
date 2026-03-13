/**
 * Design Tokens — GitHub-Minimal Style
 *
 * All color/spacing/typography values use CSS custom properties
 * defined in index.css. These TS tokens are for inline styles
 * that need static values or semantic groupings.
 */

// Colors — static references for inline styles
export const teal = {
  50: '#e6f7f7',
  100: '#b3e8e6',
  200: '#80d9d5',
  300: '#4dcac4',
  400: '#26bfb8',
  500: '#1a7f37', // remapped to accent-green
  600: '#15692d',
  700: '#0e5623',
  800: '#084218',
  900: '#032f0f',
} as const;

export const green = {
  50: '#dafbe1',
  100: '#aceebb',
  200: '#6fdd8b',
  300: '#4ac26b',
  400: '#2da44e',
  500: '#1a7f37',
  600: '#15692d',
  700: '#0e5623',
} as const;

export const gold = {
  50: '#fdf4dc',
  100: '#fae5a6',
  200: '#f7d46b',
  300: '#f4c330',
  400: '#d29922',
  500: '#9a6700',
  600: '#7d5200',
  700: '#603c00',
} as const;

export const cyan = {
  500: '#0969da',
  600: '#0550ae',
  700: '#033d8b',
} as const;

export const colors = {
  teal,
  green,
  gold,
  cyan,

  // Semantic
  success: '#1a7f37',
  warning: '#9a6700',
  danger: '#d1242f',
  info: '#0969da',

  // Text (use CSS vars in components; these are fallbacks)
  textPrimary: '#1f2328',
  textSecondary: '#656d76',
  textMuted: '#8b949e',
  textOnBrand: '#ffffff',

  // Borders
  borderSubtle: '#e8ecf0',
  borderDefault: '#d1d9e0',
} as const;

// Severity (MASP visual)
export const severity = {
  critica: {
    bg: 'var(--accent-red-subtle)',
    fg: 'var(--sev-critica)',
    border: 'var(--sev-critica)',
  },
  alta: { bg: 'rgba(188, 76, 0, 0.1)', fg: 'var(--sev-alta)', border: 'var(--sev-alta)' },
  media: { bg: 'var(--accent-yellow-subtle)', fg: 'var(--sev-media)', border: 'var(--sev-media)' },
  baixa: { bg: 'var(--hover-bg)', fg: 'var(--sev-baixa)', border: 'var(--sev-baixa)' },
} as const;

// Status (feedback visual)
export const status = {
  ok: {
    bg: 'var(--accent-green-subtle)',
    fg: 'var(--accent-green)',
    border: 'var(--accent-green)',
  },
  aviso: {
    bg: 'var(--accent-yellow-subtle)',
    fg: 'var(--accent-yellow)',
    border: 'var(--accent-yellow)',
  },
  bloqueio: {
    bg: 'var(--accent-red-subtle)',
    fg: 'var(--accent-red)',
    border: 'var(--accent-red)',
  },
} as const;

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
} as const;

// Typography
export const fontSizes = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
} as const;

export const fontFamilies = {
  body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
} as const;

// Radii
export const radii = {
  sm: '6px',
  md: '6px',
  lg: '6px',
  xl: '6px',
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  xl: '0 12px 36px rgba(0, 0, 0, 0.16)',
  glow: {
    teal: 'none',
    green: 'none',
    danger: 'none',
  },
} as const;

// Transitions
export const transitions = {
  fast: '0.1s ease',
  normal: '0.15s ease',
  slow: '0.2s ease',
} as const;

// Z-Index
export const zIndex = {
  base: 1,
  dropdown: 100,
  sticky: 200,
  overlay: 400,
  modal: 500,
  toast: 1000,
} as const;
