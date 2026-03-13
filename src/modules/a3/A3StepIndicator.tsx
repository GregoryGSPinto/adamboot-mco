/**
 * A3 STEP INDICATOR — Barra de progresso dos 8 passos do A3.
 *
 * Visual corporativo industrial (Vale/SAP):
 *   - Fundo escuro, tipografia condensada
 *   - Steps: ●locked → ◉ active → ✓ done
 *   - Linha conectora entre steps
 *   - Cor teal Vale para ativo, verde para concluído, cinza para bloqueado
 */

import type React from 'react';
import { FASE_LABELS_CURTOS } from '@shared/engine';

interface A3StepIndicatorProps {
  faseAtual: number;
  totalFases: number;
  onSelectFase?: (fase: number) => void;
  bloqueadaAte?: number; // fase máxima desbloqueada
}

export function A3StepIndicator({
  faseAtual,
  totalFases,
  onSelectFase,
  bloqueadaAte,
}: A3StepIndicatorProps) {
  const maxDesbloqueada = bloqueadaAte ?? faseAtual;

  return (
    <div style={containerStyle}>
      {/* Label de contexto */}
      <div style={contextLabelStyle}>
        <span style={systemTagStyle}>A3 / PDCA</span>
        <span style={phaseCountStyle}>
          PASSO {faseAtual} DE {totalFases}
        </span>
      </div>

      {/* Step bar */}
      <div style={stepBarStyle}>
        {Array.from({ length: totalFases }, (_, i) => {
          const fase = i + 1;
          const isDone = fase < faseAtual;
          const isActive = fase === faseAtual;
          const isLocked = fase > maxDesbloqueada;
          const label = FASE_LABELS_CURTOS[fase] ?? `Passo ${fase}`;

          return (
            <div key={fase} style={stepWrapperStyle}>
              {/* Connector line */}
              {i > 0 && (
                <div
                  style={{
                    ...connectorStyle,
                    background: isDone
                      ? 'var(--accent-green)'
                      : isActive
                        ? 'var(--accent-green)'
                        : 'var(--border)',
                  }}
                />
              )}

              {/* Step circle */}
              <button
                onClick={() => !isLocked && onSelectFase?.(fase)}
                disabled={isLocked}
                style={{
                  ...stepCircleStyle,
                  background: isDone
                    ? 'var(--accent-green)'
                    : isActive
                      ? 'var(--accent-green)'
                      : 'var(--border)',
                  border: isActive ? '2px solid var(--accent-green)' : '2px solid transparent',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.4 : 1,
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                }}
                title={`${fase}. ${label}${isLocked ? ' (bloqueado)' : ''}`}
              >
                {isDone ? '✓' : isLocked ? '🔒' : fase}
              </button>

              {/* Step label */}
              <span
                style={{
                  ...stepLabelStyle,
                  color: isActive
                    ? 'var(--accent-green)'
                    : isDone
                      ? 'var(--accent-green)'
                      : 'var(--text-muted, #6b7280)',
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════
// STYLES — Corporativo Industrial
// ════════════════════════════════════

const containerStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  borderRadius: '12px',
  padding: '14px 16px 12px',
  marginBottom: '16px',
};

const contextLabelStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const systemTagStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--accent-green)',
  background: 'rgba(0, 179, 173, 0.12)',
  padding: '3px 8px',
  borderRadius: '4px',
  fontFamily: 'var(--font-mono, "SF Mono", monospace)',
};

const phaseCountStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: 'var(--text-muted, #9ca3af)',
  fontFamily: 'var(--font-mono, monospace)',
};

const stepBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  position: 'relative',
};

const stepWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  flex: 1,
  position: 'relative',
};

const connectorStyle: React.CSSProperties = {
  position: 'absolute',
  top: '15px',
  left: '-50%',
  right: '50%',
  height: '2px',
  zIndex: 0,
};

const stepCircleStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 700,
  color: '#fff',
  zIndex: 1,
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-mono, monospace)',
  padding: 0,
};

const stepLabelStyle: React.CSSProperties = {
  fontSize: '9px',
  textAlign: 'center',
  letterSpacing: '0.02em',
  lineHeight: 1.2,
  maxWidth: '60px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};
