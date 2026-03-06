import type { ReactNode } from 'react';
import { radii, shadows, transitions } from '@shared/design/tokens';

type Variant = 'default' | 'highlighted' | 'glass';

interface Props {
  variant?: Variant;
  hoverable?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
  },
  highlighted: {
    background: 'var(--bg-card)',
    border: '1px solid var(--vale-teal)',
    boxShadow: shadows.glow.teal,
  },
  glass: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
  },
};

export function Card({ variant = 'default', hoverable = false, children, style, onClick }: Props) {
  const isClickable = !!onClick || hoverable;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={hoverable ? 'card-hoverable' : undefined}
      style={{
        borderRadius: radii.lg,
        padding: '1.25rem',
        transition: `all ${transitions.normal}`,
        cursor: isClickable ? 'pointer' : undefined,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
