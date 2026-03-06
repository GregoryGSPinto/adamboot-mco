import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { radii, fontSizes, fontWeights, transitions, teal } from '@shared/design/tokens';

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
    background: `linear-gradient(135deg, ${teal[600]}, ${teal[500]})`,
    color: '#fff',
    border: 'none',
    boxShadow: `0 2px 8px rgba(0,158,153,0.25)`,
  },
  secondary: {
    background: 'transparent',
    color: teal[500],
    border: `1px solid ${teal[600]}`,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)',
  },
  danger: {
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '0.375rem 0.75rem', fontSize: fontSizes.sm },
  md: { padding: '0.5rem 1.25rem', fontSize: fontSizes.base },
  lg: { padding: '0.625rem 1.75rem', fontSize: fontSizes.md },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  style,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: radii.md,
        fontWeight: fontWeights.semibold,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: `all ${transitions.normal}`,
        fontFamily: 'inherit',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {loading ? (
        <span style={{
          display: 'inline-block', width: 14, height: 14,
          border: '2px solid currentColor', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 0.6s linear infinite',
        }} />
      ) : icon}
      {children}
    </button>
  );
}
