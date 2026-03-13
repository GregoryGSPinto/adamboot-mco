import { InputHTMLAttributes, ReactNode, useId, useState } from 'react';
import { radii, fontSizes, transitions } from '@shared/design/tokens';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({ label, icon, error, style, id: propId, ...rest }: Props) {
  const autoId = useId();
  const id = propId ?? autoId;
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: fontSizes.xs,
            fontWeight: 600,
            color: error ? 'var(--accent-red)' : 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: 12,
              color: focused ? 'var(--accent-blue)' : 'var(--text-muted)',
              fontSize: fontSizes.sm,
              pointerEvents: 'none',
              transition: `color ${transitions.fast}`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
          style={{
            width: '100%',
            height: 32,
            padding: icon ? '0 12px 0 36px' : '0 12px',
            background: 'var(--bg-primary)',
            border: `1px solid ${error ? 'var(--accent-red)' : focused ? 'var(--accent-blue)' : 'var(--border)'}`,
            borderRadius: radii.md,
            color: 'var(--text-primary)',
            fontSize: fontSizes.sm,
            outline: 'none',
            boxShadow: focused && !error ? '0 0 0 3px var(--focus-ring)' : 'none',
            transition: `border-color ${transitions.fast}, box-shadow ${transitions.fast}`,
            fontFamily: 'inherit',
            ...style,
          }}
        />
      </div>
      {error && <span style={{ fontSize: fontSizes.xs, color: 'var(--accent-red)' }}>{error}</span>}
    </div>
  );
}
