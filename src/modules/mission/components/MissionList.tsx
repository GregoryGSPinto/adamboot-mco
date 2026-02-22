import type React from 'react';
import type { MissionGroup } from '../types';
import { priorityWeight } from '../priority';
import { MissionItemRow } from './MissionItemRow';

interface Props {
  group: MissionGroup;
}

/**
 * Lista de pendências de um projeto.
 *
 * Ordenação: CRITICAL → HIGH → MEDIUM → LOW.
 * O líder vê o mais urgente primeiro, sem pensar.
 */
export function MissionList({ group }: Props) {
  const sorted = [...group.items].sort(
    (a, b) => priorityWeight(b.priority) - priorityWeight(a.priority),
  );

  if (sorted.length === 0) {
    return (
      <div style={emptyStyle}>
        <span style={{ color: 'var(--vale-green)', fontSize: '1.25rem' }}>✓</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          Todos os requisitos cumpridos. Pronto para avançar.
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={headerStyle}>
        <span>Pendências — {group.phaseName}</span>
        <span style={countBadge}>{sorted.length}</span>
      </div>
      {sorted.map((item) => (
        <MissionItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '0 0.25rem 0.25rem',
};

const countBadge: React.CSSProperties = {
  background: 'var(--bg-input)',
  padding: '0.1rem 0.5rem',
  borderRadius: 'var(--radius-full)',
  fontSize: '0.6875rem',
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
};

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '1rem',
  justifyContent: 'center',
};
