import type React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@app/auth';
import { useProjetos } from '@modules/projeto';
import { ConversaProjeto } from '@modules/conversa';
import { subscribeNudges } from '@modules/chat/nudgeBus';
import { useEnviarMensagem } from '@modules/conversa';

/**
 * Pagina /chat — Conversa operacional.
 *
 * Se so 1 projeto ativo → abre direto.
 * Se varios → lista para escolher.
 *
 * Escuta nudgeBus: quando lider cobra pelo dashboard,
 * a mensagem aparece automaticamente aqui.
 */
export function ChatPage() {
  const { user: _user } = useAuth();
  const { data: projetos, isLoading } = useProjetos();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const lista = projetos ?? [];
  const selected = lista.find(p => p.projeto.id === selectedId);

  // Se so 1 projeto, auto-seleciona
  useEffect(() => {
    if (lista.length === 1 && !selectedId) {
      setSelectedId(lista[0].projeto.id);
    }
  }, [lista, selectedId]);

  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
        <span>Carregando...</span>
      </div>
    );
  }

  // Projeto selecionado → conversa
  if (selected) {
    return (
      <div className="fade-in">
        <NudgeReceiver projectId={selected.projeto.id} />
        <ConversaProjeto
          projetoId={selected.projeto.id}
          projetoTitulo={selected.projeto.titulo}
          faseAtual={selected.projeto.faseAtual}
          onVoltar={() => setSelectedId(null)}
        />
      </div>
    );
  }

  // Seletor de projeto
  return (
    <div className="fade-in" style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={titleStyle}>Conversa</h1>
        <p style={subtitleStyle}>Escolha o projeto para abrir a conversa.</p>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        {lista.map((p, i) => (
          <button
            key={p.projeto.id}
            onClick={() => setSelectedId(p.projeto.id)}
            style={{
              ...projectBtn,
              borderBottom: i < lista.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-blue)' }}>
                {p.projeto.titulo}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Fase {p.projeto.faseAtual} — {p.faseLabel}
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ color: 'var(--text-muted)', flexShrink: 0 }}
            >
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>

      {lista.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
          Nenhum projeto ativo.
        </div>
      )}
    </div>
  );
}

/**
 * Componente invisivel que escuta nudges do dashboard
 * e os injeta como mensagens do sistema no chat.
 */
function NudgeReceiver({ projectId }: { projectId: string }) {
  const enviar = useEnviarMensagem(projectId);

  useEffect(() => {
    const unsub = subscribeNudges(msg => {
      if (msg.projectId === projectId) {
        enviar.mutate({
          autorId: 'sistema',
          autorNome: 'Sistema MCO',
          faseAtual: 0, // sistema nao pertence a fase
          texto: `[Alerta] ${msg.text}`,
        });
      }
    });
    return unsub;
  }, [projectId, enviar]);

  return null;
}

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 32,
  color: 'var(--text-muted)',
  fontSize: 14,
};

const spinnerStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  border: '2px solid var(--border)',
  borderTopColor: 'var(--text-muted)',
  borderRadius: '50%',
  animation: 'spin 0.6s linear infinite',
};

const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  margin: 0,
  color: 'var(--text-primary)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  marginTop: 4,
};

const projectBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: '12px 16px',
  background: 'var(--bg-primary)',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  color: 'var(--text-primary)',
  transition: 'background 0.15s',
};
