/**
 * IMPEDIMENTO FORM — Formulário de registro de impedimento.
 *
 * Checklist:
 *   [x] Registrar impedimento (6)
 *   [x] Botão de impedimento por risco (13)
 *
 * Membro seleciona tipo, descreve, e envia.
 * Líder é notificado automaticamente.
 */

import { useState } from 'react';
import {
  registrarImpedimento,
  IMPEDIMENTO_LABELS,
  type ImpedimentoTipo,
} from '@modules/impedimento';

interface ImpedimentoFormProps {
  projectId: string;
  userId: string;
  userName: string;
  requisitoId?: string;
  acaoId?: string;
  onClose: () => void;
  onRegistrado?: () => void;
}

const TIPOS = Object.entries(IMPEDIMENTO_LABELS) as [ImpedimentoTipo, string][];

export function ImpedimentoForm({
  projectId,
  userId,
  userName,
  requisitoId,
  acaoId,
  onClose,
  onRegistrado,
}: ImpedimentoFormProps) {
  const [tipo, setTipo] = useState<ImpedimentoTipo>('outro');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = () => {
    if (!descricao.trim()) return;
    setEnviando(true);

    registrarImpedimento({
      projectId,
      requisitoId,
      acaoId,
      tipo,
      descricao: descricao.trim(),
      userId,
      userName,
    });

    setEnviando(false);
    setEnviado(true);
    onRegistrado?.();

    setTimeout(onClose, 1200);
  };

  if (enviado) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...modalStyle, textAlign: 'center', padding: '40px 24px' }}>
          <span style={{ fontSize: '40px' }}>✅</span>
          <p style={{ fontSize: '16px', fontWeight: 600, margin: '12px 0 4px' }}>
            Impedimento registrado
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #666)' }}>
            O líder será notificado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <span style={{ fontSize: '20px' }}>🚧</span>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Registrar impedimento</h3>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Tipo */}
        <div>
          <label style={labelStyle}>Tipo do impedimento</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {TIPOS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTipo(key)}
                style={{
                  ...tagStyle,
                  background: tipo === key ? 'var(--vale-teal, #007e7a)' : 'var(--surface-1, #f0f0f0)',
                  color: tipo === key ? '#fff' : 'var(--text-primary, #333)',
                  borderColor: tipo === key ? 'var(--vale-teal)' : 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label style={labelStyle}>O que está impedindo?</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva brevemente o impedimento..."
            rows={3}
            style={textareaStyle}
            maxLength={300}
          />
          <span style={{ fontSize: '11px', color: '#999' }}>{descricao.length}/300</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={btnSecondaryStyle}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!descricao.trim() || enviando}
            style={{
              ...btnPrimaryStyle,
              opacity: descricao.trim() ? 1 : 0.5,
            }}
          >
            {enviando ? 'Enviando...' : 'Registrar'}
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
  padding: '20px',
  maxWidth: '420px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const closeBtn: React.CSSProperties = {
  marginLeft: 'auto',
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  padding: '4px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary, #555)',
  marginBottom: '4px',
};

const tagStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid transparent',
  borderRadius: '16px',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid var(--border-color, #ddd)',
  borderRadius: '8px',
  fontSize: '14px',
  resize: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  marginTop: '4px',
};

const btnPrimaryStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  border: 'none',
  borderRadius: '10px',
  background: 'var(--vale-teal, #007e7a)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnSecondaryStyle: React.CSSProperties = {
  padding: '12px 16px',
  border: '1px solid var(--border-color, #ddd)',
  borderRadius: '10px',
  background: 'transparent',
  color: 'var(--text-primary, #333)',
  fontSize: '13px',
  cursor: 'pointer',
};
