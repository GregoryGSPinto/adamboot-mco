/**
 * AUDITORIA PAGE — Visualizacao do log de auditoria.
 *
 * Checklist:
 *   [x] Historico de auditoria (1)
 *   [x] Modo somente leitura auditoria (24)
 *   [x] Ver todas acoes com data/hora/autor
 */

import { useState, useEffect } from 'react';
import { queryAuditLog, auditCount, type AuditEntry, type AuditFilter } from '@modules/audit';

const pageStyle: React.CSSProperties = {
  padding: '24px 0',
  maxWidth: 800,
  margin: '0 auto',
};

const headerStyle: React.CSSProperties = {
  fontSize: 24,
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
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: 14,
  fontFamily: 'inherit',
  minHeight: 36,
};

const entryRow: React.CSSProperties = {
  padding: '12px 0',
  borderBottom: '1px solid var(--border)',
};

const entryAction: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
  color: 'var(--text-primary)',
};

const entryMeta: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-muted)',
  marginTop: 2,
};

const entryDesc: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  marginTop: 4,
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: 40,
  color: 'var(--text-muted)',
};

const badge: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  marginRight: 8,
  textTransform: 'uppercase',
};

function actionColor(action: string): { bg: string; fg: string } {
  if (action.includes('avanc') || action.includes('cumpri') || action.includes('conclu'))
    return { bg: 'var(--bg-secondary)', fg: 'var(--accent-green)' };
  if (action.includes('escal') || action.includes('cobranc'))
    return { bg: 'var(--bg-secondary)', fg: 'var(--accent-red)' };
  if (action.includes('reuniao')) return { bg: 'var(--bg-secondary)', fg: 'var(--accent-blue)' };
  if (action.includes('lgpd') || action.includes('export'))
    return { bg: 'var(--bg-secondary)', fg: 'var(--accent-blue)' };
  return { bg: 'var(--bg-secondary)', fg: 'var(--text-muted)' };
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
      <h1 style={headerStyle}>Auditoria</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
        {total} registro{total !== 1 ? 's' : ''} -- Somente leitura
      </p>

      <div style={filterRow}>
        <input
          type="text"
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Filtrar por projeto..."
          onChange={e => setFilter({ ...filter, projectId: e.target.value || undefined })}
        />
        <input
          type="text"
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Filtrar por usuario..."
          onChange={e => setFilter({ ...filter, userId: e.target.value || undefined })}
        />
      </div>

      {entries.length === 0 && (
        <div style={emptyStyle}>
          <p style={{ fontSize: 14 }}>Nenhum registro de auditoria ainda.</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Acoes do sistema aparecerao aqui automaticamente.
          </p>
        </div>
      )}

      <div
        style={{
          border: entries.length > 0 ? '1px solid var(--border)' : 'none',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {entries.map(entry => {
          const colors = actionColor(entry.action);
          return (
            <div key={entry.id} style={entryRow}>
              <div style={{ padding: '0 16px' }}>
                <span
                  style={{
                    ...badge,
                    background: colors.bg,
                    color: colors.fg,
                    border: '1px solid var(--border)',
                  }}
                >
                  {entry.action.replace(/_/g, ' ')}
                </span>
                <span style={entryAction}>{entry.userName}</span>
              </div>
              <div style={{ ...entryMeta, padding: '0 16px' }}>
                {new Date(entry.timestamp).toLocaleString('pt-BR')}
                {entry.projectName && ` -- ${entry.projectName}`}
              </div>
              <div style={{ ...entryDesc, padding: '0 16px' }}>{entry.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
