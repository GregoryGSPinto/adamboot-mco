import type React from 'react';
import { useCallback, useRef } from 'react';
import type { MensagemProjeto } from '@shared/api/mock-conversa';
import { requisitosDaFase } from '@shared/engine/requisitos-masp';

interface Props {
  msg: MensagemProjeto;
  isOwn: boolean;
  /** Mensagem sendo respondida (se houver) */
  replyTo?: MensagemProjeto;
  onContextMenu: (id: string, x: number, y: number) => void;
}

/**
 * Bolha de mensagem — estilo WhatsApp com marcadores especiais.
 *
 * Visual:
 *   - Própria: alinhada à direita, fundo teal sutil
 *   - Outro:  alinhada à esquerda, fundo card
 *   - Sistema: centralizada, itálico
 *   - Decisão: borda lateral dourada, ícone ✔
 *   - Requisito: badge verde linkado
 */
export function MensagemItem({ msg, isOwn, replyTo, onContextMenu }: Props) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (msg.tipo !== 'sistema') {
      onContextMenu(msg.id, e.clientX, e.clientY);
    }
  }, [msg.id, msg.tipo, onContextMenu]);

  // Long press for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (msg.tipo === 'sistema') return;
    longPressTimer.current = setTimeout(() => {
      const touch = e.touches[0];
      onContextMenu(msg.id, touch.clientX, touch.clientY);
    }, 500);
  }, [msg.id, msg.tipo, onContextMenu]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  // Sistema: mensagem especial
  if (msg.tipo === 'sistema') {
    return (
      <div style={sistemaContainer}>
        <div style={sistemaBox}>
          <span style={{ fontSize: '0.6875rem' }}>⚙</span>
          <span>{msg.texto}</span>
        </div>
      </div>
    );
  }

  const reqName = msg.requisitoVinculado
    ? requisitosDaFase(msg.fase).find(r => r.id === msg.requisitoVinculado)?.descricaoCurta
    : undefined;

  const hora = new Date(msg.criadaEm).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        padding: '2px 0',
      }}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        style={{
          ...bubbleBase,
          background: isOwn ? 'var(--glow-teal)' : 'var(--bg-card)',
          borderColor: msg.ehDecisao ? 'var(--vale-gold)' : isOwn ? 'rgba(0,126,122,0.2)' : 'var(--border-subtle)',
          borderLeftWidth: msg.ehDecisao ? 3 : 1,
          borderLeftColor: msg.ehDecisao ? 'var(--vale-gold)' : undefined,
          maxWidth: '80%',
          minWidth: 120,
        }}
      >
        {/* Decisão badge */}
        {msg.ehDecisao && (
          <div style={decisaoBadge}>
            <span>✔</span> DECISÃO DO GRUPO
          </div>
        )}

        {/* Autor (só para mensagens de outros) */}
        {!isOwn && (
          <div style={autorStyle}>
            {msg.autorNome}
          </div>
        )}

        {/* Reply preview */}
        {replyTo && (
          <div style={replyBox}>
            <span style={{ fontWeight: 600, fontSize: '0.6875rem' }}>{replyTo.autorNome}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {replyTo.texto?.slice(0, 80) ?? '📷 Foto'}
            </span>
          </div>
        )}

        {/* Imagens */}
        {msg.anexos.filter(a => a.tipo === 'imagem').map(anx => (
          <div key={anx.id} style={imageContainer}>
            {/* Placeholder image with camera icon — em produção seria <img src={anx.thumbUrl}> */}
            <div style={imagePlaceholder}>
              <span style={{ fontSize: '2rem', opacity: 0.4 }}>📷</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{anx.nome}</span>
              <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {(anx.tamanho / 1_000_000).toFixed(1)} MB
              </span>
            </div>
          </div>
        ))}

        {/* Arquivos não-imagem */}
        {msg.anexos.filter(a => a.tipo !== 'imagem').map(anx => (
          <div key={anx.id} style={fileAttachment}>
            <span style={{ fontSize: '1.25rem' }}>
              {anx.tipo === 'pdf' ? '📄' : '📊'}
            </span>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{anx.nome}</div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {(anx.tamanho / 1_000_000).toFixed(1)} MB
              </div>
            </div>
          </div>
        ))}

        {/* Texto */}
        {msg.texto && (
          <div style={{ fontSize: '0.875rem', lineHeight: 1.45, wordBreak: 'break-word' }}>
            {msg.texto}
          </div>
        )}

        {/* Requisito vinculado */}
        {reqName && (
          <div style={requisitoTag}>
            <span>📎</span> {reqName}
          </div>
        )}

        {/* Hora */}
        <div style={horaStyle}>
          {hora}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const bubbleBase: React.CSSProperties = {
  border: '1px solid',
  borderRadius: 'var(--radius-md)',
  padding: '0.5rem 0.75rem',
  position: 'relative',
  cursor: 'default',
  transition: 'border-color var(--duration-fast)',
};

const decisaoBadge: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.5625rem',
  fontWeight: 700,
  color: 'var(--vale-gold)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.375rem',
  paddingBottom: '0.375rem',
  borderBottom: '1px solid var(--glow-gold)',
};

const autorStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: 'var(--vale-cyan)',
  marginBottom: '0.125rem',
};

const replyBox: React.CSSProperties = {
  background: 'var(--bg-input)',
  borderLeft: '2px solid var(--vale-teal)',
  borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
  padding: '0.25rem 0.5rem',
  marginBottom: '0.375rem',
  maxWidth: '100%',
  overflow: 'hidden',
};

const imageContainer: React.CSSProperties = {
  marginBottom: '0.375rem',
  borderRadius: 'var(--radius-sm)',
  overflow: 'hidden',
};

const imagePlaceholder: React.CSSProperties = {
  width: '100%',
  minWidth: 180,
  height: 160,
  background: 'var(--bg-input)',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem',
  border: '1px dashed var(--border-default)',
};

const fileAttachment: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  padding: '0.5rem 0.625rem',
  background: 'var(--bg-input)',
  borderRadius: 'var(--radius-sm)',
  marginBottom: '0.375rem',
};

const requisitoTag: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.625rem',
  fontWeight: 600,
  color: 'var(--vale-green)',
  background: 'var(--glow-green)',
  padding: '0.15rem 0.5rem',
  borderRadius: 'var(--radius-full)',
  marginTop: '0.375rem',
  border: '1px solid rgba(105,190,40,0.2)',
};

const horaStyle: React.CSSProperties = {
  fontSize: '0.5625rem',
  color: 'var(--text-muted)',
  textAlign: 'right',
  marginTop: '0.25rem',
  fontFamily: 'var(--font-mono)',
};

const sistemaContainer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  padding: '0.5rem 0',
};

const sistemaBox: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
  background: 'var(--bg-elevated)',
  padding: '0.375rem 1rem',
  borderRadius: 'var(--radius-full)',
  maxWidth: '85%',
  textAlign: 'center',
};
