import type React from 'react';
import { useState, useCallback, useRef } from 'react';
import { requisitosDaFase, FASE_LABELS, TOTAL_FASES } from '@shared/engine';
import type { StatusProjeto, EvidenciaCumprida, RequisitoPendente, AcaoProjeto } from '@shared/engine';
import { dispatchNudge } from '@modules/chat/nudgeBus';
import { useCumprirRequisito, useRemoverEvidencia, useAdicionarAcao, useRemoverAcao, useAvancarFaseProjeto } from '@modules/projeto';

/**
 * CadernoView — o documento vivo do projeto CCQ.
 *
 * CRUD completo:
 *   ✓ Marcar/desmarcar requisitos como cumpridos
 *   ✓ Avançar fase
 *   ✓ Adicionar/remover ações
 *   ✓ Cobrar responsáveis
 *
 * Recebe StatusProjeto e renderiza tudo.
 */
export function CadernoView({ status }: { status: StatusProjeto }) {
  const { projeto, faseLabel, bloqueio, diasRestantes } = status;
  const lider = projeto.membros.find((m) => m.papel === 'lider');
  const facilitador = projeto.membros.find((m) => m.papel === 'facilitador');
  const membros = projeto.membros.filter((m) => m.papel === 'membro');
  const ano = projeto.dataInicio.slice(0, 4);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [showAddAcao, setShowAddAcao] = useState(false);

  const avancarFase = useAvancarFaseProjeto(projeto.id);

  const fasesCompletas = projeto.faseAtual - 1;
  const percentFaseAtual = bloqueio.totalRequisitos > 0
    ? (bloqueio.cumpridos / bloqueio.totalRequisitos) * 100 : 0;
  const progressoGeral = Math.round(
    ((fasesCompletas + percentFaseAtual / 100) / TOTAL_FASES) * 100,
  );

  const evidenciasPorFase = new Map<number, EvidenciaCumprida[]>();
  for (const ev of projeto.evidencias) {
    const match = ev.requisitoId.match(/^F(\d+)/);
    const fase = match ? Number(match[1]) : projeto.faseAtual;
    const list = evidenciasPorFase.get(fase) ?? [];
    list.push(ev);
    evidenciasPorFase.set(fase, list);
  }

  return (
    <div style={cadernoStyle}>
      {/* ═══ CABEÇALHO ═══ */}
      <div style={headerSection}>
        <div style={headerTop}>
          <div style={{ flex: 1 }}>
            <span style={anoLabel}>{ano}</span>
            <h1 style={titleStyle}>{projeto.titulo}</h1>
          </div>
          <div style={{ ...statusBadge, ...STATUS_STYLE[projeto.status] }}>
            {projeto.status === 'ativo' ? 'Em andamento' : projeto.status === 'atrasado' ? 'Atrasado' : 'Concluído'}
          </div>
        </div>
        <div style={teamGrid}>
          <div style={teamItem}><span style={teamLabel}>Líder</span><span style={teamName}>{lider?.nome ?? '—'}</span></div>
          <div style={teamItem}><span style={teamLabel}>Facilitador</span><span style={teamName}>{facilitador?.nome ?? '—'}</span></div>
          <div style={teamItem}><span style={teamLabel}>Equipe</span><span style={teamName}>{membros.length > 0 ? membros.map((m) => m.nome).join(', ') : '—'}</span></div>
          <div style={teamItem}>
            <span style={teamLabel}>Apresentação</span>
            <span style={teamName}>
              {new Date(projeto.dataApresentacao).toLocaleDateString('pt-BR')}
              {diasRestantes >= 0 ? ` (${diasRestantes}d)` : ` (${Math.abs(diasRestantes)}d atrasado)`}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ PARA AVANÇAR DE FASE ═══ */}
      {bloqueio.pendentes.length > 0 ? (
        <div style={avancoBlockStyle}>
          <h2 style={avancoTitleStyle}>
            Para avançar da Fase {projeto.faseAtual} — {faseLabel}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {bloqueio.pendentes.map((pend) => (
              <AvancoItem key={pend.requisito.id} pend={pend} projectId={projeto.id} />
            ))}
          </div>
          <div style={avancoFooter}>
            {bloqueio.pendentes.length} pendência{bloqueio.pendentes.length > 1 ? 's' : ''} para fase {projeto.faseAtual + 1}
          </div>
        </div>
      ) : (
        <div style={avancoReadyStyle}>
          <span style={{ fontSize: '1.25rem' }}>✓</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Fase pronta para avançar</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
              Todos os requisitos da Fase {projeto.faseAtual} cumpridos.
            </div>
          </div>
          <button
            onClick={() => { if (confirm(`Avançar para Fase ${projeto.faseAtual + 1}?`)) avancarFase.mutate(); }}
            disabled={avancarFase.isPending}
            style={advanceBtn}
          >
            {avancarFase.isPending ? '...' : `Avançar → Fase ${projeto.faseAtual + 1}`}
          </button>
        </div>
      )}

      {/* ═══ PROGRESSO GERAL ═══ */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={sectionTitleStyle}>Progresso geral</h2>
          <span style={progressNum}>{progressoGeral}%</span>
        </div>
        <div style={progressTrack}>
          <div style={{ ...progressFill, width: `${progressoGeral}%`,
            background: progressoGeral === 100 ? 'var(--vale-green)' : progressoGeral > 50 ? 'var(--vale-teal)' : 'var(--vale-gold)',
          }} />
        </div>
        <div style={progressMeta}>
          Fase {projeto.faseAtual}/{TOTAL_FASES} · {faseLabel} · {bloqueio.cumpridos}/{bloqueio.totalRequisitos} na fase atual
        </div>
      </div>

      {/* ═══ FASES — clique para expandir e gerenciar ═══ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Fases MASP <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— clique para gerenciar</span></h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {Array.from({ length: TOTAL_FASES }, (_, i) => i + 1).map((fase) => {
            const isConcluida = fase < projeto.faseAtual;
            const isAtual = fase === projeto.faseAtual;
            const isFutura = fase > projeto.faseAtual;
            const label = FASE_LABELS[fase] ?? `Fase ${fase}`;
            const evCount = evidenciasPorFase.get(fase)?.length ?? 0;
            const reqs = requisitosDaFase(fase);
            const isExpanded = expandedPhase === fase;
            const canExpand = !isFutura;

            return (
              <div key={fase}>
                <div
                  style={{
                    ...faseRowStyle,
                    borderLeftColor: isConcluida ? 'var(--vale-green)' : isAtual ? 'var(--vale-gold)' : 'var(--border-default)',
                    background: isExpanded ? 'var(--bg-elevated)' : isAtual ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    opacity: isFutura ? 0.5 : 1,
                    cursor: canExpand ? 'pointer' : 'default',
                  }}
                  onClick={() => canExpand && setExpandedPhase(isExpanded ? null : fase)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1 }}>
                    <div style={{
                      ...faseNumCircle,
                      background: isConcluida ? 'var(--glow-green)' : isAtual ? 'var(--glow-gold)' : 'var(--bg-input)',
                      color: isConcluida ? 'var(--vale-green)' : isAtual ? 'var(--vale-gold)' : 'var(--text-muted)',
                      borderColor: isConcluida ? 'rgba(105,190,40,0.3)' : isAtual ? 'rgba(237,177,17,0.3)' : 'var(--border-default)',
                    }}>
                      {isConcluida ? '✓' : fase}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: isAtual ? 700 : 500, color: isFutura ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {reqs.length} requisitos · {evCount} evidências
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: isConcluida ? 'var(--vale-green)' : isAtual ? 'var(--vale-gold)' : 'var(--text-muted)' }}>
                      {isConcluida ? 'Concluído' : isAtual ? 'Atual' : '—'}
                    </span>
                    {canExpand && (
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>
                    )}
                  </div>
                </div>

                {/* Expanded: all requisitos with check/uncheck */}
                {isExpanded && (
                  <PhaseRequisitos projetoId={projeto.id} fase={fase} evidencias={projeto.evidencias} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ AÇÕES DO PROJETO ═══ */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={sectionTitleStyle}>Plano de Ação</h2>
          <button onClick={() => setShowAddAcao(!showAddAcao)} style={addBtnSmall}>
            {showAddAcao ? '✕ Cancelar' : '+ Nova ação'}
          </button>
        </div>

        {showAddAcao && (
          <AddAcaoForm projetoId={projeto.id} membros={projeto.membros} onDone={() => setShowAddAcao(false)} />
        )}

        {projeto.acoes.length === 0 && !showAddAcao ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
            Nenhuma ação registrada. Clique em "+ Nova ação" para criar.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {projeto.acoes.map((acao) => (
              <AcaoRow key={acao.id} acao={acao} projetoId={projeto.id} membros={projeto.membros} />
            ))}
          </div>
        )}
      </div>

      {/* ═══ OBSERVAÇÕES ═══ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Observações da IA</h2>
        <div style={notesBox}>
          {status.mensagensIA.filter((m) => m.destinatario === 'lider').slice(0, 3).map((msg, i) => (
            <p key={i} style={noteItem}>{msg.mensagem}</p>
          ))}
          {status.mensagensIA.length === 0 && (
            <p style={{ ...noteItem, fontStyle: 'italic', color: 'var(--text-muted)' }}>Nenhuma observação.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// PHASE REQUISITOS — inline CRUD
// ════════════════════════════════════

function PhaseRequisitos({ projetoId, fase, evidencias }: {
  projetoId: string; fase: number; evidencias: EvidenciaCumprida[];
}) {
  const cumprirReq = useCumprirRequisito(projetoId);
  const removerEv = useRemoverEvidencia(projetoId);
  const reqs = requisitosDaFase(fase);
  const evidenciaIds = new Set(evidencias.map((e) => e.requisitoId));

  if (reqs.length === 0) return <div style={phaseDetailEmpty}>Nenhum requisito nesta fase.</div>;

  return (
    <div style={phaseDetailBox}>
      {reqs.map((req) => {
        const done = evidenciaIds.has(req.id);
        const ev = evidencias.find((e) => e.requisitoId === req.id);
        return (
          <div key={req.id} style={phaseDetailRow}>
            <button
              onClick={() => {
                if (done) {
                  if (confirm(`Remover evidência: "${req.descricao}"?`)) removerEv.mutate(req.id);
                } else {
                  cumprirReq.mutate({ requisitoId: req.id, userId: 'demo-user-001' });
                }
              }}
              style={{
                ...checkBox,
                background: done ? 'var(--glow-green)' : 'var(--bg-input)',
                color: done ? 'var(--vale-green)' : 'var(--text-muted)',
                borderColor: done ? 'rgba(105,190,40,0.4)' : 'var(--border-default)',
              }}
              title={done ? 'Clique para remover' : 'Clique para marcar cumprido'}
            >
              {done ? '✓' : ' '}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {req.descricao}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.125rem' }}>
                <span style={metaTag}>{req.responsavelTipo}</span>
                {req.obrigatorio && <span style={{ ...metaTag, color: 'var(--sev-critica)' }}>obrigatório</span>}
                {ev && <span style={{ ...metaTag, color: 'var(--vale-green)' }}>{ev.dataRegistro}</span>}
              </div>
            </div>
            {done && (
              <button onClick={() => { if (confirm('Remover?')) removerEv.mutate(req.id); }} style={delBtnSmall} title="Remover">✕</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════
// ADD AÇÃO FORM
// ════════════════════════════════════

function AddAcaoForm({ projetoId, membros, onDone }: {
  projetoId: string; membros: { id: string; nome: string }[]; onDone: () => void;
}) {
  const addAcao = useAdicionarAcao(projetoId);
  const [desc, setDesc] = useState('');
  const [resp, setResp] = useState(membros[0]?.id ?? '');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    if (!desc.trim()) return;
    addAcao.mutate({ descricao: desc.trim(), responsavelId: resp, dataPrevista: data }, {
      onSuccess: () => { setDesc(''); onDone(); },
    });
  };

  return (
    <div style={addFormBox}>
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição da ação..." style={formInput}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} autoFocus />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <select value={resp} onChange={(e) => setResp(e.target.value)} style={formSelect}>
          {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={formInput} />
        <button onClick={handleSubmit} disabled={!desc.trim() || addAcao.isPending} style={formSubmitBtn}>
          {addAcao.isPending ? '...' : 'Adicionar'}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// AÇÃO ROW — with delete
// ════════════════════════════════════

function AcaoRow({ acao, projetoId, membros }: {
  acao: AcaoProjeto; projetoId: string; membros: { id: string; nome: string }[];
}) {
  const removerAcao = useRemoverAcao(projetoId);
  const responsavel = membros.find((m) => m.id === acao.responsavelId);
  const statusColors: Record<string, string> = {
    pendente: 'var(--vale-gold)', executando: 'var(--vale-teal-light)',
    concluido: 'var(--vale-green)', atrasado: 'var(--sev-critica)',
  };

  return (
    <div style={acaoRowStyle}>
      <div style={{ ...acaoStatusDot, background: statusColors[acao.status] ?? 'var(--text-muted)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{acao.descricao}</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.125rem' }}>
          <span style={metaTag}>{responsavel?.nome ?? acao.responsavelId}</span>
          <span style={metaTag}>{acao.dataPrevista}</span>
          <span style={{ ...metaTag, color: statusColors[acao.status] }}>{acao.status}</span>
        </div>
      </div>
      <button
        onClick={() => { if (confirm(`Remover ação "${acao.descricao}"?`)) removerAcao.mutate(acao.id); }}
        style={delBtnSmall} title="Remover ação"
      >✕</button>
    </div>
  );
}

// ════════════════════════════════════
// AVANÇO ITEM — nudge button
// ════════════════════════════════════

function AvancoItem({ pend, projectId }: { pend: RequisitoPendente; projectId: string }) {
  const [sent, setSent] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const cumprirReq = useCumprirRequisito(projectId);

  const handleNudge = useCallback(() => {
    const firstName = pend.responsavelNome.split(' ')[0];
    dispatchNudge({ projectId, text: `${firstName}, o líder está aguardando: ${pend.requisito.descricaoCurta}` });
    setSent(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSent(false), 2000);
  }, [pend, projectId]);

  const handleMark = useCallback(() => {
    cumprirReq.mutate({ requisitoId: pend.requisito.id, userId: 'demo-user-001' });
  }, [pend, cumprirReq]);

  return (
    <div style={avancoRow}>
      <button onClick={handleMark} style={avancoCheckBtn} title="Marcar como cumprido">☐</button>
      <span style={avancoDesc}>{pend.requisito.descricaoCurta}</span>
      <span style={avancoResp}>{pend.responsavelNome}</span>
      {sent ? (
        <span style={avancoSent}>Enviado</span>
      ) : (
        <button onClick={handleNudge} style={avancoNudgeBtn} title={`Cobrar ${pend.responsavelNome}`}>🔔</button>
      )}
    </div>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  ativo:     { color: 'var(--vale-teal-light)', background: 'var(--glow-teal)', borderColor: 'rgba(0,126,122,0.3)' },
  atrasado:  { color: 'var(--sev-critica)', background: 'var(--glow-red)', borderColor: 'var(--sev-critica)' },
  concluido: { color: 'var(--vale-green)', background: 'var(--glow-green)', borderColor: 'rgba(105,190,40,0.3)' },
};

const cadernoStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.25rem' };
const headerSection: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem' };
const headerTop: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' };
const anoLabel: React.CSSProperties = { fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--vale-teal-light)', background: 'var(--glow-teal)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(0,126,122,0.2)' };
const titleStyle: React.CSSProperties = { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, margin: '0.375rem 0 0' };
const statusBadge: React.CSSProperties = { padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid', flexShrink: 0, whiteSpace: 'nowrap' };
const teamGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' };
const teamItem: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.125rem' };
const teamLabel: React.CSSProperties = { fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' };
const teamName: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 500 };
const sectionStyle: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' };
const sectionTitleStyle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 };
const progressNum: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--vale-teal-light)' };
const progressTrack: React.CSSProperties = { height: 8, background: 'var(--border-subtle)', borderRadius: 4, overflow: 'hidden' };
const progressFill: React.CSSProperties = { height: '100%', borderRadius: 4, transition: 'width 0.5s ease' };
const progressMeta: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' };
const faseRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border-subtle)', borderLeft: '3px solid', borderRadius: 'var(--radius-sm)', transition: 'all 0.15s' };
const faseNumCircle: React.CSSProperties = { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', border: '1px solid', flexShrink: 0 };
const notesBox: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' };
const noteItem: React.CSSProperties = { fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0, paddingLeft: '0.75rem', borderLeft: '2px solid var(--border-default)' };

// Phase detail
const phaseDetailBox: React.CSSProperties = { padding: '0.5rem 0.5rem 0.5rem 2.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem', background: 'var(--bg-elevated)', borderLeft: '3px solid var(--border-default)', marginLeft: '0.5rem', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)' };
const phaseDetailEmpty: React.CSSProperties = { padding: '0.75rem 0.5rem 0.75rem 2.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' };
const phaseDetailRow: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.25rem', borderBottom: '1px solid var(--border-subtle)' };
const checkBox: React.CSSProperties = { width: 24, height: 24, borderRadius: 6, border: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0, transition: 'all 0.15s', fontFamily: 'var(--font-body)' };
const delBtnSmall: React.CSSProperties = { width: 24, height: 24, borderRadius: 6, border: '1px solid var(--sev-critica)', background: 'rgba(239,68,68,0.08)', color: 'var(--sev-critica)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 };
const metaTag: React.CSSProperties = { fontSize: '0.5625rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' };

// Advance
const advanceBtn: React.CSSProperties = { padding: '0.5rem 1rem', background: 'var(--vale-green)', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0 };
const avancoBlockStyle: React.CSSProperties = { background: 'var(--bg-elevated)', border: '2px solid var(--vale-gold)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem' };
const avancoTitleStyle: React.CSSProperties = { fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--vale-gold)' };
const avancoRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.625rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' };
const avancoCheckBtn: React.CSSProperties = { fontSize: '0.875rem', color: 'var(--vale-teal-light)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.125rem', fontFamily: 'var(--font-mono)' };
const avancoDesc: React.CSSProperties = { fontSize: '0.875rem', fontWeight: 500, flex: 1 };
const avancoResp: React.CSSProperties = { fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' };
const avancoNudgeBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', flexShrink: 0 };
const avancoSent: React.CSSProperties = { fontSize: '0.625rem', fontWeight: 600, color: 'var(--vale-green)', whiteSpace: 'nowrap', flexShrink: 0 };
const avancoFooter: React.CSSProperties = { fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.625rem', textAlign: 'center', fontStyle: 'italic' };
const avancoReadyStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'var(--glow-green)', border: '2px solid var(--vale-green)', borderRadius: 'var(--radius-md)', color: 'var(--vale-green)' };

// Ações
const addBtnSmall: React.CSSProperties = { padding: '0.3rem 0.75rem', fontSize: '0.6875rem', fontWeight: 700, border: '1px solid var(--vale-teal)', color: 'var(--vale-teal-light)', background: 'var(--glow-teal)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)' };
const addFormBox: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' };
const formInput: React.CSSProperties = { flex: 1, padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)', outline: 'none' };
const formSelect: React.CSSProperties = { padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.8125rem', fontFamily: 'var(--font-body)' };
const formSubmitBtn: React.CSSProperties = { padding: '0.5rem 1rem', background: 'var(--vale-teal)', color: 'white', border: 'none', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' };
const acaoRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.625rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' };
const acaoStatusDot: React.CSSProperties = { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: '0.375rem' };
