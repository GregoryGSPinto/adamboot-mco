import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjetos } from '@modules/projeto';
import { TOTAL_FASES } from '@shared/engine';

/**
 * CADERNO DO PROJETO — seletor standalone /projeto.
 *
 * Se 1 projeto → redireciona direto para workspace.
 * Se vários → lista para escolher.
 */
export function ProjetoPage() {
  const { data: projetos, isLoading } = useProjetos();
  const navigate = useNavigate();

  const lista = projetos ?? [];

  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div style={pulseStyle} />
        Carregando projetos...
      </div>
    );
  }

  // Auto-redirect se só 1 projeto
  if (lista.length === 1) {
    navigate(`/projeto/${lista[0].projeto.id}`, { replace: true });
    return null;
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={pageTitleStyle}>Caderno do Projeto</h1>
        <p style={pageSubtitleStyle}>Selecione o projeto para abrir.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {lista.map((s) => (
          <button
            key={s.projeto.id}
            onClick={() => navigate(`/projeto/${s.projeto.id}`)}
            style={selectorBtn}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{s.projeto.titulo}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--vale-teal-light)' }}>
                Fase {s.projeto.faseAtual}/{TOTAL_FASES} — {s.faseLabel}
              </div>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const loadingStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem', color: 'var(--text-muted)',
};

const pulseStyle: React.CSSProperties = {
  width: 8, height: 8, borderRadius: '50%', background: 'var(--vale-teal)', animation: 'pulse-step 1s ease-in-out infinite',
};

const pageTitleStyle: React.CSSProperties = {
  fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0,
};

const pageSubtitleStyle: React.CSSProperties = {
  fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.125rem',
};

const selectorBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
  padding: '1rem 1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-body)',
  color: 'var(--text-primary)', transition: 'all var(--duration-fast)',
};
