import type React from 'react';
import { useState, useCallback } from 'react';
import { useProjetos, useCumprirRequisito, useRemoverEvidencia } from '@modules/projeto';
import { FASE_LABELS, requisitosDaFase } from '@shared/engine';
import type { EvidenciaCumprida, RequisitoFase, StatusProjeto } from '@shared/engine';

/**
 * /library — Biblioteca de evidencias com CRUD.
 *
 * Cada fase expande para mostrar requisitos.
 * Evidencias: marcar ou remover.
 */
export function BibliotecaPage() {
  const { data: projetos, isLoading } = useProjetos();

  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
        <span>Carregando...</span>
      </div>
    );
  }

  const lista = projetos ?? [];

  return (
    <div className="fade-in" style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={titleStyle}>Biblioteca CCQ</h1>
        <p style={subtitleStyle}>
          {lista.length} projeto{lista.length !== 1 ? 's' : ''} -- Clique na fase para gerenciar
          evidencias
        </p>
      </div>

      {lista.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nenhuma evidencia registrada.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
          {proj.titulo}
        </h2>
        <span style={evidenceCountBadge}>{proj.evidencias.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                  background: isExpanded ? 'var(--hover-bg)' : 'transparent',
                }}
                onClick={() => fase <= proj.faseAtual && setExpandedPhase(isExpanded ? null : fase)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span
                    style={{
                      ...phaseBadge,
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
                      color: fase > proj.faseAtual ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}
                  >
                    {label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {items.length > 0 && <span style={countLabel}>{items.length}</span>}
                  {fase <= proj.faseAtual && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{
                        color: 'var(--text-muted)',
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                      }}
                    >
                      <path
                        d="M4 2l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
        if (confirm(`Remover evidencia de "${req.descricao}"?`)) removerEv.mutate(req.id);
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
                background: done ? 'var(--accent-green)' : 'var(--bg-secondary)',
                color: done ? '#fff' : 'var(--text-muted)',
                border: done ? '1px solid var(--accent-green)' : '1px solid var(--border)',
              }}
              title={done ? 'Remover evidencia' : 'Marcar como cumprido'}
            >
              {done ? '\u2713' : ' '}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: done ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {req.descricao}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                <span style={reqTag}>{req.responsavelTipo}</span>
                {req.obrigatorio && (
                  <span style={{ ...reqTag, color: 'var(--accent-red)' }}>obrigatorio</span>
                )}
                {ev && (
                  <span style={{ ...reqTag, color: 'var(--accent-green)' }}>{ev.dataRegistro}</span>
                )}
              </div>
            </div>
            {done && (
              <button
                onClick={() => {
                  if (confirm(`Remover evidencia?`)) removerEv.mutate(req.id);
                }}
                style={deleteBtn}
                title="Remover"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1 1l8 8M9 1l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        );
      })}
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
const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  margin: 0,
  color: 'var(--text-primary)',
};
const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  marginTop: 4,
};
const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px 16px',
};
const projectSection: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 6,
  overflow: 'hidden',
  background: 'var(--bg-primary)',
};
const projectHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border)',
};
const evidenceCountBadge: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  background: 'var(--bg-primary)',
  padding: '2px 8px',
  borderRadius: 10,
  border: '1px solid var(--border)',
};
const phaseRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 16px',
  borderBottom: '1px solid var(--border)',
  transition: 'background 0.15s',
};
const phaseBadge: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  padding: '2px 6px',
  borderRadius: 6,
  flexShrink: 0,
};
const countLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  background: 'var(--bg-secondary)',
  padding: '1px 6px',
  borderRadius: 10,
  border: '1px solid var(--border)',
};
const detailContainer: React.CSSProperties = {
  padding: '8px 16px 8px 32px',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border)',
};
const detailEmpty: React.CSSProperties = {
  padding: '12px 16px 12px 32px',
  fontSize: 12,
  color: 'var(--text-muted)',
  fontStyle: 'italic',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border)',
};
const detailRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  padding: '8px 0',
  borderBottom: '1px solid var(--border)',
};
const checkBtn: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 4,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: 12,
  flexShrink: 0,
  transition: 'all 0.15s',
  fontFamily: 'inherit',
};
const deleteBtn: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  border: '1px solid var(--accent-red)',
  background: 'var(--bg-primary)',
  color: 'var(--accent-red)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.15s',
};
const reqTag: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
};
