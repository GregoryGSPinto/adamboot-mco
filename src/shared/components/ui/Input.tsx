import { InputHTMLAttributes, ReactNode, useId, useState } from 'react';
import { radii, fontSizes, transitions, teal } from '@shared/design/tokens';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({ label, icon, error, style, id: propId, value, ...rest }: Props) {
  const autoId = useId();
  const id = propId ?? autoId;
  const [focused, setFocused] = useState(false);

  const hasValue = value != null && String(value).length > 0;
  const floated = focused || hasValue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '0.75rem',
            color: focused ? teal[500] : 'var(--text-muted)',
            fontSize: fontSizes.sm, pointerEvents: 'none',
            transition: `color ${transitions.normal}`,
          }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          value={value}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          {...rest}
          style={{
            width: '100%',
            padding: label
              ? (icon ? '1.25rem 0.75rem 0.375rem 2.25rem' : '1.25rem 0.75rem 0.375rem 0.75rem')
              : (icon ? '0.5rem 0.75rem 0.5rem 2.25rem' : '0.5rem 0.75rem'),
            background: 'var(--bg-input)',
            border: `1px solid ${error ? '#ef4444' : focused ? teal[500] : 'var(--border-default)'}`,
            borderRadius: radii.md,
            color: 'var(--text-primary)',
            fontSize: fontSizes.base,
            outline: 'none',
            boxShadow: focused && !error ? `0 0 0 3px rgba(0,158,153,0.12)` : 'none',
            transition: `border-color ${transitions.normal}, box-shadow ${transitions.normal}`,
            fontFamily: 'inherit',
            ...style,
          }}
        />
        {label && (
          <label htmlFor={id} style={{
            position: 'absolute',
            left: icon ? '2.25rem' : '0.75rem',
            top: floated ? '0.25rem' : '50%',
            transform: floated ? 'none' : 'translateY(-50%)',
            fontSize: floated ? fontSizes.xs : fontSizes.base,
            fontWeight: floated ? 600 : 400,
            color: error ? '#ef4444' : focused ? teal[500] : 'var(--text-muted)',
            transition: `all ${transitions.normal}`,
            pointerEvents: 'none',
          }}>
            {label}
          </label>
        )}
      </div>
      {error && (
        <span style={{ fontSize: fontSizes.xs, color: '#ef4444' }}>{error}</span>
      )}
    </div>
  );
}
