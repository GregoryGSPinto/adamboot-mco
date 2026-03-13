/**
 * EPI CHECK DIALOG — Alerta de área + checklist de EPI.
 *
 * Checklist:
 *   [x] Alerta de área antes de abrir câmera (13)
 *   [x] Check de EPI antes do registro (13)
 *   [x] Botão de impedimento por risco (13)
 *
 * Mostra ANTES de abrir câmera:
 *   1. Confirma zona de segurança
 *   2. Checklist de EPI (se zona amarela/vermelha)
 *   3. Botão de impedimento por risco
 */

import { useState } from 'react';
import {
  getZonaAtual,
  EPI_ITENS,
  registrarCheckEPI,
  podeAbrirCamera,
  type ZonaSeguranca,
} from '@modules/seguranca';

interface EPICheckDialogProps {
  userId: string;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  onImpedimento: () => void;
}

export function EPICheckDialog({
  userId,
  userName,
  onConfirm,
  onCancel,
  onImpedimento,
}: EPICheckDialogProps) {
  const zona = getZonaAtual();
  const camera = podeAbrirCamera();
  const [checkedEPIs, setCheckedEPIs] = useState<Set<string>>(new Set());

  const toggleEPI = (item: string) => {
    setCheckedEPIs(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const epiOk = !zona.exigeEPI || checkedEPIs.size >= 4;

  const handleConfirm = () => {
    if (zona.exigeEPI) {
      registrarCheckEPI(userId, userName, [...checkedEPIs]);
    }
    onConfirm();
  };

  // Cores por zona
  const zonaColors: Record<ZonaSeguranca, { bg: string; border: string; text: string }> = {
    verde: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
    amarela: { bg: '#fff8e1', border: '#ff9800', text: '#e65100' },
    vermelha: { bg: '#fce4ec', border: '#f44336', text: '#c62828' },
  };
  const zc = zonaColors[zona.zona];

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Zona Banner */}
        <div style={{ ...zonaBannerStyle, background: zc.bg, borderColor: zc.border }}>
          <span style={{ fontSize: '20px' }}>
            {zona.zona === 'verde' ? '✅' : zona.zona === 'amarela' ? '⚠️' : '🚫'}
          </span>
          <div>
            <strong style={{ color: zc.text, fontSize: '14px' }}>
              Zona {zona.zona.toUpperCase()}
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: zc.text }}>{zona.mensagem}</p>
          </div>
        </div>

        {/* Câmera bloqueada em zona vermelha */}
        {!camera.permitido && (
          <div style={blockedStyle}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#c62828' }}>
              📷 Câmera bloqueada nesta área
            </p>
            <p style={{ fontSize: '12px', color: '#666' }}>Registre apenas texto nesta zona.</p>
            <button onClick={onCancel} style={btnPrimaryStyle}>
              Entendi
            </button>
          </div>
        )}

        {/* EPI Checklist */}
        {camera.permitido && zona.exigeEPI && (
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 8px' }}>
              Confirme seus EPIs:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {EPI_ITENS.map(item => (
                <label key={item} style={epiRowStyle}>
                  <input
                    type="checkbox"
                    checked={checkedEPIs.has(item)}
                    onChange={() => toggleEPI(item)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--btn-primary-bg)' }}
                  />
                  <span style={{ fontSize: '14px' }}>{item}</span>
                </label>
              ))}
            </div>
            {checkedEPIs.size > 0 && checkedEPIs.size < 4 && (
              <p style={{ fontSize: '11px', color: '#e65100', marginTop: '6px' }}>
                Mínimo 4 EPIs para prosseguir
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {camera.permitido && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={onCancel} style={btnSecondaryStyle}>
              Cancelar
            </button>
            <button
              onClick={onImpedimento}
              style={{ ...btnSecondaryStyle, color: '#c62828', borderColor: '#c62828' }}
            >
              🚧 Risco
            </button>
            <button
              onClick={handleConfirm}
              disabled={!epiOk}
              style={{
                ...btnPrimaryStyle,
                opacity: epiOk ? 1 : 0.5,
                cursor: epiOk ? 'pointer' : 'not-allowed',
              }}
            >
              ✅ Prosseguir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ──

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px',
};

const modalStyle: React.CSSProperties = {
  background: 'var(--surface-0, #fff)',
  borderRadius: '16px',
  padding: '20px',
  maxWidth: '400px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
};

const zonaBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '12px',
  borderRadius: '10px',
  borderLeft: '4px solid',
};

const blockedStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '16px 0',
};

const epiRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '6px 0',
  cursor: 'pointer',
};

const btnPrimaryStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  border: 'none',
  borderRadius: '10px',
  background: 'var(--btn-primary-bg)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnSecondaryStyle: React.CSSProperties = {
  padding: '12px',
  border: '1px solid var(--border-color, #ddd)',
  borderRadius: '10px',
  background: 'transparent',
  color: 'var(--text-primary, #333)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
};
