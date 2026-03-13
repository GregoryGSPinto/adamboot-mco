import type React from 'react';
import { useState, useCallback } from 'react';
import { useProjetos, useCumprirRequisito, useRemoverEvidencia } from '@modules/projeto';
import { FASE_LABELS, requisitosDaFase } from '@shared/engine';
import type { EvidenciaCumprida, RequisitoFase, StatusProjeto } from '@shared/engine';

/**
 * /library — Biblioteca de evidências com CRUD.
 *
 * Cada fase expande para mostrar requisitos.
 * Evidências: marcar (✓) ou remover (✕).
 */
export function BibliotecaPage() {
  const { data: projetos, isLoading } = useProjetos();

  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--vale-teal)',
            animation: 'pulse-step 1s ease-in-out infinite',
          }}
        />
        Carregando...
      </div>
    );
  }

  const lista = projetos ?? [];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={titleStyle}>Biblioteca CCQ</h1>
        <p style={subtitleStyle}>
          {lista.length} projeto{lista.length !== 1 ? 's' : ''} · Clique na fase para gerenciar
          evidências
        </p>
      </div>

      {lista.length === 0 ? (
        <div style={emptyStyle}>
          <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>📚</span>
          <p style={{ color: 'var(--text-muted)' }}>Nenhuma evidência registrada.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {lista.map(status => (
            <ProjectEvidenceSection key={status.projeto.id} status={status} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectEvidenceSection({ status }: { status: StatusProjeto }) {
  const proj = status.projeto;
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  const byPhase = new Map<number, EvidenciaCumprida[]>();
  for (const ev of proj.evidencias) {
    const match = ev.requisitoId.match(/^F(\d+)/);
    const fase = match ? Number(match[1]) : proj.faseAtual;
    const list = byPhase.get(fase) ?? [];
    list.push(ev);
    byPhase.set(fase, list);
  }

  const phases = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div style={projectSection}>
      <div style={projectHeader}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{proj.titulo}</h2>
        <span style={evidenceCountBadge}>{proj.evidencias.length} evidências</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem' }}>
        {phases.map(fase => {
          const items = byPhase.get(fase) ?? [];
          const label = FASE_LABELS[fase] ?? `Fase ${fase}`;
          const isPast = fase < proj.faseAtual;
          const isCurrent = fase === proj.faseAtual;
          const isExpanded = expandedPhase === fase;

          return (
            <div key={fase}>
              <div
                style={{
                  ...phaseRow,
                  cursor: fase <= proj.faseAtual ? 'pointer' : 'default',
                  background: isExpanded ? 'var(--glow-teal)' : 'transparent',
                }}
                onClick={() => fase <= proj.faseAtual && setExpandedPhase(isExpanded ? null : fase)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <span
                    style={{
                      ...phaseBadge,
                      background: isCurrent
                        ? 'var(--glow-gold)'
                        : isPast
                          ? 'var(--glow-green)'
                          : 'var(--bg-input)',
                      color: isCurrent
                        ? 'var(--vale-gold)'
                        : isPast
                          ? 'var(--vale-green)'
                          : 'var(--text-muted)',
                      borderColor: isCurrent
                        ? 'var(--vale-gold)'
                        : isPast
                          ? 'rgba(105,190,40,0.3)'
                          : 'var(--border-default)',
                    }}
                  >
                    F{fase}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: isCurrent ? 600 : 400,
                      color: fase > proj.faseAtual ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}
                  >
                    {label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {items.length > 0 && <span style={countLabel}>{items.length}</span>}
                  {fase <= proj.faseAtual && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        color: 'var(--text-muted)',
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                      }}
                    >
                      ▶
                    </span>
                  )}
                </div>
              </div>

              {isExpanded && (
                <PhaseDetail projetoId={proj.id} fase={fase} evidencias={proj.evidencias} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseDetail({
  projetoId,
  fase,
  evidencias,
}: {
  projetoId: string;
  fase: number;
  evidencias: EvidenciaCumprida[];
}) {
  const cumprirReq = useCumprirRequisito(projetoId);
  const removerEv = useRemoverEvidencia(projetoId);
  const reqs = requisitosDaFase(fase);
  const evidenciaIds = new Set(evidencias.map(e => e.requisitoId));

  const handleToggle = useCallback(
    (req: RequisitoFase) => {
      const done = evidenciaIds.has(req.id);
      if (done) {
        if (confirm(`Remover evidência de "${req.descricao}"?`)) removerEv.mutate(req.id);
      } else {
        cumprirReq.mutate({ requisitoId: req.id, userId: 'demo-user-001' });
      }
    },
    [evidenciaIds, cumprirReq, removerEv]
  );

  if (reqs.length === 0) return <div style={detailEmpty}>Nenhum requisito nesta fase.</div>;

  return (
    <div style={detailContainer}>
      {reqs.map(req => {
        const done = evidenciaIds.has(req.id);
        const ev = evidencias.find(e => e.requisitoId === req.id);
        return (
          <div key={req.id} style={detailRow}>
            <button
              onClick={() => handleToggle(req)}
              style={{
                ...checkBtn,
                background: done ? 'var(--glow-green)' : 'var(--bg-input)',
                color: done ? 'var(--vale-green)' : 'var(--text-muted)',
                borderColor: done ? 'rgba(105,190,40,0.4)' : 'var(--border-default)',
              }}
              title={done ? 'Remover evidência' : 'Marcar como cumprido'}
            >
              {done ? '✓' : ' '}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: done ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {req.descricao}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.125rem' }}>
                <span style={reqTag}>{req.responsavelTipo}</span>
                {req.obrigatorio && (
                  <span style={{ ...reqTag, color: 'var(--sev-critica)' }}>obrigatório</span>
                )}
                {ev && (
                  <span style={{ ...reqTag, color: 'var(--vale-green)' }}>{ev.dataRegistro}</span>
                )}
              </div>
            </div>
            {done && (
              <button
                onClick={() => {
                  if (confirm(`Remover evidência?`)) removerEv.mutate(req.id);
                }}
                style={deleteBtn}
                title="Remover"
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════
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
const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '4rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
};
const projectSection: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
};
const projectHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.875rem 1rem',
  background: 'var(--bg-elevated)',
  borderBottom: '1px solid var(--border-subtle)',
};
const evidenceCountBadge: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  fontFamily: 'var(--font-mono)',
  color: 'var(--text-muted)',
  background: 'var(--bg-input)',
  padding: '0.15rem 0.5rem',
  borderRadius: 'var(--radius-full)',
};
const phaseRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 0.5rem',
  borderBottom: '1px solid var(--border-subtle)',
  transition: 'background 0.15s',
};
const phaseBadge: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontWeight: 700,
  fontFamily: 'var(--font-mono)',
  padding: '0.15rem 0.4rem',
  borderRadius: 'var(--radius-full)',
  border: '1px solid',
  flexShrink: 0,
};
const countLabel: React.CSSProperties = {
  fontSize: '0.625rem',
  fontWeight: 700,
  fontFamily: 'var(--font-mono)',
  color: 'var(--vale-teal-light)',
  background: 'var(--glow-teal)',
  padding: '0.1rem 0.375rem',
  borderRadius: 'var(--radius-full)',
};
const detailContainer: React.CSSProperties = {
  padding: '0.5rem 0.5rem 0.5rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
  background: 'var(--bg-elevated)',
  borderBottom: '1px solid var(--border-subtle)',
};
const detailEmpty: React.CSSProperties = {
  padding: '0.75rem 0.5rem 0.75rem 1.5rem',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
};
const detailRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.5rem',
  padding: '0.5rem 0.25rem',
  borderBottom: '1px solid var(--border-subtle)',
};
const checkBtn: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  border: '1px solid',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: '0.75rem',
  flexShrink: 0,
  transition: 'all 0.15s',
  fontFamily: 'var(--font-body)',
};
const deleteBtn: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  border: '1px solid var(--sev-critica)',
  background: 'rgba(239,68,68,0.08)',
  color: 'var(--sev-critica)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.6875rem',
  fontWeight: 700,
  flexShrink: 0,
  transition: 'all 0.15s',
};
const reqTag: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.02em',
};
