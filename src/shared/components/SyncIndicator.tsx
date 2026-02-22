/**
 * SYNC INDICATOR — Indicador visual de sync/offline no header.
 *
 * Checklist:
 *   [x] Indicador de sync (1)
 *   [x] Modo degradado sem servidor (26)
 *   [x] Aviso de manutenção (26)
 *
 * Mostra bolinha colorida + texto no header.
 * Verde = online, Amarelo = syncing, Vermelho = offline/error.
 */

import { useState, useEffect } from 'react';
import { subscribeOffline, getOfflineState, type OfflineState } from '@modules/offline';
import { getSystemMode, subscribeSystemMode, getAvisosManutencao, type SystemMode } from '@modules/continuidade';

export function SyncIndicator() {
  const [state, setState] = useState<OfflineState>(getOfflineState());
  const [mode, setMode] = useState<SystemMode>(getSystemMode());

  useEffect(() => {
    const unsub1 = subscribeOffline(setState);
    const unsub2 = subscribeSystemMode(setMode);
    return () => { unsub1(); unsub2(); };
  }, []);

  const notices = getAvisosManutencao();
  const hasNotice = notices.length > 0;

  // Determinar visual
  let dot: string;
  let label: string;
  let color: string;

  if (mode === 'manutencao') {
    dot = '🔧';
    label = 'Manutenção';
    color = 'var(--vale-gold, #edb111)';
  } else if (mode === 'readonly') {
    dot = '🔒';
    label = 'Somente leitura';
    color = 'var(--vale-gold, #edb111)';
  } else if (mode === 'degradado') {
    dot = '⚡';
    label = 'Modo degradado';
    color = 'var(--vale-gold, #edb111)';
  } else if (!state.isOnline) {
    dot = '●';
    label = 'Offline';
    color = '#e53935';
  } else if (state.syncStatus === 'syncing') {
    dot = '●';
    label = `Sincronizando (${state.queueLength})`;
    color = 'var(--vale-gold, #edb111)';
  } else if (state.syncStatus === 'error') {
    dot = '●';
    label = `Erro sync (${state.queueLength})`;
    color = '#e53935';
  } else if (state.queueLength > 0) {
    dot = '●';
    label = `${state.queueLength} pendente${state.queueLength > 1 ? 's' : ''}`;
    color = 'var(--vale-gold, #edb111)';
  } else {
    dot = '●';
    label = 'Online';
    color = 'var(--vale-green, #69be28)';
  }

  return (
    <div style={containerStyle} title={label}>
      <span style={{ color, fontSize: '10px', lineHeight: 1 }}>{dot}</span>
      <span style={{ ...labelStyle, color }}>{label}</span>

      {hasNotice && (
        <div style={noticeStyle}>
          🔧 {notices[0].mensagem}
        </div>
      )}
    </div>
  );
}

// ── Styles ──

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: '12px',
  background: 'var(--surface-1, rgba(0,0,0,0.05))',
  cursor: 'default',
  position: 'relative',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.02em',
};

const noticeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '4px',
  padding: '8px 12px',
  background: 'var(--vale-gold, #edb111)',
  color: '#000',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  zIndex: 100,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};
