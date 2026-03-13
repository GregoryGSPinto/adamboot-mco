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
        <div style={spinnerStyle} />
        <span>Carregando...</span>
      </div>
    );
  }

  // Auto-redirect se só 1 projeto
  if (lista.length === 1) {
    navigate(`/projeto/${lista[0].projeto.id}`, { replace: true });
    return null;
  }

  return (
    <div className="fade-in" style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={pageTitleStyle}>Caderno do Projeto</h1>
        <p style={pageSubtitleStyle}>Selecione o projeto para abrir.</p>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        {lista.map((s, i) => (
          <button
            key={s.projeto.id}
            onClick={() => navigate(`/projeto/${s.projeto.id}`)}
            style={{
              ...rowBtn,
              borderBottom: i < lista.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-blue)' }}>
                {s.projeto.titulo}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Fase {s.projeto.faseAtual}/{TOTAL_FASES} — {s.faseLabel}
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
    </div>
  );
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

const pageTitleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  margin: 0,
  color: 'var(--text-primary)',
};

const pageSubtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  marginTop: 4,
};

const rowBtn: React.CSSProperties = {
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
