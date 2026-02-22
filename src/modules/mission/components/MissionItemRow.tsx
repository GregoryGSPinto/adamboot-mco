import type React from 'react';
import { useState, useCallback, useRef } from 'react';
import type { MissionItem, MissionPriority } from '../types';
import { nudgeResponsible } from '../nudgeResponsible';
import { dispatchNudge } from '@modules/chat/nudgeBus';

interface Props {
  item: MissionItem;
}

const PRIORITY_STYLE: Record<MissionPriority, { cor: string; bg: string; label: string }> = {
  CRITICAL: { cor: 'var(--sev-critica)', bg: 'var(--glow-red)', label: 'CRÍTICO' },
  HIGH:     { cor: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'ALTO' },
  MEDIUM:   { cor: 'var(--vale-gold)', bg: 'var(--glow-gold)', label: 'MÉDIO' },
  LOW:      { cor: 'var(--vale-gray-light)', bg: 'rgba(116,118,120,0.12)', label: 'BAIXO' },
};

const ROLE_LABEL: Record<string, string> = {
  LEADER: 'Líder',
  MEMBER: 'Membro',
  FACILITATOR: 'Facilitador',
};

/**
 * Linha de cobrança — a coisa mais importante do sistema.
 *
 * O líder bate o olho e sabe:
 *   quem → o que → faz quanto tempo → prioridade
 *
 * Botão 🔔 dispara cobrança no chat do projeto.
 */
export function MissionItemRow({ item }: Props) {
  const style = PRIORITY_STYLE[item.priority];
  const [sent, setSent] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleNudge = useCallback(() => {
    const msg = nudgeResponsible(item);
    dispatchNudge(msg);
    setSent(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSent(false), 2000);
  }, [item]);

  return (
    <div style={{ ...rowStyle, borderLeftColor: style.cor }}>
      {/* Header: responsável + atraso + botão cobrar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ ...roleBadge, background: style.bg, color: style.cor }}>
            {ROLE_LABEL[item.responsibleRole] ?? item.responsibleRole}
          </span>
          <span style={nameStyle}>{item.responsibleName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {item.daysLate != null && item.daysLate > 0 && (
            <span style={{ ...lateBadge, color: style.cor }}>
              {item.daysLate}d atrasado
            </span>
          )}
          <span style={{ ...priorityDot, background: style.cor }} />

          {/* 🔔 Botão cobrar */}
          {sent ? (
            <span style={sentLabel}>Cobrança enviada</span>
          ) : (
            <button
              onClick={handleNudge}
              style={nudgeBtn}
              title="Cobrar responsável"
              aria-label="Cobrar responsável"
            >
              🔔
            </button>
          )}
        </div>
      </div>

      {/* Mensagem de cobrança */}
      <p style={messageStyle}>{item.message}</p>

      {/* Meta: requisito + descrição */}
      <div style={metaRow}>
        <span style={reqCode}>{item.requirementCode}</span>
        <span style={reqDesc}>{item.requirementDescription}</span>
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderLeft: '3px solid',
  borderRadius: 'var(--radius-sm)',
  padding: '0.75rem 1rem',
  transition: 'border-color var(--duration-fast)',
};

const roleBadge: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '0.1rem 0.4rem',
  borderRadius: 'var(--radius-full)',
};

const nameStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
};

const lateBadge: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  fontFamily: 'var(--font-mono)',
};

const priorityDot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
};

const nudgeBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-default)',
  background: 'var(--bg-elevated)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  flexShrink: 0,
  transition: 'all var(--duration-fast)',
};

const sentLabel: React.CSSProperties = {
  fontSize: '0.625rem',
  fontWeight: 600,
  color: 'var(--vale-green)',
  whiteSpace: 'nowrap',
};

const messageStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.4,
  margin: '0 0 0.375rem',
};

const metaRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const reqCode: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  color: 'var(--vale-teal-light)',
  background: 'var(--glow-teal)',
  padding: '0.1rem 0.375rem',
  borderRadius: 'var(--radius-full)',
};

const reqDesc: React.CSSProperties = {
  fontSize: '0.6875rem',
  color: 'var(--text-muted)',
};
