import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@app/auth';
import { useMission } from '@modules/mission';
import { useAdicionarProjeto, useRemoverProjeto } from '@modules/projeto';
import { computeLeaderFocus } from '@modules/mission/computeLeaderFocus';
import type { MissionPriority } from '@modules/mission';
import { MissionProjectCard } from '@modules/mission/components/MissionProjectCard';
import { MissionList } from '@modules/mission/components/MissionList';
import { MEMBROS } from '@shared/api/mock-projetos';

const URGENCIA_ICON: Record<string, string> = {
  critico: '🔴',
  urgente: '🟠',
  atencao: '🟡',
  info: '🔵',
};

const FOCUS_COLORS: Record<MissionPriority, { cor: string; bg: string }> = {
  CRITICAL: { cor: 'var(--sev-critica)', bg: 'var(--glow-red)' },
  HIGH:     { cor: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  MEDIUM:   { cor: 'var(--vale-gold)', bg: 'var(--glow-gold)' },
  LOW:      { cor: 'var(--vale-gray-light)', bg: 'rgba(116,118,120,0.12)' },
};

/**
 * MINHA MISSÃO — o coração do sistema.
 *
 * Usa useMission() que alimenta a engine MASP.
 * O líder abre e sabe:
 *   - Quem cobrar
 *   - O que está travado
 *   - Quanto tempo resta
 *
 * 3 níveis de drill-down:
 *   1. Cards de projeto (radar geral)
 *   2. Lista de pendências (expandido)
 *   3. Workspace do projeto (/projeto/:id)
 */
export function MissaoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { groups, isLoading } = useMission();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const addProjeto = useAdicionarProjeto();
  const removeProjeto = useRemoverProjeto();

  // ─── Loading ───
  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--vale-teal)', animation: 'pulse-step 1s ease-in-out infinite' }} />
        Carregando projetos...
      </div>
    );
  }

  // Ordenar: CRITICO/ALTO primeiro, depois resto
  const sorted = [...groups].sort((a, b) => {
    const riskOrder: Record<string, number> = { CRITICO: 5, ALTO: 4, MEDIO: 3, BAIXO: 2, EM_DIA: 1 };
    return (riskOrder[b.riskLevel] ?? 0) - (riskOrder[a.riskLevel] ?? 0);
  });

  const criticos = sorted.filter((g) => g.riskLevel === 'CRITICO' || g.riskLevel === 'ALTO');
  const demais = sorted.filter((g) => g.riskLevel !== 'CRITICO' && g.riskLevel !== 'ALTO');
  const totalPendencias = sorted.reduce((sum, g) => sum + g.items.length, 0);

  // IA messages for top summary
  const allAiMessages = sorted.flatMap((g) =>
    g.aiMessages.map((m) => ({ ...m, projectName: g.projectName }))
  ).sort((a, b) => {
    const ord: Record<string, number> = { critico: 0, urgente: 1, atencao: 2, info: 3 };
    return (ord[a.urgency] ?? 3) - (ord[b.urgency] ?? 3);
  }).slice(0, 3);

  const handleCardClick = (projectId: string) => {
    setExpandedId(expandedId === projectId ? null : projectId);
  };

  // ═══ LEADER FOCUS — cobranças imediatas ═══
  const { mainAlert, focus } = computeLeaderFocus(sorted);

  return (
    <div className="fade-in">
      {/* ═══ HEADER ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={titleStyle}>Minha Missão</h1>
          <p style={subtitleStyle}>
            {user?.name} — {totalPendencias === 0
              ? 'todos os projetos em dia.'
              : `${totalPendencias} pendência${totalPendencias > 1 ? 's' : ''} em ${sorted.length} projeto${sorted.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowNewProject(!showNewProject)} style={newProjectBtn}>
          {showNewProject ? '✕ Cancelar' : '+ Novo projeto'}
        </button>
      </div>

      {/* ═══ FORM NOVO PROJETO ═══ */}
      {showNewProject && (
        <NewProjectForm
          onSubmit={(dados) => {
            addProjeto.mutate(dados, { onSuccess: () => setShowNewProject(false) });
          }}
          isPending={addProjeto.isPending}
        />
      )}

      {/* ═══ CAMADA 1 — ALERTA PRINCIPAL ═══ */}
      {mainAlert && (
        <div style={mainAlertStyle}>
          <div style={mainAlertIcon}>⚠️</div>
          <p style={mainAlertText}>{mainAlert}</p>
        </div>
      )}

      {/* ═══ CAMADA 2 — O QUE COBRAR HOJE ═══ */}
      {focus.length > 0 && (
        <div style={focusSectionStyle}>
          <h2 style={focusTitleStyle}>O que cobrar hoje</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {focus.map((item, i) => {
              const colors = FOCUS_COLORS[item.priority];
              return (
                <div key={i} style={{ ...focusRowStyle, borderLeftColor: colors.cor }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                      <span style={{ ...focusDot, background: colors.cor }} />
                      <span style={focusName}>{item.responsibleName}</span>
                      <span style={focusArrow}>→</span>
                      <span style={focusMessage}>{item.message}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                      <span style={focusProject}>({item.projectName})</span>
                      {item.daysLate != null && item.daysLate > 0 && (
                        <span style={{ ...focusLate, color: colors.cor }}>
                          {item.daysLate}d
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ CAMADA 3 — PROJETOS ═══ */}

      {/* IA Messages (agora abaixo do focus) */}
      {allAiMessages.length > 0 && (
        <div style={iaBoxStyle}>
          <div style={iaLabelStyle}>Coordenador IA</div>
          {allAiMessages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: i < allAiMessages.length - 1 ? '0.5rem' : 0 }}>
              <span>{URGENCIA_ICON[msg.urgency] ?? '🔵'}</span>
              <span style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>{msg.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ CRITICAL / HIGH ═══ */}
      {criticos.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={sectionTitle}>
            <span style={{ color: 'var(--sev-critica)' }}>⚠</span> Atenção imediata
          </h2>
          <div style={cardColumn}>
            {criticos.map((g) => (
              <div key={g.projectId}>
                <MissionProjectCard group={g} onOpen={handleCardClick} />
                {expandedId === g.projectId && (
                  <div style={expandedBox} className="slide-up">
                    <MissionList group={g} />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        onClick={() => navigate(`/projeto/${g.projectId}`)}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Abrir projeto →
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir projeto "${g.projectName}"? Esta ação não pode ser desfeita.`))
                            removeProjeto.mutate(g.projectId);
                        }}
                        style={deleteProjBtn}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ REMAINING ═══ */}
      {demais.length > 0 && (
        <section>
          <h2 style={sectionTitle}>Projetos em andamento</h2>
          <div style={cardColumn}>
            {demais.map((g) => (
              <div key={g.projectId}>
                <MissionProjectCard group={g} onOpen={handleCardClick} />
                {expandedId === g.projectId && (
                  <div style={expandedBox} className="slide-up">
                    <MissionList group={g} />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        onClick={() => navigate(`/projeto/${g.projectId}`)}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Abrir projeto →
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir projeto "${g.projectName}"? Esta ação não pode ser desfeita.`))
                            removeProjeto.mutate(g.projectId);
                        }}
                        style={deleteProjBtn}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ EMPTY ═══ */}
      {sorted.length === 0 && (
        <div style={emptyStyle}>
          <span style={{ fontSize: '3rem', opacity: 0.3 }}>◎</span>
          <p style={{ color: 'var(--text-muted)' }}>Nenhum projeto ativo.</p>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════
// NOVO PROJETO — form inline
// ════════════════════════════════════

function NewProjectForm({ onSubmit, isPending }: {
  onSubmit: (dados: any) => void;
  isPending: boolean;
}) {
  const [titulo, setTitulo] = useState('');
  const [dataApr, setDataApr] = useState('2026-06-30');

  const handleSubmit = () => {
    if (!titulo.trim()) return;
    onSubmit({
      titulo: titulo.trim(),
      dataApresentacao: dataApr,
      liderId: MEMBROS[0]?.id ?? 'user-001',
      facilitadorId: MEMBROS.find((m) => m.papel === 'facilitador')?.id ?? 'user-002',
      membros: MEMBROS,
    });
  };

  return (
    <div style={newProjForm}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--vale-teal-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
        Criar novo projeto
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nome do projeto..."
          style={formInput}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <input type="date" value={dataApr} onChange={(e) => setDataApr(e.target.value)} style={{ ...formInput, maxWidth: 160 }} />
        <button onClick={handleSubmit} disabled={!titulo.trim() || isPending} style={formSubmitBtn}>
          {isPending ? '...' : 'Criar'}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

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

const iaBoxStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--vale-gold)',
  borderLeft: '3px solid var(--vale-gold)',
  borderRadius: 'var(--radius-md)',
  padding: '1rem 1.25rem',
  marginBottom: '1.5rem',
};

const iaLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--vale-gold)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '0.75rem',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '0.75rem',
  display: 'flex',
  gap: '0.375rem',
  alignItems: 'center',
};

const cardColumn: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const expandedBox: React.CSSProperties = {
  marginTop: '0.5rem',
  padding: '1rem',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '2rem',
  color: 'var(--text-muted)',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '4rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
};

// ── Camada 1: Alerta principal ──

const mainAlertStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  padding: '1rem 1.25rem',
  background: 'var(--glow-red)',
  border: '1px solid var(--sev-critica)',
  borderRadius: 'var(--radius-md)',
  marginBottom: '1.25rem',
};

const mainAlertIcon: React.CSSProperties = {
  fontSize: '1.5rem',
  lineHeight: 1,
  flexShrink: 0,
};

const mainAlertText: React.CSSProperties = {
  fontSize: '1.0625rem',
  fontWeight: 600,
  lineHeight: 1.4,
  color: 'var(--text-primary)',
  margin: 0,
};

// ── Camada 2: O que cobrar hoje ──

const focusSectionStyle: React.CSSProperties = {
  marginBottom: '1.5rem',
};

const focusTitleStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.625rem',
};

const focusRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.5rem 0.75rem',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderLeft: '3px solid',
  borderRadius: 'var(--radius-sm)',
};

const focusDot: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: '50%',
  flexShrink: 0,
};

const focusName: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const focusArrow: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  flexShrink: 0,
};

const focusMessage: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--text-secondary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const focusProject: React.CSSProperties = {
  fontSize: '0.6875rem',
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
};

const focusLate: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  fontFamily: 'var(--font-mono)',
};

// ── CRUD styles ──

const newProjectBtn: React.CSSProperties = {
  padding: '0.4rem 0.875rem', fontSize: '0.75rem', fontWeight: 700,
  border: '1px solid var(--vale-teal)', color: 'var(--vale-teal-light)',
  background: 'var(--glow-teal)', borderRadius: 8, cursor: 'pointer',
  fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0,
};

const deleteProjBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 8,
  border: '1px solid var(--sev-critica)', background: 'rgba(239,68,68,0.08)',
  color: 'var(--sev-critica)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1rem', flexShrink: 0,
};

const newProjForm: React.CSSProperties = {
  padding: '1rem 1.25rem', background: 'var(--bg-card)',
  border: '1px solid var(--vale-teal)', borderRadius: 'var(--radius-md)',
  marginBottom: '1.25rem',
};

const formInput: React.CSSProperties = {
  flex: 1, minWidth: 150, padding: '0.5rem 0.75rem',
  background: 'var(--bg-input)', border: '1px solid var(--border-default)',
  borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.875rem',
  fontFamily: 'var(--font-body)', outline: 'none',
};

const formSubmitBtn: React.CSSProperties = {
  padding: '0.5rem 1.25rem', background: 'var(--vale-teal)', color: 'white',
  border: 'none', borderRadius: 6, fontSize: '0.875rem', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
};
