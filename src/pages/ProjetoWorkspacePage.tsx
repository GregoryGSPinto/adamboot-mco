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

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'a3', label: 'A3', icon: '◈' },
  { key: 'missao', label: 'Missão', icon: '◎' },
  { key: 'conversa', label: 'Conversa', icon: '💬' },
  { key: 'reuniao', label: 'Reunião', icon: '👥' },
  { key: 'verificacao', label: 'Resultado', icon: '📊' },
  { key: 'apresentacao', label: 'Apresentar', icon: '📽' },
  { key: 'documentos', label: 'Docs', icon: '📚' },
];

/**
 * WORKSPACE DO PROJETO — container unificado.
 *
 * Envolve tudo em ProjectProvider.
 * O provider carrega StatusProjeto UMA VEZ.
 * Todas as abas leem do contexto — zero duplicação.
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

  // Registra projeto na memória do ReactionEngine
  useEffect(() => {
    registerProject(projectId, projeto.faseAtual);
  }, [projectId, projeto.faseAtual]);

  return (
    <div className="fade-in">
      {/* ═══ HEADER DO WORKSPACE ═══ */}
      <div style={wsHeaderStyle}>
        <button onClick={() => navigate('/missao')} style={backBtn}>← Missões</button>
        <div style={{ flex: 1 }}>
          <h1 style={wsTitleStyle}>{projeto.titulo}</h1>
          <span style={wsSubStyle}>
            Fase {projeto.faseAtual} — {status.faseLabel}
            {status.diasRestantes >= 0
              ? ` · ${status.diasRestantes}d restantes`
              : ` · ${Math.abs(status.diasRestantes)}d atrasado`}
          </span>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div style={tabBarStyle}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...tabBtnStyle,
                color: isActive ? 'var(--vale-teal-light)' : 'var(--text-muted)',
                borderBottomColor: isActive ? 'var(--vale-teal)' : 'transparent',
                background: isActive ? 'var(--glow-teal)' : 'transparent',
              }}
            >
              <span style={{ fontSize: '0.8125rem' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ TAB CONTENT ═══ */}
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
// TAB: MISSÃO
// Lê missionGroup do contexto — zero re-fetch
// ════════════════════════════════════

function TabMissao() {
  const { missionGroup } = useProjectContext();

  if (missionGroup.items.length === 0) {
    return (
      <div style={emptyTabStyle}>
        <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>✓</span>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Nenhuma pendência neste projeto. Tudo em dia.
        </p>
      </div>
    );
  }

  const { mainAlert, focus: _focus } = computeLeaderFocus([missionGroup]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {mainAlert && (
        <div style={alertStyle}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>{mainAlert}</p>
        </div>
      )}

      <div style={sectionLabelStyle}>
        Cobranças deste projeto ({missionGroup.items.length})
      </div>

      {missionGroup.items.map((item) => (
        <MissionItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}

// ════════════════════════════════════
// TAB: A3 (workspace principal — envolve CadernoView)
// A3WorkspaceView adiciona: step indicator, feedback, orientação
// ════════════════════════════════════

function TabA3() {
  return <A3WorkspaceView />;
}

// ════════════════════════════════════
// TAB: APRESENTAÇÃO (gerar slides automáticos)
// ════════════════════════════════════

function TabApresentacao() {
  return <GerarApresentacaoView />;
}

// ════════════════════════════════════
// TAB: CONVERSA
// Lê projeto do contexto + NudgeReceiver
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
// Lê evidências do contexto — zero fetch próprio
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={sectionLabelStyle}>
        {total} evidência{total !== 1 ? 's' : ''} registrada{total !== 1 ? 's' : ''}
      </div>

      {phases.map((fase) => {
        const items = byPhase.get(fase) ?? [];
        const label = FASE_LABELS[fase] ?? `Fase ${fase}`;
        const isPast = fase < projeto.faseAtual;
        const isCurrent = fase === projeto.faseAtual;

        return (
          <div key={fase} style={docPhaseRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <span style={{
                ...docPhaseBadge,
                background: isCurrent ? 'var(--glow-gold)' : isPast ? 'var(--glow-green)' : 'var(--bg-input)',
                color: isCurrent ? 'var(--vale-gold)' : isPast ? 'var(--vale-green)' : 'var(--text-muted)',
                borderColor: isCurrent ? 'var(--vale-gold)' : isPast ? 'rgba(105,190,40,0.3)' : 'var(--border-default)',
              }}>
                F{fase}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: isCurrent ? 600 : 400 }}>
                {label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {items.length > 0 ? (
                <>
                  {items.slice(0, 4).map((ev, idx) => (
                    <div key={idx} style={docDot} title={ev.requisitoId}>📎</div>
                  ))}
                  {items.length > 4 && (
                    <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      +{items.length - 4}
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
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
// NUDGE RECEIVER (invisível)
// Escuta cobranças do dashboard → injeta no chat
// ════════════════════════════════════

function NudgeReceiver() {
  const { projectId } = useProjectContext();
  const enviar = useEnviarMensagem(projectId);

  useEffect(() => {
    const unsub = subscribeNudges((msg) => {
      if (msg.projectId === projectId) {
        enviar.mutate({
          autorId: 'sistema',
          autorNome: 'Sistema MCO',
          faseAtual: 0,
          texto: `🔔 ${msg.text}`,
        });
      }
    });
    return unsub;
  }, [projectId, enviar]);

  return null;
}

// ════════════════════════════════════
// TAB: REUNIÃO
// Modo reunião com presença, decisões, tarefas, ata
// ════════════════════════════════════

function TabReuniao() {
  const { status } = useProjectContext();

  return (
    <ReuniaoPanel status={status} />
  );
}

// ════════════════════════════════════
// TAB: VERIFICAÇÃO
// Antes/depois, resultado, confirmação eliminação
// ════════════════════════════════════

function TabVerificacao() {
  const { status } = useProjectContext();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div />
        <RelatorioExport status={status} userId="arttrens-001" />
      </div>
      <VerificacaoPanel projectId={status.projeto.id} userId="arttrens-001" />
    </div>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const wsHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem',
};

const backBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
  fontSize: '0.8125rem', padding: '0.25rem 0', fontFamily: 'var(--font-body)', flexShrink: 0,
  marginTop: '0.25rem',
};

const wsTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.3,
};

const wsSubStyle: React.CSSProperties = {
  fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem', display: 'block',
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex', gap: '2px', borderBottom: '1px solid var(--border-subtle)',
  marginBottom: '1.25rem', overflowX: 'auto',
};

const tabBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.375rem',
  padding: '0.625rem 1rem', border: 'none', borderBottom: '2px solid',
  fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'var(--font-body)',
  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all var(--duration-fast)',
};

const tabContentStyle: React.CSSProperties = {
  minHeight: 200,
};

const emptyTabStyle: React.CSSProperties = {
  textAlign: 'center', padding: '3rem 1rem',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
};

const alertStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
  padding: '1rem 1.25rem', background: 'var(--glow-red)',
  border: '1px solid var(--sev-critica)', borderRadius: 'var(--radius-md)',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem',
};

const docPhaseRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0.5rem 0.625rem', background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
};

const docPhaseBadge: React.CSSProperties = {
  fontSize: '0.5625rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
  padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-full)',
  border: '1px solid', flexShrink: 0,
};

const docDot: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 'var(--radius-xs)',
  background: 'var(--bg-input)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem',
};
