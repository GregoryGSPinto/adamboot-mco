import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectProvider, useProjectContext } from '@modules/projeto';
import { registerProject } from '@modules/ai';
import { computeLeaderFocus } from '@modules/mission/computeLeaderFocus';
import { MissionItemRow } from '@modules/mission/components/MissionItemRow';
import { ConversaProjeto } from '@modules/conversa';
import { subscribeNudges } from '@modules/chat/nudgeBus';
import { useEnviarMensagem } from '@modules/conversa';
import { FASE_LABELS } from '@shared/engine';
import type { EvidenciaCumprida } from '@shared/engine';
import { ReuniaoPanel } from '@modules/reuniao/ReuniaoPanel';
import { VerificacaoPanel } from '@modules/verificacao/VerificacaoPanel';
import { RelatorioExport } from '@modules/relatorio/RelatorioExport';
import { A3WorkspaceView } from '@modules/a3/A3WorkspaceView';
import { GerarApresentacaoView } from '@modules/a3/GerarApresentacaoView';

type Tab = 'a3' | 'missao' | 'conversa' | 'reuniao' | 'verificacao' | 'apresentacao' | 'documentos';

const TABS: { key: Tab; label: string }[] = [
  { key: 'a3', label: 'A3' },
  { key: 'missao', label: 'Missao' },
  { key: 'conversa', label: 'Conversa' },
  { key: 'reuniao', label: 'Reuniao' },
  { key: 'verificacao', label: 'Resultado' },
  { key: 'apresentacao', label: 'Apresentar' },
  { key: 'documentos', label: 'Docs' },
];

/**
 * WORKSPACE DO PROJETO — container unificado.
 *
 * Envolve tudo em ProjectProvider.
 * O provider carrega StatusProjeto UMA VEZ.
 * Todas as abas leem do contexto — zero duplicacao.
 *
 * Teste de arquitetura:
 *   "Se mudar de 8 para 10 fases, quantos arquivos altera?"
 *   Resposta: 1 (requisitos-masp.ts)
 */
export function ProjetoWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/missao');
    return null;
  }

  return (
    <ProjectProvider projectId={id}>
      <WorkspaceContent />
    </ProjectProvider>
  );
}

// ════════════════════════════════════
// WORKSPACE CONTENT (dentro do provider)
// ════════════════════════════════════

function WorkspaceContent() {
  const { status, projectId } = useProjectContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('a3');

  const projeto = status.projeto;

  // Registra projeto na memoria do ReactionEngine
  useEffect(() => {
    registerProject(projectId, projeto.faseAtual);
  }, [projectId, projeto.faseAtual]);

  return (
    <div className="fade-in" style={{ padding: '24px 0' }}>
      {/* HEADER DO WORKSPACE */}
      <div style={wsHeaderStyle}>
        <button onClick={() => navigate('/missao')} style={backBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 4 }}>
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Missoes
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={wsTitleStyle}>{projeto.titulo}</h1>
          <span style={wsSubStyle}>
            Fase {projeto.faseAtual} — {status.faseLabel}
            {status.diasRestantes >= 0
              ? ` -- ${status.diasRestantes}d restantes`
              : ` -- ${Math.abs(status.diasRestantes)}d atrasado`}
          </span>
        </div>
      </div>

      {/* TABS */}
      <div style={tabBarStyle}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...tabBtnStyle,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottomColor: isActive ? 'var(--text-primary)' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div style={tabContentStyle}>
        {activeTab === 'a3' && <TabA3 />}
        {activeTab === 'missao' && <TabMissao />}
        {activeTab === 'conversa' && <TabConversa onBack={() => setActiveTab('a3')} />}
        {activeTab === 'reuniao' && <TabReuniao />}
        {activeTab === 'verificacao' && <TabVerificacao />}
        {activeTab === 'apresentacao' && <TabApresentacao />}
        {activeTab === 'documentos' && <TabDocumentos />}
      </div>
    </div>
  );
}

// ════════════════════════════════════
// TAB: MISSAO
// ════════════════════════════════════

