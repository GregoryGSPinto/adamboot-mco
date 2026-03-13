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

const URGENCIA_LABEL: Record<string, string> = {
  critico: 'Critico',
  urgente: 'Urgente',
  atencao: 'Atencao',
  info: 'Info',
};

const FOCUS_BORDER_COLORS: Record<MissionPriority, string> = {
  CRITICAL: 'var(--accent-red)',
  HIGH: 'var(--sev-alta)',
  MEDIUM: 'var(--accent-yellow)',
  LOW: 'var(--text-muted)',
};

/**
 * MINHA MISSAO — GitHub-minimal flat design.
 *
 * Usa useMission() que alimenta a engine MASP.
 * O lider abre e sabe:
 *   - Quem cobrar
 *   - O que esta travado
 *   - Quanto tempo resta
 *
 * 3 niveis de drill-down:
 *   1. Cards de projeto (radar geral)
 *   2. Lista de pendencias (expandido)
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

  // Loading
  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          style={{ animation: 'spin 0.8s linear infinite' }}
          fill="none"
        >
          <circle cx="8" cy="8" r="6" stroke="var(--border)" strokeWidth="2" />
          <path
            d="M14 8a6 6 0 00-6-6"
            stroke="var(--text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>Carregando projetos...</span>
      </div>
    );
  }

  // Sort: CRITICO/ALTO first
  const sorted = [...groups].sort((a, b) => {
    const riskOrder: Record<string, number> = {
      CRITICO: 5,
      ALTO: 4,
      MEDIO: 3,
      BAIXO: 2,
      EM_DIA: 1,
    };
    return (riskOrder[b.riskLevel] ?? 0) - (riskOrder[a.riskLevel] ?? 0);
  });

  const criticos = sorted.filter(g => g.riskLevel === 'CRITICO' || g.riskLevel === 'ALTO');
  const demais = sorted.filter(g => g.riskLevel !== 'CRITICO' && g.riskLevel !== 'ALTO');
  const totalPendencias = sorted.reduce((sum, g) => sum + g.items.length, 0);

  // IA messages for top summary
  const allAiMessages = sorted
    .flatMap(g => g.aiMessages.map(m => ({ ...m, projectName: g.projectName })))
    .sort((a, b) => {
      const ord: Record<string, number> = { critico: 0, urgente: 1, atencao: 2, info: 3 };
      return (ord[a.urgency] ?? 3) - (ord[b.urgency] ?? 3);
    })
    .slice(0, 3);

  const handleCardClick = (projectId: string) => {
    setExpandedId(expandedId === projectId ? null : projectId);
  };

  // Leader focus
  const { mainAlert, focus } = computeLeaderFocus(sorted);

  return (
    <div style={{ fontFamily: 'var(--font-family)' }}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Minha Missao</h1>
          <p style={subtitleStyle}>
            {user?.name} —{' '}
            {totalPendencias === 0
              ? 'todos os projetos em dia.'
              : `${totalPendencias} pendencia${totalPendencias > 1 ? 's' : ''} em ${sorted.length} projeto${sorted.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowNewProject(!showNewProject)} style={newProjectBtn}>
          {showNewProject ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {/* NEW PROJECT FORM */}
      {showNewProject && (
        <NewProjectForm
          onSubmit={dados => {
            addProjeto.mutate(dados, { onSuccess: () => setShowNewProject(false) });
          }}
          isPending={addProjeto.isPending}
        />
      )}

      {/* ALERT BANNER */}
      {mainAlert && (
        <div style={mainAlertStyle}>
          <span style={mainAlertLabel}>Alerta</span>
          <p style={mainAlertText}>{mainAlert}</p>
        </div>
      )}

      {/* FOCUS: O que cobrar hoje */}
      {focus.length > 0 && (
        <section style={sectionBlock}>
          <h2 style={sectionTitleStyle}>O que cobrar hoje</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {focus.map((item, i) => {
              const borderColor = FOCUS_BORDER_COLORS[item.priority];
              return (
                <div key={i} style={{ ...focusRowStyle, borderLeftColor: borderColor }}>
                  <span style={focusName}>{item.responsibleName}</span>
                  <span style={focusArrow}>&rarr;</span>
                  <span style={focusMessage}>{item.message}</span>
                  <span style={focusProject}>({item.projectName})</span>
                  {item.daysLate != null && item.daysLate > 0 && (
                    <span style={{ ...focusLate, color: borderColor }}>{item.daysLate}d</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* IA MESSAGES */}
      {allAiMessages.length > 0 && (
        <section style={sectionBlock}>
          <h2 style={sectionTitleStyle}>Coordenador IA</h2>
          <div style={iaBoxStyle}>
            {allAiMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: i < allAiMessages.length - 1 ? 8 : 0,
                  fontSize: 14,
                  lineHeight: '20px',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  [{URGENCIA_LABEL[msg.urgency] ?? 'Info'}]
                </span>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CRITICAL / HIGH */}
      {criticos.length > 0 && (
        <section style={sectionBlock}>
          <h2 style={sectionTitleStyle}>Atencao imediata</h2>
          <div style={cardColumn}>
            {criticos.map(g => (
              <div key={g.projectId}>
                <MissionProjectCard group={g} onOpen={handleCardClick} />
                {expandedId === g.projectId && (
                  <div style={expandedBox}>
                    <MissionList group={g} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => navigate(`/projeto/${g.projectId}`)}
                        style={openProjectBtn}
                      >
                        Abrir projeto
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Excluir projeto "${g.projectName}"? Esta acao nao pode ser desfeita.`
                            )
                          )
                            removeProjeto.mutate(g.projectId);
                        }}
                        style={deleteBtn}
                      >
                        X
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* REMAINING */}
      {demais.length > 0 && (
        <section style={sectionBlock}>
          <h2 style={sectionTitleStyle}>Projetos em andamento</h2>
          <div style={cardColumn}>
            {demais.map(g => (
              <div key={g.projectId}>
                <MissionProjectCard group={g} onOpen={handleCardClick} />
                {expandedId === g.projectId && (
                  <div style={expandedBox}>
                    <MissionList group={g} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => navigate(`/projeto/${g.projectId}`)}
                        style={openProjectBtn}
                      >
                        Abrir projeto
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Excluir projeto "${g.projectName}"? Esta acao nao pode ser desfeita.`
                            )
                          )
                            removeProjeto.mutate(g.projectId);
                        }}
                        style={deleteBtn}
                      >
                        X
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EMPTY */}
      {sorted.length === 0 && (
        <div style={emptyStyle}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhum projeto ativo.</p>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════
// NEW PROJECT FORM
// ════════════════════════════════════

interface NovoProjetoFormData {
  titulo: string;
  dataApresentacao: string;
  liderId: string;
  facilitadorId: string;
  membros: { id: string; nome: string; papel: 'lider' | 'membro' | 'facilitador' }[];
}

function NewProjectForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (dados: NovoProjetoFormData) => void;
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
      facilitadorId: MEMBROS.find(m => m.papel === 'facilitador')?.id ?? 'user-002',
      membros: MEMBROS,
    });
  };

  return (
    <div style={newProjForm}>
      <div style={formLabel}>Criar novo projeto</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Nome do projeto..."
          style={formInput}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <input
          type="date"
          value={dataApr}
          onChange={e => setDataApr(e.target.value)}
          style={{ ...formInput, maxWidth: 160 }}
        />
        <button
          onClick={handleSubmit}
          disabled={!titulo.trim() || isPending}
          style={{
            ...formSubmitBtn,
            opacity: !titulo.trim() || isPending ? 0.5 : 1,
            cursor: !titulo.trim() || isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? '...' : 'Criar'}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 24,
};

const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
  margin: 0,
  fontFamily: 'var(--font-family)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  marginTop: 2,
  margin: 0,
};

const sectionBlock: React.CSSProperties = {
  marginBottom: 24,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 12,
  fontFamily: 'var(--font-family)',
};

const cardColumn: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const expandedBox: React.CSSProperties = {
  marginTop: 8,
  padding: 16,
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
};

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 32,
  color: 'var(--text-secondary)',
  fontSize: 14,
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '64px 16px',
};

// Alert

const mainAlertStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '12px 16px',
  background: 'var(--accent-red-subtle)',
  borderLeft: '3px solid var(--accent-red)',
  borderRadius: 6,
  marginBottom: 24,
};

const mainAlertLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--accent-red)',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  lineHeight: '20px',
};

const mainAlertText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  color: 'var(--text-primary)',
  margin: 0,
};

// Focus rows

const focusRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-subtle)',
  borderLeft: '3px solid',
  borderRadius: 6,
  fontSize: 14,
};

const focusName: React.CSSProperties = {
  fontWeight: 600,
  whiteSpace: 'nowrap',
  color: 'var(--text-primary)',
};

const focusArrow: React.CSSProperties = {
  color: 'var(--text-muted)',
  flexShrink: 0,
};

const focusMessage: React.CSSProperties = {
  color: 'var(--text-secondary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  minWidth: 0,
};

const focusProject: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const focusLate: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  fontFamily: 'var(--font-mono)',
  flexShrink: 0,
};

// IA box

const iaBoxStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderLeft: '3px solid var(--accent-yellow)',
  borderRadius: 6,
};

// Buttons

const newProjectBtn: React.CSSProperties = {
  padding: '4px 12px',
  fontSize: 14,
  fontWeight: 600,
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  background: 'var(--bg-primary)',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: 'var(--font-family)',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  height: 32,
};

const openProjectBtn: React.CSSProperties = {
  flex: 1,
  padding: '4px 16px',
  fontSize: 14,
  fontWeight: 600,
  background: 'var(--btn-primary-bg)',
  color: 'var(--btn-primary-text)',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: 'var(--font-family)',
  height: 32,
};

const deleteBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--font-family)',
  flexShrink: 0,
};

// New project form

const newProjForm: React.CSSProperties = {
  padding: '16px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  marginBottom: 24,
};

const formLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 8,
};

const formInput: React.CSSProperties = {
  flex: 1,
  minWidth: 150,
  padding: '6px 12px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text-primary)',
  fontSize: 14,
  fontFamily: 'var(--font-family)',
  outline: 'none',
  lineHeight: '20px',
};

const formSubmitBtn: React.CSSProperties = {
  padding: '6px 16px',
  background: 'var(--btn-primary-bg)',
  color: 'var(--btn-primary-text)',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--font-family)',
  whiteSpace: 'nowrap',
};
