/**
 * ACERVO PAGE — Gestao de conhecimento e projetos arquivados.
 *
 * Checklist 20:
 *   [x] Busca por projetos antigos
 *   [x] Sugestoes baseadas em falhas recorrentes
 *
 * Checklist 14:
 *   [x] Arquivar projetos encerrados
 *   [x] Historico de projetos do grupo
 */

import { useState } from 'react';
import {
  getProjetosArquivados,
  buscarProjetos,
  getLicoes,
  buscarLicoes,
  type ProjetoArquivado,
  type LicaoAprendida,
} from '@modules/conhecimento';

const pageStyle: React.CSSProperties = { padding: '24px 0', maxWidth: 800, margin: '0 auto' };
const headerStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 4,
};
const searchInput: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: 14,
  marginBottom: 16,
  fontFamily: 'inherit',
  outline: 'none',
};
const tabRow: React.CSSProperties = {
  display: 'flex',
  gap: 0,
  marginBottom: 16,
  borderBottom: '1px solid var(--border)',
};
const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  textAlign: 'center',
  border: 'none',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
  background: 'transparent',
  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
  borderBottom: active ? '2px solid var(--text-primary)' : '2px solid transparent',
  marginBottom: -1,
});
const cardStyle: React.CSSProperties = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: 16,
  marginBottom: 12,
};
const cardTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
  color: 'var(--text-primary)',
  marginBottom: 4,
};
const cardMeta: React.CSSProperties = { fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 };
const tagStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 6,
  fontSize: 11,
  background: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  marginRight: 4,
  border: '1px solid var(--border)',
};
const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: 40,
  color: 'var(--text-muted)',
};

type TabId = 'projetos' | 'licoes';

function statusLabel(status: string): string {
  if (status === 'concluido') return 'Concluido';
  if (status === 'cancelado') return 'Cancelado';
  return 'Arquivado';
}

export function AcervoPage() {
  const [activeTab, setActiveTab] = useState<TabId>('projetos');
  const [query, setQuery] = useState('');

  const projetos: ProjetoArquivado[] = query ? buscarProjetos(query) : getProjetosArquivados();
  const licoes: LicaoAprendida[] = query ? buscarLicoes(query) : getLicoes();

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Acervo</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Projetos encerrados e licoes aprendidas
      </p>

      <input
        type="text"
        style={searchInput}
        placeholder="Buscar por projeto, licao ou tag..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <div style={tabRow}>
        <button style={tabStyle(activeTab === 'projetos')} onClick={() => setActiveTab('projetos')}>
          Projetos ({projetos.length})
        </button>
        <button style={tabStyle(activeTab === 'licoes')} onClick={() => setActiveTab('licoes')}>
          Licoes ({licoes.length})
        </button>
      </div>

      {activeTab === 'projetos' && (
        <>
          {projetos.length === 0 && (
            <div style={emptyStyle}>
              <p style={{ fontSize: 14 }}>Nenhum projeto arquivado ainda.</p>
              <p style={{ fontSize: 12 }}>Projetos encerrados aparecerao aqui.</p>
            </div>
          )}
          {projetos.map(p => (
            <div key={p.projectId} style={cardStyle}>
              <div style={cardTitle}>{p.projectName}</div>
              <div style={cardMeta}>
                {statusLabel(p.statusFinal)}
                {' -- '}
                {p.dataInicio} a {p.dataFim}
                {' -- '}Fase {p.faseAlcancada}/{p.totalFases}
              </div>
              {p.membros.length > 0 && (
                <div>
                  {p.membros.map((m, i) => (
                    <span key={i} style={tagStyle}>
                      {m}
                    </span>
                  ))}
                </div>
              )}
              {p.licoes.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent-green)' }}>
                  {p.licoes.length} licao(oes) registrada(s)
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {activeTab === 'licoes' && (
        <>
          {licoes.length === 0 && (
            <div style={emptyStyle}>
              <p style={{ fontSize: 14 }}>Nenhuma licao aprendida ainda.</p>
              <p style={{ fontSize: 12 }}>Registre licoes ao concluir projetos.</p>
            </div>
          )}
          {licoes.map(l => (
            <div key={l.id} style={cardStyle}>
              <div style={cardTitle}>{l.titulo}</div>
              <div style={cardMeta}>
                {l.projectName} -- Fase {l.fase} -- {l.categoria}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                {l.descricao}
              </p>
              {l.tags.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {l.tags.map((t, i) => (
                    <span key={i} style={tagStyle}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
