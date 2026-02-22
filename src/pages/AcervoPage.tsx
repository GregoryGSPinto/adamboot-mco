/**
 * ACERVO PAGE — Gestão de conhecimento e projetos arquivados.
 *
 * Checklist 20:
 *   [x] Busca por projetos antigos
 *   [x] Sugestões baseadas em falhas recorrentes
 *
 * Checklist 14:
 *   [x] Arquivar projetos encerrados
 *   [x] Histórico de projetos do grupo
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

const pageStyle: React.CSSProperties = { padding: 16, maxWidth: 800, margin: '0 auto' };
const headerStyle: React.CSSProperties = { fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 };
const searchInput: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-default)',
  background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 20, minHeight: 48,
};
const tabRow: React.CSSProperties = { display: 'flex', gap: 4, marginBottom: 16 };
const tab = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 8, border: 'none', fontWeight: 600,
  fontSize: '0.85rem', cursor: 'pointer', minHeight: 44,
  background: active ? 'var(--vale-teal)' : 'var(--surface-tertiary)',
  color: active ? '#fff' : 'var(--text-secondary)',
});
const cardStyle: React.CSSProperties = {
  background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 16, marginBottom: 12,
};
const cardTitle: React.CSSProperties = { fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 };
const cardMeta: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 8 };
const tagStyle: React.CSSProperties = {
  display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem',
  background: 'var(--surface-tertiary)', color: 'var(--text-secondary)', marginRight: 4,
};
const emptyStyle: React.CSSProperties = { textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' };

type TabId = 'projetos' | 'licoes';

export function AcervoPage() {
  const [activeTab, setActiveTab] = useState<TabId>('projetos');
  const [query, setQuery] = useState('');

  const projetos: ProjetoArquivado[] = query ? buscarProjetos(query) : getProjetosArquivados();
  const licoes: LicaoAprendida[] = query ? buscarLicoes(query) : getLicoes();

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>📚 Acervo</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        Projetos encerrados e lições aprendidas
      </p>

      <input
        type="text"
        style={searchInput}
        placeholder="🔍 Buscar por projeto, lição ou tag..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div style={tabRow}>
        <button style={tab(activeTab === 'projetos')} onClick={() => setActiveTab('projetos')}>
          📁 Projetos ({projetos.length})
        </button>
        <button style={tab(activeTab === 'licoes')} onClick={() => setActiveTab('licoes')}>
          💡 Lições ({licoes.length})
        </button>
      </div>

      {activeTab === 'projetos' && (
        <>
          {projetos.length === 0 && (
            <div style={emptyStyle}>
              <p style={{ fontSize: '1.5rem' }}>📂</p>
              <p>Nenhum projeto arquivado ainda.</p>
              <p style={{ fontSize: '0.8rem' }}>Projetos encerrados aparecerão aqui.</p>
            </div>
          )}
          {projetos.map((p) => (
            <div key={p.projectId} style={cardStyle}>
              <div style={cardTitle}>{p.projectName}</div>
              <div style={cardMeta}>
                {p.statusFinal === 'concluido' ? '✅' : p.statusFinal === 'cancelado' ? '❌' : '📦'} {p.statusFinal}
                {' · '}{p.dataInicio} → {p.dataFim}
                {' · '}Fase {p.faseAlcancada}/{p.totalFases}
              </div>
              {p.membros.length > 0 && (
                <div>
                  {p.membros.map((m, i) => <span key={i} style={tagStyle}>{m}</span>)}
                </div>
              )}
              {p.licoes.length > 0 && (
                <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--vale-green)' }}>
                  💡 {p.licoes.length} lição(ões) registrada(s)
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
              <p style={{ fontSize: '1.5rem' }}>💡</p>
              <p>Nenhuma lição aprendida ainda.</p>
              <p style={{ fontSize: '0.8rem' }}>Registre lições ao concluir projetos.</p>
            </div>
          )}
          {licoes.map((l) => (
            <div key={l.id} style={cardStyle}>
              <div style={cardTitle}>{l.titulo}</div>
              <div style={cardMeta}>
                {l.projectName} · Fase {l.fase} · {l.categoria}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{l.descricao}</p>
              {l.tags.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {l.tags.map((t, i) => <span key={i} style={tagStyle}>{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
