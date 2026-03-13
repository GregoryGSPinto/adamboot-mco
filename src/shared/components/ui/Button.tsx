import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { radii, fontSizes, fontWeights, transitions } from '@shared/design/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--btn-primary-bg)',
    color: 'var(--btn-primary-text)',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  danger: {
    background: 'var(--accent-red)',
    color: '#ffffff',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { height: 28, padding: '0 12px', fontSize: fontSizes.sm },
  md: { height: 32, padding: '0 16px', fontSize: fontSizes.sm },
  lg: { height: 36, padding: '0 16px', fontSize: fontSizes.sm },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      onMouseEnter={e => {
        if (!isDisabled) {
          const target = e.currentTarget;
          if (variant === 'primary') {
            target.style.background = 'var(--btn-primary-hover)';
          } else if (variant === 'danger') {
            target.style.filter = 'brightness(0.95)';
          } else if (variant === 'secondary') {
            target.style.background = 'var(--hover-bg)';
          } else if (variant === 'ghost') {
            target.style.background = 'var(--hover-bg)';
            target.style.borderColor = 'var(--border)';
          }
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={e => {
        const target = e.currentTarget;
        target.style.background = variantStyles[variant].background as string;
        target.style.filter = '';
        if (variant === 'ghost') {
          target.style.borderColor = 'transparent';
        }
        onMouseLeave?.(e);
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: radii.md,
        fontWeight: fontWeights.semibold,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: `background ${transitions.fast}, border-color ${transitions.fast}, filter ${transitions.fast}`,
        fontFamily: 'inherit',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
