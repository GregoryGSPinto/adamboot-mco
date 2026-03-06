/**
 * MINHAS MISSÕES — Visão do MEMBRO.
 *
 * Checklist 6:
 *   [x] Listar tarefas
 *   [x] Mostrar prazo
 *   [x] Mostrar atraso
 *   [x] Atualizar status
 *   [x] Registrar impedimento
 *
 * O membro vê APENAS o que ELE precisa entregar.
 * Nada de projeto inteiro, nada de contexto que não é dele.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@app/auth';
import { useMission } from '@modules/mission';
import type { MissionItem } from '@modules/mission';
import {
  registrarImpedimento,
  IMPEDIMENTO_LABELS,
  type ImpedimentoTipo,
} from '@modules/impedimento';
import { dispatchDomainEvent } from '@modules/core/domainEvents';

// ═══════════════════════════════════
// STYLES
// ═══════════════════════════════════

const pageStyle: React.CSSProperties = {
  padding: '16px',
  maxWidth: 600,
  margin: '0 auto',
};

const headerStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 4,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginBottom: 20,
};

const cardStyle: React.CSSProperties = {
  background: 'var(--surface-primary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
};

const taskTitleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '0.95rem',
  color: 'var(--text-primary)',
  marginBottom: 4,
};

const projectLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-tertiary)',
  marginBottom: 8,
};

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  marginBottom: 12,
};

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 8,
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#fff',
  background: color,
});

const btnRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
};

const btnPrimary: React.CSSProperties = {
  flex: 1,
  padding: '10px 0',
  borderRadius: 8,
  border: 'none',
  background: 'var(--vale-green)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  minHeight: 48,
};

const btnSecondary: React.CSSProperties = {
  flex: 1,
  padding: '10px 0',
  borderRadius: 8,
  border: '1px solid var(--border-default)',
  background: 'var(--surface-secondary)',
  color: 'var(--text-primary)',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  minHeight: 48,
};

const btnDanger: React.CSSProperties = {
  ...btnSecondary,
  border: '1px solid var(--priority-critical-bg, #fee)',
  color: 'var(--priority-critical, #dc2626)',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: 40,
  color: 'var(--text-tertiary)',
};

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
};

const modalBox: React.CSSProperties = {
  background: 'var(--surface-primary)',
  borderRadius: 16,
  padding: 24,
  width: '100%',
  maxWidth: 400,
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  borderRadius: 8,
  border: '1px solid var(--border-default)',
  background: 'var(--surface-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  marginBottom: 12,
  minHeight: 48,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  borderRadius: 8,
  border: '1px solid var(--border-default)',
  background: 'var(--surface-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  minHeight: 80,
  resize: 'vertical',
  marginBottom: 12,
};

// ═══════════════════════════════════
// HELPERS
// ═══════════════════════════════════

function priorityColor(priority: string): string {
  switch (priority) {
    case 'CRITICAL': return '#dc2626';
    case 'HIGH': return '#ea580c';
    case 'MEDIUM': return '#ca8a04';
    default: return '#6b7280';
  }
}

function priorityLabel(priority: string): string {
  switch (priority) {
    case 'CRITICAL': return 'URGENTE';
    case 'HIGH': return 'ALTO';
    case 'MEDIUM': return 'MÉDIO';
    default: return 'NORMAL';
  }
}

// ═══════════════════════════════════
// COMPONENT
// ═══════════════════════════════════

export function MinhasMissoesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { groups, isLoading } = useMission();

  const [impedimentoModal, setImpedimentoModal] = useState<MissionItem | null>(null);
  const [impTipo, setImpTipo] = useState<ImpedimentoTipo>('outro');
  const [impDesc, setImpDesc] = useState('');

  // Filtrar apenas tarefas MINHAS
  const minhasTarefas: (MissionItem & { projectName: string; projectId: string })[] = [];
  groups.forEach((g) => {
    g.items
      .filter((item) => item.responsibleId === user?.id)
      .forEach((item) => {
        minhasTarefas.push({
          ...item,
          projectName: g.projectName,
          projectId: g.projectId,
        });
      });
  });

  // Ordenar: mais urgente primeiro
  minhasTarefas.sort((a, b) => {
    const w = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return (w[b.priority] || 0) - (w[a.priority] || 0);
  });

  function handleConcluir(item: typeof minhasTarefas[0]) {
    dispatchDomainEvent({
      type: 'requirement_completed',
      projectId: item.projectId,
      actorId: user?.id,
      payload: { requisitoId: item.id },
    });
  }

  function handleRegistrarImpedimento() {
    if (!impedimentoModal || !impDesc.trim() || !user) return;

    registrarImpedimento({
      projectId: impedimentoModal.projectId,
      requisitoId: impedimentoModal.id,
      tipo: impTipo,
      descricao: impDesc.trim(),
      userId: user.id,
      userName: user.name,
    });

    setImpedimentoModal(null);
    setImpDesc('');
    setImpTipo('outro');
  }

  if (isLoading) {
    return <div style={pageStyle}><p style={emptyStyle}>Carregando...</p></div>;
  }

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Minhas Missões</h1>
      <p style={subtitleStyle}>
        {minhasTarefas.length === 0
          ? 'Nenhuma pendência. Bom trabalho! 🎉'
          : `${minhasTarefas.length} tarefa${minhasTarefas.length > 1 ? 's' : ''} pendente${minhasTarefas.length > 1 ? 's' : ''}`}
      </p>

      {minhasTarefas.length === 0 && (
        <div style={emptyStyle}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✅</div>
          <p>Todas as tarefas concluídas.</p>
        </div>
      )}

      {minhasTarefas.map((item) => (
        <div key={item.id} style={{
          ...cardStyle,
          borderLeft: `4px solid ${priorityColor(item.priority)}`,
        }}>
          <p style={projectLabelStyle}>📁 {item.projectName}</p>
          <p style={taskTitleStyle}>{item.message}</p>

          <div style={metaRowStyle}>
            <span style={badgeStyle(priorityColor(item.priority))}>
              {priorityLabel(item.priority)}
            </span>
            {(item.daysLate ?? 0) > 0 && (
              <span style={{ color: '#dc2626', fontWeight: 600 }}>
                {item.daysLate}d atrasado
              </span>
            )}
          </div>

          <div style={btnRow}>
            <button
              style={btnPrimary}
              onClick={() => handleConcluir(item)}
            >
              ✅ Concluir
            </button>
            <button
              style={btnSecondary}
              onClick={() => navigate(`/projeto/${item.projectId}`)}
            >
              📂 Abrir
            </button>
            <button
              style={btnDanger}
              onClick={() => setImpedimentoModal(item)}
            >
              🚧 Impedido
            </button>
          </div>
        </div>
      ))}

      {/* Modal de impedimento */}
      {impedimentoModal && (
        <div style={modalOverlay} onClick={() => setImpedimentoModal(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🚧 Registrar Impedimento</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              {impedimentoModal.message}
            </p>

            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Tipo do impedimento
            </label>
            <select
              style={selectStyle}
              value={impTipo}
              onChange={(e) => setImpTipo(e.target.value as ImpedimentoTipo)}
            >
              {Object.entries(IMPEDIMENTO_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Descreva o problema
            </label>
            <textarea
              style={textareaStyle}
              value={impDesc}
              onChange={(e) => setImpDesc(e.target.value)}
              placeholder="Ex: Sem acesso à via 3 por interdição"
            />

            <div style={btnRow}>
              <button style={btnSecondary} onClick={() => setImpedimentoModal(null)}>
                Cancelar
              </button>
              <button
                style={{ ...btnPrimary, background: '#dc2626' }}
                onClick={handleRegistrarImpedimento}
                disabled={!impDesc.trim()}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
