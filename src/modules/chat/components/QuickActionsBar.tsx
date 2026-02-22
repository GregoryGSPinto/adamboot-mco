/**
 * QUICK ACTIONS BAR — Botões rápidos acima do input do chat.
 *
 * Checklist:
 *   [x] Botões rápidos (2)
 *   [x] Criar ação pelo chat (5)
 *
 * Renderiza chips contextuais baseados na fase atual e perfil do usuário.
 * Ao clicar, insere template no input ou dispara ação direta.
 */

import { useState } from 'react';
import { getQuickActions, type QuickAction } from '../quickActions';

interface QuickActionsBarProps {
  faseAtual: number;
  perfil: string;
  reuniaoAtiva: boolean;
  onInsertText: (text: string) => void;
  onAction: (type: string) => void;
}

export function QuickActionsBar({
  faseAtual,
  perfil,
  reuniaoAtiva,
  onInsertText,
  onAction,
}: QuickActionsBarProps) {
  const [expanded, setExpanded] = useState(false);
  const actions = getQuickActions({ faseAtual, perfil, reuniaoAtiva });

  if (actions.length === 0) return null;

  const visible = expanded ? actions : actions.slice(0, 4);

  return (
    <div style={barStyle}>
      <div style={scrollStyle}>
        {visible.map((action) => (
          <button
            key={action.type}
            style={chipStyle}
            onClick={() => {
              if (action.templateMensagem) {
                onInsertText(action.templateMensagem);
              } else {
                onAction(action.type);
              }
            }}
            title={action.label}
          >
            <span>{action.icon}</span>
            <span style={chipLabelStyle}>{action.label}</span>
          </button>
        ))}

        {actions.length > 4 && (
          <button
            style={{ ...chipStyle, background: 'var(--surface-2, #e0e0e0)' }}
            onClick={() => setExpanded(!expanded)}
          >
            <span>{expanded ? '◂' : '▸'}</span>
            <span style={chipLabelStyle}>{expanded ? 'Menos' : `+${actions.length - 4}`}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Styles ──

const barStyle: React.CSSProperties = {
  display: 'flex',
  padding: '6px 12px',
  borderTop: '1px solid var(--border-color, #e0e0e0)',
  background: 'var(--surface-1, #f8f8f8)',
  overflowX: 'auto',
};

const scrollStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'nowrap',
};

const chipStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 12px',
  border: '1px solid var(--border-color, #ddd)',
  borderRadius: '20px',
  background: 'var(--surface-0, #fff)',
  cursor: 'pointer',
  fontSize: '13px',
  whiteSpace: 'nowrap',
  minHeight: '36px',
  transition: 'background 0.15s',
};

const chipLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
};
