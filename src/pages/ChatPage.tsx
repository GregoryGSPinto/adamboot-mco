import type React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@app/auth';
import { useProjetos } from '@modules/projeto';
import { ConversaProjeto } from '@modules/conversa';
import { subscribeNudges } from '@modules/chat/nudgeBus';
import { useEnviarMensagem } from '@modules/conversa';

/**
 * Página /chat — Conversa operacional.
 *
 * Se só 1 projeto ativo → abre direto.
 * Se vários → lista para escolher.
 *
 * Escuta nudgeBus: quando líder cobra pelo dashboard,
 * a mensagem aparece automaticamente aqui.
 */
export function ChatPage() {
  const { user } = useAuth();
  const { data: projetos, isLoading } = useProjetos();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const lista = projetos ?? [];
  const selected = lista.find((p) => p.projeto.id === selectedId);

  // Se só 1 projeto, auto-seleciona
  useEffect(() => {
    if (lista.length === 1 && !selectedId) {
      setSelectedId(lista[0].projeto.id);
    }
  }, [lista, selectedId]);

  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--vale-teal)', animation: 'pulse-step 1s ease-in-out infinite' }} />
        Carregando...
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
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={titleStyle}>Conversa</h1>
        <p style={subtitleStyle}>Escolha o projeto para abrir a conversa.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {lista.map((p) => (
          <button
            key={p.projeto.id}
            onClick={() => setSelectedId(p.projeto.id)}
            style={projectBtn}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{p.projeto.titulo}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--vale-teal-light)' }}>
                Fase {p.projeto.faseAtual} — {p.faseLabel}
              </div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>→</span>
          </button>
        ))}
      </div>

      {lista.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Nenhum projeto ativo.
        </div>
      )}
    </div>
  );
}

/**
 * Componente invisível que escuta nudges do dashboard
 * e os injeta como mensagens do sistema no chat.
 */
function NudgeReceiver({ projectId }: { projectId: string }) {
  const enviar = useEnviarMensagem(projectId);

  useEffect(() => {
    const unsub = subscribeNudges((msg) => {
      if (msg.projectId === projectId) {
        enviar.mutate({
          autorId: 'sistema',
          autorNome: 'Sistema MCO',
          faseAtual: 0, // sistema não pertence a fase
          texto: `🔔 ${msg.text}`,
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
  gap: '0.5rem',
  padding: '2rem',
  color: 'var(--text-muted)',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.375rem',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  marginTop: '0.125rem',
};

const projectBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  padding: '1rem 1.25rem',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-primary)',
  transition: 'all var(--duration-fast)',
};
