/**
 * LGPD CONSENT MODAL — Termo de responsabilidade no primeiro acesso.
 *
 * Checklist:
 *   [x] Termo de responsabilidade no primeiro acesso (25)
 *   [x] Aviso de uso de imagem ao anexar foto (25)
 *
 * Bloqueia uso do app até aceite.
 * Versão do termo fica no módulo LGPD.
 */

import { useState } from 'react';
import {
  verificarConsentimento,
  registrarConsentimento,
  TERMO_RESPONSABILIDADE,
  VERSAO_TERMO_ATUAL,
} from '@modules/lgpd';

interface LGPDConsentModalProps {
  userId: string;
  userName: string;
  onAccept: () => void;
}

export function LGPDConsentModal({ userId, userName, onAccept }: LGPDConsentModalProps) {
  const [checked, setChecked] = useState(false);

  // Se já consentiu, não mostra
  if (verificarConsentimento(userId)) {
    return null;
  }

  const handleAccept = () => {
    if (!checked) return;
    registrarConsentimento(userId, userName);
    onAccept();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <span style={{ fontSize: '24px' }}>📋</span>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary, #1a1a1a)' }}>
            Termo de Responsabilidade
          </h2>
        </div>

        <div style={bodyStyle}>
          <pre style={termoStyle}>{TERMO_RESPONSABILIDADE}</pre>
        </div>

        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--btn-primary-bg)' }}
          />
          <span style={{ fontSize: '14px' }}>
            Li e aceito os termos acima (v{VERSAO_TERMO_ATUAL})
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!checked}
          style={{
            ...btnStyle,
            opacity: checked ? 1 : 0.5,
            cursor: checked ? 'pointer' : 'not-allowed',
          }}
        >
          Aceitar e continuar
        </button>
      </div>
    </div>
  );
}

/**
 * Aviso de uso de imagem — mostra antes de abrir câmera.
 */
export function ImageUseWarning({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: '380px' }}>
        <div style={headerStyle}>
          <span style={{ fontSize: '24px' }}>📷</span>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Aviso de uso de imagem</h3>
        </div>

        <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary, #555)' }}>
          Ao anexar uma foto, você confirma que:
        </p>
        <ul
          style={{
            fontSize: '13px',
            lineHeight: '1.6',
            paddingLeft: '20px',
            color: 'var(--text-secondary, #555)',
          }}
        >
          <li>A imagem não contém informações pessoais sensíveis</li>
          <li>Pessoas na imagem foram informadas</li>
          <li>Uso exclusivo para fins do projeto CCQ</li>
        </ul>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button onClick={onCancel} style={btnSecondaryStyle}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={btnStyle}>
            Confirmar e anexar
          </button>
        </div>
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
  padding: '24px',
  maxWidth: '440px',
  width: '100%',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const bodyStyle: React.CSSProperties = {
  overflowY: 'auto',
  maxHeight: '300px',
  border: '1px solid var(--border-color, #e0e0e0)',
  borderRadius: '8px',
  padding: '12px',
  background: 'var(--surface-1, #f8f8f8)',
};

const termoStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  fontSize: '12px',
  lineHeight: '1.6',
  fontFamily: 'inherit',
  margin: 0,
  color: 'var(--text-secondary, #555)',
};

const checkboxRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
};

const btnStyle: React.CSSProperties = {
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
  flex: 1,
  padding: '12px',
  border: '1px solid var(--border-color, #ddd)',
  borderRadius: '10px',
  background: 'transparent',
  color: 'var(--text-primary, #333)',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
};
