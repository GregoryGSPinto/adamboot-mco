import { InputHTMLAttributes, ReactNode, useId } from 'react';
import { radii, fontSizes, transitions } from '@shared/design/tokens';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({ label, icon, error, style, id: propId, ...rest }: Props) {
  const autoId = useId();
  const id = propId ?? autoId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: fontSizes.sm, fontWeight: 500,
          color: error ? '#e53935' : 'var(--text-secondary)',
          transition: `color ${transitions.normal}`,
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '0.75rem',
            color: 'var(--text-muted)', fontSize: fontSizes.sm, pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          {...rest}
          style={{
            width: '100%',
            padding: icon ? '0.5rem 0.75rem 0.5rem 2.25rem' : '0.5rem 0.75rem',
            background: 'var(--bg-input)',
            border: `1px solid ${error ? '#e53935' : 'var(--border-default)'}`,
            borderRadius: radii.md,
            color: 'var(--text-primary)',
            fontSize: fontSizes.base,
            outline: 'none',
            transition: `border-color ${transitions.normal}`,
            fontFamily: 'inherit',
            ...style,
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: fontSizes.xs, color: '#e53935' }}>{error}</span>
      )}
    </div>
  );
}
