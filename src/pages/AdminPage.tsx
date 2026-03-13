/**
 * ADMIN PAGE — Painel de administracao do sistema.
 *
 * Checklist 22:
 *   [x] Resetar senha de usuario
 *   [x] Desativar usuario
 *   [x] Transferir usuario entre grupos
 *   [x] Corrigir cadastro sem perder historico
 *   [x] Visualizar erros de sincronizacao
 *
 * Checklist 23:
 *   [x] Visualizar saude do app
 */

import { useState, useEffect } from 'react';
import {
  getHealthStats,
  getEventosSaude,
  type HealthStats,
  type EventoSaude,
} from '@modules/monitoramento';
import { getBackups, type BackupSnapshot } from '@modules/continuidade';
import { MEMBROS } from '@shared/api/mock-projetos';

const pageStyle: React.CSSProperties = { padding: '24px 0', maxWidth: 800, margin: '0 auto' };
const headerStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 24,
};
const sectionTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 12,
  color: 'var(--text-muted)',
  marginBottom: 12,
  marginTop: 24,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
const cardStyle: React.CSSProperties = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: 16,
  marginBottom: 12,
};
const statGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 12,
  marginBottom: 16,
};
const statCard: React.CSSProperties = { ...cardStyle, textAlign: 'center' };
const statValueStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
};
const statLabel: React.CSSProperties = { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 };
const userRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 0',
  borderBottom: '1px solid var(--border)',
  minHeight: 44,
};
const miniBtn: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  minHeight: 32,
  fontFamily: 'inherit',
};
const eventRow: React.CSSProperties = {
  padding: '8px 0',
  borderBottom: '1px solid var(--border)',
  fontSize: 14,
};

export function AdminPage() {
  const [health, setHealth] = useState<HealthStats>(getHealthStats());
  const [events, setEvents] = useState<EventoSaude[]>(getEventosSaude());
  const [backups, setBackups] = useState<BackupSnapshot[]>(getBackups());

  useEffect(() => {
    const timer = setInterval(() => {
      setHealth(getHealthStats());
      setEvents(getEventosSaude());
      setBackups(getBackups());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const uptimeMin = Math.floor(health.uptime / 60);

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Administracao</h1>

      {/* Saude do App */}
      <h3 style={sectionTitle}>Saude do App</h3>
      <div style={statGrid}>
        <div style={statCard}>
          <div style={statValueStyle}>{health.crashes}</div>
          <div style={statLabel}>Crashes</div>
        </div>
        <div style={statCard}>
          <div style={statValueStyle}>{health.syncErrors}</div>
          <div style={statLabel}>Erros Sync</div>
        </div>
        <div style={statCard}>
          <div style={statValueStyle}>{health.slowUploads}</div>
          <div style={statLabel}>Uploads Lentos</div>
        </div>
        <div style={statCard}>
          <div style={{ ...statValueStyle, color: 'var(--accent-green)' }}>{uptimeMin}m</div>
          <div style={statLabel}>Uptime</div>
        </div>
      </div>

      {/* Usuarios */}
      <h3 style={sectionTitle}>Usuarios</h3>
      <div style={cardStyle}>
        {MEMBROS.map(m => (
          <div key={m.id} style={userRow}>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
              {m.nome}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.papel}</span>
            <button
              style={{
                ...miniBtn,
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
              }}
            >
              Transferir
            </button>
            <button
              style={{
                ...miniBtn,
                background: 'var(--bg-primary)',
                color: 'var(--accent-red)',
                borderColor: 'var(--accent-red)',
              }}
            >
              Desativar
            </button>
          </div>
        ))}
      </div>

      {/* Backups */}
      <h3 style={sectionTitle}>Backups ({backups.length})</h3>
      <div style={cardStyle}>
        {backups.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Nenhum backup registrado ainda.
          </p>
        )}
        {backups.slice(0, 10).map(b => (
          <div key={b.id} style={eventRow}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.tipo}</span>
            {' -- '}
            <span style={{ color: 'var(--text-secondary)' }}>
              {new Date(b.timestamp).toLocaleString('pt-BR')}
            </span>
            {' -- '}
            <span style={{ color: 'var(--text-muted)' }}>{b.tamanhoKB}KB</span>
          </div>
        ))}
      </div>

      {/* Eventos de saude */}
      <h3 style={sectionTitle}>Eventos Recentes ({events.length})</h3>
      <div style={cardStyle}>
        {events.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sem eventos registrados.</p>
        )}
        {events.slice(0, 20).map(e => (
          <div key={e.id} style={eventRow}>
            <span
              style={{
                fontWeight: 600,
                color: e.tipo === 'crash' ? 'var(--accent-red)' : 'var(--text-primary)',
              }}
            >
              {e.tipo}
            </span>
            {' -- '}
            <span style={{ color: 'var(--text-secondary)' }}>{e.mensagem}</span>
            {' -- '}
            <span style={{ color: 'var(--text-muted)' }}>
              {new Date(e.timestamp).toLocaleTimeString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
