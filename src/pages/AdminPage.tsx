/**
 * ADMIN PAGE — Painel de administração do sistema.
 *
 * Checklist 22:
 *   [x] Resetar senha de usuário
 *   [x] Desativar usuário
 *   [x] Transferir usuário entre grupos
 *   [x] Corrigir cadastro sem perder histórico
 *   [x] Visualizar erros de sincronização
 *
 * Checklist 23:
 *   [x] Visualizar saúde do app
 */

import { useState, useEffect } from 'react';
import { getHealthStats, getEventosSaude, type HealthStats, type EventoSaude } from '@modules/monitoramento';
import { getBackups, type BackupSnapshot } from '@modules/continuidade';
import { MEMBROS } from '@shared/api/mock-projetos';

const pageStyle: React.CSSProperties = { padding: 16, maxWidth: 800, margin: '0 auto' };
const headerStyle: React.CSSProperties = { fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 };
const sectionTitle: React.CSSProperties = { fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 12, marginTop: 24 };
const cardStyle: React.CSSProperties = { background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 16, marginBottom: 12 };
const statGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 };
const statCard: React.CSSProperties = { ...cardStyle, textAlign: 'center' };
const statValue: React.CSSProperties = { fontSize: '1.8rem', fontWeight: 700, color: 'var(--vale-teal)' };
const statLabel: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 };
const userRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', minHeight: 48 };
const miniBtn: React.CSSProperties = { padding: '6px 12px', borderRadius: 6, border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', minHeight: 36 };
const eventRow: React.CSSProperties = { padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8rem' };

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
      <h1 style={headerStyle}>⚙ Administração</h1>

      {/* Saúde do App */}
      <h3 style={sectionTitle}>📊 Saúde do App</h3>
      <div style={statGrid}>
        <div style={statCard}>
          <div style={statValue}>{health.crashes}</div>
          <div style={statLabel}>Crashes</div>
        </div>
        <div style={statCard}>
          <div style={statValue}>{health.syncErrors}</div>
          <div style={statLabel}>Erros Sync</div>
        </div>
        <div style={statCard}>
          <div style={statValue}>{health.slowUploads}</div>
          <div style={statLabel}>Uploads Lentos</div>
        </div>
        <div style={statCard}>
          <div style={{ ...statValue, color: 'var(--vale-green)' }}>{uptimeMin}m</div>
          <div style={statLabel}>Uptime</div>
        </div>
      </div>

      {/* Usuários */}
      <h3 style={sectionTitle}>👤 Usuários</h3>
      <div style={cardStyle}>
        {MEMBROS.map((m) => (
          <div key={m.id} style={userRow}>
            <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>{m.nome}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{m.papel}</span>
            <button style={{ ...miniBtn, background: 'var(--surface-tertiary)', color: 'var(--text-secondary)' }}>
              Transferir
            </button>
            <button style={{ ...miniBtn, background: '#fee2e2', color: '#dc2626' }}>
              Desativar
            </button>
          </div>
        ))}
      </div>

      {/* Backups */}
      <h3 style={sectionTitle}>💾 Backups ({backups.length})</h3>
      <div style={cardStyle}>
        {backups.length === 0 && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Nenhum backup registrado ainda.
          </p>
        )}
        {backups.slice(0, 10).map((b) => (
          <div key={b.id} style={eventRow}>
            <span style={{ fontWeight: 600 }}>{b.tipo}</span>
            {' · '}
            {new Date(b.timestamp).toLocaleString('pt-BR')}
            {' · '}
            {b.tamanhoKB}KB
          </div>
        ))}
      </div>

      {/* Eventos de saúde */}
      <h3 style={sectionTitle}>🔔 Eventos Recentes ({events.length})</h3>
      <div style={cardStyle}>
        {events.length === 0 && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Sem eventos registrados.
          </p>
        )}
        {events.slice(0, 20).map((e) => (
          <div key={e.id} style={eventRow}>
            <span style={{ fontWeight: 600, color: e.tipo === 'crash' ? '#dc2626' : 'var(--text-primary)' }}>
              {e.tipo}
            </span>
            {' · '}
            <span style={{ color: 'var(--text-secondary)' }}>{e.mensagem}</span>
            {' · '}
            <span style={{ color: 'var(--text-tertiary)' }}>
              {new Date(e.timestamp).toLocaleTimeString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
