import type { ReactNode } from 'react';
import { radii, transitions } from '@shared/design/tokens';

type Variant = 'default' | 'highlighted';

interface Props {
  variant?: Variant;
  hoverable?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
  },
  highlighted: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--accent-blue)',
  },
};

export function Card({ variant = 'default', hoverable = false, children, style, onClick }: Props) {
  const isClickable = !!onClick || hoverable;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onMouseEnter={
        isClickable
          ? e => {
              e.currentTarget.style.background = 'var(--hover-bg)';
            }
          : undefined
      }
      onMouseLeave={
        isClickable
          ? e => {
              e.currentTarget.style.background = 'var(--bg-primary)';
            }
          : undefined
      }
      style={{
        borderRadius: radii.md,
        padding: 16,
        transition: `background ${transitions.fast}`,
        cursor: isClickable ? 'pointer' : undefined,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
