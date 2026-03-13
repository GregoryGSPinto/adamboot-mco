import type React from 'react';
import { FASE_LABELS } from '@shared/engine';

interface Props {
  fase: number;
}

/**
 * Separador automático por fase.
 * Aparece entre mensagens quando a fase muda.
 * Imutável — a fase é gravada no momento do envio.
 */
export function SeparadorFase({ fase }: Props) {
  const label = FASE_LABELS[fase] ?? `Fase ${fase}`;

  return (
    <div style={containerStyle}>
      <div style={lineStyle} />
      <div style={badgeStyle}>
        <span style={faseNumStyle}>Fase {fase}</span>
        <span style={faseLabelStyle}>{label}</span>
      </div>
      <div style={lineStyle} />
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1.25rem 0',
  userSelect: 'none',
};

const lineStyle: React.CSSProperties = {
  flex: 1,
  height: 1,
  background: 'var(--border)',
};

const badgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.375rem 1rem',
  borderRadius: '9999px',
  background: 'var(--accent-green-subtle)',
  border: '1px solid rgba(0,126,122,0.2)',
  flexShrink: 0,
};

const faseNumStyle: React.CSSProperties = {
  fontSize: '0.625rem',
  fontWeight: 700,
  color: 'var(--accent-green)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontFamily: 'var(--font-mono)',
};

const faseLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--accent-green)',
};
