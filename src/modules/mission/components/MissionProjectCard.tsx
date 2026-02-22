import type React from 'react';
import type { MissionGroup } from '../types';
import { priorityWeight } from '../priority';

interface Props {
  group: MissionGroup;
  onOpen?: (projectId: string) => void;
}

const RISCO_STYLE: Record<string, { cor: string; bg: string; label: string }> = {
  CRITICO: { cor: 'var(--sev-critica)', bg: 'var(--glow-red)', label: 'CRÍTICO' },
  ALTO:    { cor: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'ALTO' },
  MEDIO:   { cor: 'var(--vale-gold)', bg: 'var(--glow-gold)', label: 'MÉDIO' },
  BAIXO:   { cor: 'var(--vale-gray-light)', bg: 'rgba(116,118,120,0.12)', label: 'BAIXO' },
  EM_DIA:  { cor: 'var(--vale-green)', bg: 'var(--glow-green)', label: 'EM DIA' },
};

const URGENCIA_ICON: Record<string, string> = {
  critico: '🔴',
  urgente: '🟠',
  atencao: '🟡',
  info: '🔵',
};

/**
 * Card de projeto no radar do líder.
 *
 * Mostra em 1 olhada:
 *   - Risco (cor da borda + badge)
 *   - Fase atual + barra de progresso
 *   - Dias restantes / atraso
 *   - Pendências (quem + o quê)
 *   - Mensagem IA mais urgente
 */
export function MissionProjectCard({ group, onOpen }: Props) {
  const risk = RISCO_STYLE[group.riskLevel] ?? RISCO_STYLE.BAIXO;
  const pendentes = group.items.length;
  const diasLabel = group.daysRemaining >= 0
    ? `${group.daysRemaining}d restantes`
    : `${Math.abs(group.daysRemaining)}d atrasado`;
  const urgentMsg = group.aiMessages[0];

  return (
    <button
      onClick={() => onOpen?.(group.projectId)}
      style={{ ...cardStyle, borderLeftColor: risk.cor }}
    >
      {/* Row 1: Title + Risk badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={titleStyle}>{group.projectName}</h3>
        <span style={{ ...riskBadge, color: risk.cor, background: risk.bg, borderColor: `${risk.cor}44` }}>
          {risk.label}
        </span>
      </div>

      {/* Row 2: Phase + Deadline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
        <span style={phaseStyle}>
          Fase {group.phaseNumber}/{group.totalPhases} — <span style={{ color: 'var(--vale-teal-light)' }}>{group.phaseName}</span>
        </span>
        <span style={{
          ...deadlineStyle,
          color: group.daysRemaining <= 7 ? risk.cor : 'var(--text-muted)',
        }}>
          {diasLabel}
        </span>
      </div>

      {/* Row 3: Phase progress bar */}
      <div className="fase-bar" style={{ marginBottom: '0.625rem' }}>
        {Array.from({ length: group.totalPhases }).map((_, i) => (
          <div
            key={i}
            className={`fase-step ${i < group.phaseNumber - 1 ? 'done' : ''} ${i === group.phaseNumber - 1 ? 'current' : ''}`}
          />
        ))}
      </div>

      {/* Row 4: Checklist progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ ...countNum, color: pendentes > 0 ? risk.cor : 'var(--vale-green)' }}>
            {pendentes}
          </span>
          <span style={countLabel}>
            {pendentes === 0 ? 'pronto para avançar' : pendentes === 1 ? 'pendência' : 'pendências'}
          </span>
        </div>
        <span style={progressLabel}>
          {group.completedRequirements}/{group.totalRequirements}
        </span>
      </div>

      {/* Row 5: Top 3 blockers preview */}
      {pendentes > 0 && (
        <div style={blockersSection}>
          {group.items.slice(0, 3).map((item) => (
            <div key={item.id} style={blockerRow}>
              <span style={{ color: 'var(--sev-critica)', fontSize: '0.6875rem' }}>☐</span>
              <span style={blockerText}>
                {item.requirementDescription}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}> — {item.responsibleName}</span>
              </span>
            </div>
          ))}
          {pendentes > 3 && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              +{pendentes - 3} itens...
            </span>
          )}
        </div>
      )}

      {/* Row 6: IA message (most urgent) */}
      {urgentMsg && (
        <div style={iaRow}>
          <span>{URGENCIA_ICON[urgentMsg.urgency] ?? '🔵'}</span>
          <span style={iaText}>{urgentMsg.text}</span>
        </div>
      )}
    </button>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const cardStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderLeft: '4px solid',
  borderRadius: 'var(--radius-md)',
  padding: '1rem 1.25rem',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-primary)',
  transition: 'all var(--duration-normal) var(--ease-out)',
  boxShadow: 'var(--shadow-sm)',
};

const titleStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 700,
  lineHeight: 1.3,
  margin: 0,
  flex: 1,
  marginRight: '0.75rem',
};

const riskBadge: React.CSSProperties = {
  padding: '0.15rem 0.5rem',
  borderRadius: 'var(--radius-full)',
  fontSize: '0.5625rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  border: '1px solid',
  flexShrink: 0,
};

const phaseStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--text-secondary)',
};

const deadlineStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
};

const countNum: React.CSSProperties = {
  fontSize: '1.375rem',
  fontWeight: 700,
  fontFamily: 'var(--font-mono)',
  lineHeight: 1,
};

const countLabel: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
};

const progressLabel: React.CSSProperties = {
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  color: 'var(--text-muted)',
};

const blockersSection: React.CSSProperties = {
  borderTop: '1px solid var(--border-subtle)',
  paddingTop: '0.5rem',
  marginBottom: '0.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const blockerRow: React.CSSProperties = {
  display: 'flex',
  gap: '0.375rem',
  alignItems: 'baseline',
};

const blockerText: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--text-secondary)',
};

const iaRow: React.CSSProperties = {
  display: 'flex',
  gap: '0.375rem',
  alignItems: 'flex-start',
  padding: '0.5rem 0.625rem',
  background: 'var(--bg-elevated)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-subtle)',
};

const iaText: React.CSSProperties = {
  fontSize: '0.8125rem',
  lineHeight: 1.4,
  color: 'var(--text-secondary)',
};
