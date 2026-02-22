import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { ChatMessage } from '../types';

interface Props {
  message: ChatMessage;
  isOwn: boolean;
  onMarkDecision?: (id: string) => void;
}

/**
 * Bolha de mensagem estilo WhatsApp.
 *
 * - Foto grande quando presente
 * - Texto curto
 * - Long press (500ms) → menu para marcar decisão
 * - Decisão marcada = borda dourada + badge
 */
export function ChatBubble({ message, isOwn, onMarkDecision }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const longPressRef = useRef<ReturnType<typeof setTimeout>>();

  const handleTouchStart = useCallback(() => {
    longPressRef.current = setTimeout(() => setShowMenu(true), 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  }, []);

  const hora = new Date(message.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', padding: '2px 0' }}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        style={{
          ...bubbleStyle,
          background: isOwn ? 'var(--glow-teal)' : 'var(--bg-card)',
          borderColor: message.isDecision ? 'var(--vale-gold)' : isOwn ? 'rgba(0,126,122,0.2)' : 'var(--border-subtle)',
          borderLeftWidth: message.isDecision ? 3 : 1,
          borderLeftColor: message.isDecision ? 'var(--vale-gold)' : undefined,
        }}
      >
        {/* Decision badge */}
        {message.isDecision && (
          <div style={decisionBadge}>✔ DECISÃO DO GRUPO</div>
        )}

        {/* Author */}
        {!isOwn && (
          <div style={authorStyle}>{message.authorName}</div>
        )}

        {/* Image */}
        {message.imageUrl && (
          <div style={imagePlaceholder}>
            <span style={{ fontSize: '2rem', opacity: 0.4 }}>📷</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Foto</span>
          </div>
        )}

        {/* Text */}
        {message.text && (
          <div style={{ fontSize: '0.875rem', lineHeight: 1.45, wordBreak: 'break-word' }}>
            {message.text}
          </div>
        )}

        {/* Linked requirement */}
        {message.linkedRequirementCode && (
          <div style={reqTag}>
            📎 {message.linkedRequirementCode}
          </div>
        )}

        {/* Time */}
        <div style={timeStyle}>{hora}</div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div
          style={menuOverlay}
          onClick={() => setShowMenu(false)}
        >
          <div style={menuBox} onClick={(e) => e.stopPropagation()}>
            <button
              style={menuBtn}
              onClick={() => {
                onMarkDecision?.(message.id);
                setShowMenu(false);
              }}
            >
              {message.isDecision ? '✗ Remover decisão' : '✔ Marcar como decisão'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const bubbleStyle: React.CSSProperties = {
  border: '1px solid',
  borderRadius: 'var(--radius-md)',
  padding: '0.5rem 0.75rem',
  maxWidth: '80%',
  minWidth: 120,
  position: 'relative',
};

const decisionBadge: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontWeight: 700,
  color: 'var(--vale-gold)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.375rem',
  paddingBottom: '0.375rem',
  borderBottom: '1px solid var(--glow-gold)',
};

const authorStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: 'var(--vale-cyan)',
  marginBottom: '0.125rem',
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
  marginBottom: '0.375rem',
};

const reqTag: React.CSSProperties = {
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

const timeStyle: React.CSSProperties = {
  fontSize: '0.5625rem',
  color: 'var(--text-muted)',
  textAlign: 'right',
  marginTop: '0.25rem',
  fontFamily: 'var(--font-mono)',
};

const menuOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 500,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const menuBox: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: '0.375rem 0',
  boxShadow: 'var(--shadow-lg)',
  minWidth: 200,
};

const menuBtn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.625rem 1rem',
  background: 'none',
  border: 'none',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
};
