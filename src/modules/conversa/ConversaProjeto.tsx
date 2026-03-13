import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@app/auth';
import {
  useMensagens,
  useEnviarMensagem,
  useMarcarDecisao,
  useVincularRequisito,
  useUploadFoto,
} from '@modules/conversa';
import type { MensagemProjeto } from '@shared/api/mock-conversa';
import { FASE_LABELS } from '@shared/engine';
import { MensagemItem } from './MensagemItem';
import { SeparadorFase } from './SeparadorFase';
import { InputOperacional } from './InputOperacional';
import { MenuMensagem } from './MenuMensagem';

interface Props {
  projetoId: string;
  projetoTitulo: string;
  faseAtual: number;
  onVoltar: () => void;
}

/**
 * ConversaProjeto — Conversa Operacional Estruturada.
 *
 * Layout WhatsApp-like:
 *   header (projeto + fase)
 *   ↕ mensagens scrolláveis (com separadores de fase)
 *   ↓ InputOperacional fixo no bottom
 *
 * Poderes especiais via long-press:
 *   - Marcar decisão
 *   - Vincular requisito
 *   - Responder
 */
export function ConversaProjeto({ projetoId, projetoTitulo, faseAtual, onVoltar }: Props) {
  const { user } = useAuth();
  const { data: mensagens, isLoading } = useMensagens(projetoId);
  const enviar = useEnviarMensagem(projetoId);
  const marcarDecisao = useMarcarDecisao(projetoId);
  const vincularReq = useVincularRequisito(projetoId);
  const uploadFoto = useUploadFoto();

  const [replyTo, setReplyTo] = useState<MensagemProjeto | null>(null);
  const [menuState, setMenuState] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ao receber mensagem nova
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens?.length]);

  // Enviar mensagem
  const handleEnviar = useCallback(
    (texto: string, anexos: import('@shared/api/mock-conversa').Anexo[]) => {
      if (!user) return;
      enviar.mutate({
        autorId: user.id,
        autorNome: user.name,
        faseAtual,
        texto,
        anexos,
        respostaA: replyTo?.id,
      });
      setReplyTo(null);
    },
    [user, faseAtual, enviar, replyTo]
  );

  // Context menu handlers
  const handleContextMenu = useCallback((id: string, x: number, y: number) => {
    setMenuState({ id, x, y });
  }, []);

  const handleMarcarDecisao = useCallback(
    (id: string) => {
      marcarDecisao.mutate(id);
    },
    [marcarDecisao]
  );

  const handleVincularRequisito = useCallback(
    (mensagemId: string, requisitoId: string) => {
      vincularReq.mutate({ mensagemId, requisitoId });
    },
    [vincularReq]
  );

  const handleResponder = useCallback(
    (id: string) => {
      const msg = mensagens?.find(m => m.id === id);
      if (msg) setReplyTo(msg);
    },
    [mensagens]
  );

  // Build message list with phase separators
  const renderMensagens = () => {
    if (!mensagens?.length) return null;

    const elements: React.ReactNode[] = [];
    let lastFase: number | null = null;

    for (const msg of mensagens) {
      // Insert phase separator when phase changes
      if (msg.fase !== lastFase) {
        elements.push(<SeparadorFase key={`sep-${msg.fase}`} fase={msg.fase} />);
        lastFase = msg.fase;
      }

      const replyMsg = msg.respostaA ? mensagens.find(m => m.id === msg.respostaA) : undefined;

      elements.push(
        <MensagemItem
          key={msg.id}
          msg={msg}
          isOwn={msg.autorId === user?.id}
          replyTo={replyMsg}
          onContextMenu={handleContextMenu}
        />
      );
    }

    return elements;
  };

  const menuMsg = menuState ? mensagens?.find(m => m.id === menuState.id) : null;

  // Count decisions
  const decisoesCount = mensagens?.filter(m => m.ehDecisao).length ?? 0;

  return (
    <div style={containerStyle}>
      {/* ═══ HEADER ═══ */}
      <div style={headerStyle}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}
        >
          <button onClick={onVoltar} style={voltarBtn} aria-label="Voltar">
            ←
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {projetoTitulo}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.6875rem',
              }}
            >
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                Fase {faseAtual} — {FASE_LABELS[faseAtual]}
              </span>
              {decisoesCount > 0 && (
                <span
                  style={{
                    color: 'var(--accent-yellow)',
                    background: 'var(--accent-yellow-subtle)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                  }}
                >
                  {decisoesCount} decisões
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MESSAGES ═══ */}
      <div ref={scrollRef} style={messagesAreaStyle}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Carregando conversa...
          </div>
        ) : mensagens?.length === 0 ? (
          <div style={emptyState}>
            <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>💬</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Nenhuma mensagem ainda.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Comece registrando uma evidência com 📷
            </p>
          </div>
        ) : (
          <div style={{ padding: '0.5rem 0.75rem' }}>{renderMensagens()}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ═══ INPUT ═══ */}
      <InputOperacional
        onEnviar={handleEnviar}
        onUploadFoto={nome => uploadFoto.mutateAsync(nome)}
        isPending={enviar.isPending}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />

      {/* ═══ CONTEXT MENU ═══ */}
      {menuState && menuMsg && (
        <MenuMensagem
          mensagemId={menuState.id}
          fase={menuMsg.fase}
          ehDecisao={menuMsg.ehDecisao}
          temAnexo={menuMsg.anexos.length > 0}
          posX={menuState.x}
          posY={menuState.y}
          onClose={() => setMenuState(null)}
          onMarcarDecisao={handleMarcarDecisao}
          onVincularRequisito={handleVincularRequisito}
          onResponder={handleResponder}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 130px)', // subtract app header + footer
  maxWidth: 800,
  margin: '0 auto',
  background: 'var(--bg-primary)',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-md)',
};

const headerStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid var(--border)',
  flexShrink: 0,
};

const voltarBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.125rem',
  flexShrink: 0,
  transition: 'all 0.1s',
};

const messagesAreaStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  overscrollBehavior: 'contain',
};

const emptyState: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '4rem 1rem',
  textAlign: 'center',
};
