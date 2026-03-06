import type { ReactNode } from 'react';
import { radii, fontSizes, fontWeights, severity, status } from '@shared/design/tokens';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'teal'
  | 'critica' | 'alta' | 'media' | 'baixa'
  | 'ok' | 'aviso' | 'bloqueio';

interface Props {
  variant?: Variant;
  children: ReactNode;
  style?: React.CSSProperties;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default:  { background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' },
  success:  { background: 'rgba(105,190,40,0.15)', color: '#69be28' },
  warning:  { background: 'rgba(237,177,17,0.15)', color: '#edb111' },
  danger:   { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  info:     { background: 'rgba(0,176,202,0.15)', color: '#00b0ca' },
  teal:     { background: 'rgba(0,158,153,0.15)', color: '#009e99' },
  // Severity
  critica:  { background: severity.critica.bg, color: severity.critica.fg },
  alta:     { background: severity.alta.bg, color: severity.alta.fg },
  media:    { background: severity.media.bg, color: severity.media.fg },
  baixa:    { background: severity.baixa.bg, color: severity.baixa.fg },
  // Status
  ok:       { background: status.ok.bg, color: status.ok.fg },
  aviso:    { background: status.aviso.bg, color: status.aviso.fg },
  bloqueio: { background: status.bloqueio.bg, color: status.bloqueio.fg },
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
