import type { ReactNode } from 'react';
import { radii, fontSizes, fontWeights, severity, status } from '@shared/design/tokens';

type Variant =
  | 'default'
  | 'done'
  | 'in-progress'
  | 'blocked'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'teal'
  | 'critica'
  | 'alta'
  | 'media'
  | 'baixa'
  | 'ok'
  | 'aviso'
  | 'bloqueio';

interface Props {
  variant?: Variant;
  children: ReactNode;
  style?: React.CSSProperties;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default: { background: 'var(--hover-bg)', color: 'var(--text-secondary)' },

  // New status variants
  done: { background: 'var(--accent-green-subtle)', color: 'var(--accent-green)' },
  'in-progress': { background: 'var(--accent-yellow-subtle)', color: 'var(--accent-yellow)' },
  blocked: { background: 'var(--accent-red-subtle)', color: 'var(--accent-red)' },

  // Legacy aliases
  success: { background: 'var(--accent-green-subtle)', color: 'var(--accent-green)' },
  warning: { background: 'var(--accent-yellow-subtle)', color: 'var(--accent-yellow)' },
  danger: { background: 'var(--accent-red-subtle)', color: 'var(--accent-red)' },
  info: { background: 'var(--accent-blue-subtle)', color: 'var(--accent-blue)' },
  teal: { background: 'var(--accent-green-subtle)', color: 'var(--accent-green)' },

  // MASP severity
  critica: { background: severity.critica.bg, color: severity.critica.fg },
  alta: { background: severity.alta.bg, color: severity.alta.fg },
  media: { background: severity.media.bg, color: severity.media.fg },
  baixa: { background: severity.baixa.bg, color: severity.baixa.fg },

  // MASP status
  ok: { background: status.ok.bg, color: status.ok.fg },
  aviso: { background: status.aviso.bg, color: status.aviso.fg },
  bloqueio: { background: status.bloqueio.bg, color: status.bloqueio.fg },
};

export function Badge({ variant = 'default', children, style }: Props) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '2px 8px',
        borderRadius: radii.full,
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.semibold,
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
