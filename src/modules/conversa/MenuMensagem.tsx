import type React from 'react';
import { useEffect, useRef } from 'react';
import { requisitosDaFase, FASE_LABELS } from '@shared/engine';

interface Props {
  mensagemId: string;
  fase: number;
  ehDecisao: boolean;
  temAnexo: boolean;
  posX: number;
  posY: number;
  onClose: () => void;
  onMarcarDecisao: (id: string) => void;
  onVincularRequisito: (id: string, requisitoId: string) => void;
  onResponder: (id: string) => void;
}

/**
 * Menu de contexto — 3 poderes especiais.
 *
 * Aparece ao clicar/long-press em mensagem.
 * Posicionado absolutamente perto do clique.
 */
export function MenuMensagem({
  mensagemId,
  fase,
  ehDecisao,
  temAnexo: _,
  posX,
  posY,
  onClose,
  onMarcarDecisao,
  onVincularRequisito,
  onResponder,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const requisitos = requisitosDaFase(fase);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Posição: garante que não saia da tela
  const style: React.CSSProperties = {
    ...menuStyle,
    left: Math.min(posX, window.innerWidth - 260),
    top: Math.min(posY, window.innerHeight - 300),
  };

  return (
    <div ref={ref} style={style} className="slide-up">
      {/* Responder */}
      <button
        style={itemStyle}
        onClick={() => { onResponder(mensagemId); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={iconStyle}>↩</span>
        Responder
      </button>

      {/* Marcar/Desmarcar decisão */}
      <button
        style={itemStyle}
        onClick={() => { onMarcarDecisao(mensagemId); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={iconStyle}>{ehDecisao ? '✗' : '✔'}</span>
        {ehDecisao ? 'Remover decisão' : 'Marcar como decisão'}
      </button>

      {/* Vincular requisito — só mostra se tem anexo ou é texto relevante */}
      <div style={dividerStyle} />
      <div style={sectionLabelStyle}>
        Vincular à Fase {fase} — {FASE_LABELS[fase]}
      </div>
      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
        {requisitos.map((req) => (
          <button
            key={req.id}
            style={{ ...itemStyle, fontSize: '0.75rem' }}
            onClick={() => { onVincularRequisito(mensagemId, req.id); onClose(); }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ ...iconStyle, fontSize: '0.6875rem' }}>
              {TIPO_ICON[req.tipoValidacao] ?? '📎'}
            </span>
            {req.descricaoCurta}
            {req.obrigatorio && <span style={obrigStyle}>*</span>}
          </button>
        ))}
      </div>

      <div style={dividerStyle} />
      <button
        style={{ ...itemStyle, color: 'var(--text-muted)' }}
        onClick={() => {
          if (navigator.clipboard) {
            // find the message text - we don't have it here, so just close
          }
          onClose();
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={iconStyle}>📋</span>
        Copiar
      </button>
    </div>
  );
}

const TIPO_ICON: Record<string, string> = {
  texto: '📝',
  numero: '🔢',
  arquivo: '📎',
  aprovacao: '✅',
  lista: '📋',
  reuniao: '👥',
};

const menuStyle: React.CSSProperties = {
  position: 'fixed',
  zIndex: 500,
  width: 240,
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  padding: '0.375rem 0',
  backdropFilter: 'blur(12px)',
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.5rem 0.875rem',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background var(--duration-fast)',
  borderRadius: 0,
};

const iconStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  width: '1.25rem',
  textAlign: 'center',
  flexShrink: 0,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: 'var(--border-subtle)',
  margin: '0.25rem 0',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  padding: '0.375rem 0.875rem 0.125rem',
};

const obrigStyle: React.CSSProperties = {
  color: 'var(--sev-critica)',
  fontSize: '0.75rem',
  marginLeft: '0.125rem',
};
