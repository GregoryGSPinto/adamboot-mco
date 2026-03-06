import type { ReactNode } from 'react';
import { radii, fontSizes, fontWeights } from '@shared/design/tokens';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'teal';

interface Props {
  variant?: Variant;
  children: ReactNode;
  style?: React.CSSProperties;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default: { background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' },
  success: { background: 'rgba(105,190,40,0.15)', color: '#69be28' },
  warning: { background: 'rgba(242,201,76,0.15)', color: '#f2c94c' },
  danger: { background: 'rgba(229,57,53,0.15)', color: '#e53935' },
  info: { background: 'rgba(0,176,240,0.15)', color: '#00b0f0' },
  teal: { background: 'rgba(0,158,153,0.15)', color: '#00c4b4' },
};

export function Badge({ variant = 'default', children, style }: Props) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.125rem 0.625rem',
      borderRadius: radii.full,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      lineHeight: 1.6,
      whiteSpace: 'nowrap',
      ...variantStyles[variant],
      ...style,
    }}>
      {children}
    </span>
  );
}