function TabMissao() {
  const { missionGroup } = useProjectContext();

  if (missionGroup.items.length === 0) {
    return (
      <div style={emptyTabStyle}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Nenhuma pendencia neste projeto. Tudo em dia.
        </p>
      </div>
    );
  }

  const { mainAlert, focus: _focus } = computeLeaderFocus([missionGroup]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {mainAlert && (
        <div style={alertStyle}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--accent-red)' }}>
            {mainAlert}
          </p>
        </div>
      )}

      <div style={sectionLabelStyle}>Cobrancas deste projeto ({missionGroup.items.length})</div>

      {missionGroup.items.map(item => (
        <MissionItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}

// ════════════════════════════════════
// TAB: A3
// ════════════════════════════════════

function TabA3() {
  return <A3WorkspaceView />;
}

// ════════════════════════════════════
// TAB: APRESENTACAO
// ════════════════════════════════════

function TabApresentacao() {
  return <GerarApresentacaoView />;
}

// ════════════════════════════════════
// TAB: CONVERSA
// ════════════════════════════════════

function TabConversa({ onBack }: { onBack: () => void }) {
  const { status, projectId } = useProjectContext();
  const projeto = status.projeto;

  return (
    <>
      <NudgeReceiver />
      <ConversaProjeto
        projetoId={projectId}
        projetoTitulo={projeto.titulo}
        faseAtual={projeto.faseAtual}
        onVoltar={onBack}
      />
    </>
  );
}

// ════════════════════════════════════
// TAB: DOCUMENTOS
// ════════════════════════════════════

function TabDocumentos() {
  const { status } = useProjectContext();
  const projeto = status.projeto;

  const byPhase = new Map<number, EvidenciaCumprida[]>();
  for (const ev of projeto.evidencias) {
    const match = ev.requisitoId.match(/^F(\d+)/);
    const fase = match ? Number(match[1]) : projeto.faseAtual;
    const list = byPhase.get(fase) ?? [];
    list.push(ev);
    byPhase.set(fase, list);
  }

  const phases = Array.from({ length: 8 }, (_, i) => i + 1);
  const total = projeto.evidencias.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={sectionLabelStyle}>
        {total} evidencia{total !== 1 ? 's' : ''} registrada{total !== 1 ? 's' : ''}
      </div>

      {phases.map(fase => {
        const items = byPhase.get(fase) ?? [];
        const label = FASE_LABELS[fase] ?? `Fase ${fase}`;
        const isPast = fase < projeto.faseAtual;
        const isCurrent = fase === projeto.faseAtual;

        return (
          <div key={fase} style={docPhaseRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <span
                style={{
                  ...docPhaseBadge,
                  background: isCurrent
                    ? 'var(--accent-yellow)'
                    : isPast
                      ? 'var(--accent-green)'
                      : 'var(--bg-secondary)',
                  color: '#fff',
                }}
              >
                F{fase}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: isCurrent ? 600 : 400,
                  color: 'var(--text-primary)',
                }}
              >
                {label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {items.length > 0 ? (
                <>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-secondary)',
                      padding: '1px 6px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                    }}
                  >
                    {items.length}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {fase <= projeto.faseAtual ? 'sem registros' : '—'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════
// NUDGE RECEIVER (invisivel)
// ════════════════════════════════════

function NudgeReceiver() {
  const { projectId } = useProjectContext();
  const enviar = useEnviarMensagem(projectId);

  useEffect(() => {
    const unsub = subscribeNudges(msg => {
      if (msg.projectId === projectId) {
        enviar.mutate({
          autorId: 'sistema',
          autorNome: 'Sistema MCO',
          faseAtual: 0,
          texto: `[Alerta] ${msg.text}`,
        });
      }
    });
    return unsub;
  }, [projectId, enviar]);

  return null;
}

// ════════════════════════════════════
// TAB: REUNIAO
// ════════════════════════════════════

function TabReuniao() {
  const { status } = useProjectContext();
  return <ReuniaoPanel status={status} />;
}

// ════════════════════════════════════
// TAB: VERIFICACAO
// ════════════════════════════════════

function TabVerificacao() {
  const { status } = useProjectContext();

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div />
        <RelatorioExport status={status} userId="demo-user-001" />
      </div>
      <VerificacaoPanel projectId={status.projeto.id} userId="demo-user-001" />
    </div>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const wsHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  marginBottom: 16,
};

const backBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: 14,
  padding: '4px 0',
  fontFamily: 'inherit',
  flexShrink: 0,
  marginTop: 2,
  display: 'flex',
  alignItems: 'center',
};

const wsTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.3,
  color: 'var(--text-primary)',
};

const wsSubStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary)',
  marginTop: 2,
  display: 'block',
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 0,
  borderBottom: '1px solid var(--border)',
  marginBottom: 16,
  overflowX: 'auto',
};

const tabBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: 'none',
  borderBottom: '2px solid',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'inherit',
  background: 'transparent',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s',
  marginBottom: -1,
};

const tabContentStyle: React.CSSProperties = {
  minHeight: 200,
};

const emptyTabStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px 16px',
};

const alertStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--accent-red)',
  borderRadius: 6,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 4,
};

const docPhaseRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
};

const docPhaseBadge: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  padding: '2px 6px',
  borderRadius: 6,
  flexShrink: 0,
};
