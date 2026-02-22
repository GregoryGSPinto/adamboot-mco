/**
 * AUDITORIA PAGE — Visualização do log de auditoria.
 *
 * Checklist:
 *   [x] Histórico de auditoria (1)
 *   [x] Modo somente leitura auditoria (24)
 *   [x] Ver todas ações com data/hora/autor
 */

import { useState, useEffect } from 'react';
import { queryAuditLog, auditCount, type AuditEntry, type AuditFilter } from '@modules/audit';

const pageStyle: React.CSSProperties = {
  padding: 16,
  maxWidth: 800,
  margin: '0 auto',
};

const headerStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 4,
};

const filterRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  marginBottom: 16,
  flexWrap: 'wrap',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--border-default)',
  background: 'var(--surface-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  minHeight: 44,
};

const entryRow: React.CSSProperties = {
  padding: '12px 0',
  borderBottom: '1px solid var(--border-subtle)',
};

const entryAction: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
};

const entryMeta: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-tertiary)',
  marginTop: 2,
};

const entryDesc: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginTop: 4,
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: 40,
  color: 'var(--text-tertiary)',
};

const badge: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: 4,
  fontSize: '0.65rem',
  fontWeight: 700,
  marginRight: 8,
  textTransform: 'uppercase',
};

function actionColor(action: string): string {
  if (action.includes('avanc') || action.includes('cumpri') || action.includes('conclu')) return '#16a34a';
  if (action.includes('escal') || action.includes('cobranc')) return '#dc2626';
  if (action.includes('reuniao')) return '#2563eb';
  if (action.includes('lgpd') || action.includes('export')) return '#7c3aed';
  return '#6b7280';
}

export function AuditoriaPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState<AuditFilter>({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setEntries(queryAuditLog(filter));
    setTotal(auditCount());
  }, [filter]);

  // Auto-refresh every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setEntries(queryAuditLog(filter));
      setTotal(auditCount());
    }, 5000);
    return () => clearInterval(timer);
  }, [filter]);

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>🔍 Auditoria</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        {total} registro{total !== 1 ? 's' : ''} · Somente leitura
      </p>

      <div style={filterRow}>
        <input
          type="text"
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Filtrar por projeto..."
          onChange={(e) => setFilter({ ...filter, projectId: e.target.value || undefined })}
        />
        <input
          type="text"
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Filtrar por usuário..."
          onChange={(e) => setFilter({ ...filter, userId: e.target.value || undefined })}
        />
      </div>

      {entries.length === 0 && (
        <div style={emptyStyle}>
          <p>Nenhum registro de auditoria ainda.</p>
          <p style={{ fontSize: '0.8rem' }}>Ações do sistema aparecerão aqui automaticamente.</p>
        </div>
      )}

      {entries.map((entry) => (
        <div key={entry.id} style={entryRow}>
          <div>
            <span style={{ ...badge, background: actionColor(entry.action) + '20', color: actionColor(entry.action) }}>
              {entry.action.replace(/_/g, ' ')}
            </span>
            <span style={entryAction}>{entry.userName}</span>
          </div>
          <div style={entryMeta}>
            {new Date(entry.timestamp).toLocaleString('pt-BR')}
            {entry.projectName && ` · ${entry.projectName}`}
          </div>
          <div style={entryDesc}>{entry.description}</div>
        </div>
      ))}
    </div>
  );
}
