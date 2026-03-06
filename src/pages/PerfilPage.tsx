import type React from 'react';
import { useState, useCallback } from 'react';
import { useAuth } from '@app/auth';
import { useAppStore } from '@shared/hooks/use-app-store';

/**
 * PERFIL — configurações completas do usuário MCO.
 *
 * Seções:
 *   1. Identidade (avatar, nome, email, cargo, unidade)
 *   2. Preferências (tema, idioma, notificações)
 *   3. Notificações (push, email, cobranças IA, resumo)
 *   4. Projetos (papel, estatísticas rápidas)
 *   5. Sistema (versão, termos, feedback, sair)
 */
export function PerfilPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useAppStore();

  // ── Settings state (localStorage persisted) ──
  const [settings, setSettings] = useState(() => loadSettings());

  const update = useCallback((key: string, value: unknown) => {
    setSettings((prev: Record<string, unknown>) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('mco-user-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const userName = user?.name ?? 'Usuário';
  const userEmail = user?.email ?? '—';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* ═══ HEADER: AVATAR + IDENTITY ═══ */}
      <div style={profileHeader}>
        <div style={avatarLarge}>{initial}</div>
        <div>
          <h1 style={nameStyle}>{userName}</h1>
          <p style={emailStyle}>{userEmail}</p>
          <div style={roleBadgeRow}>
            <span style={{ ...roleBadge, background: 'var(--glow-teal)', color: 'var(--vale-teal-light)', borderColor: 'var(--vale-teal)' }}>
              Líder CCQ
            </span>
            <span style={{ ...roleBadge, background: 'var(--glow-gold)', color: 'var(--vale-gold)', borderColor: 'var(--vale-gold)' }}>
              Membro
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* ═══ INFORMAÇÕES PESSOAIS ═══ */}
        <div className="settings-section">
          <div className="settings-section-header">Informações pessoais</div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Nome completo</div>
              <div className="settings-row-desc">Exibido nos projetos e cobranças</div>
            </div>
            <div className="settings-row-value">{userName}</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">E-mail corporativo</div>
              <div className="settings-row-desc">Autenticado via Azure AD</div>
            </div>
            <div className="settings-row-value">{userEmail}</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Unidade</div>
              <div className="settings-row-desc">Planta ou área operacional</div>
            </div>
            <EditableValue
              value={settings.unit as string}
              onSave={(v) => update('unit', v)}
              placeholder="Ex: Ferrovia EFC"
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Cargo</div>
              <div className="settings-row-desc">Função na organização</div>
            </div>
            <EditableValue
              value={settings.cargo as string}
              onSave={(v) => update('cargo', v)}
              placeholder="Ex: Operador Ferroviário"
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Matrícula</div>
            </div>
            <EditableValue
              value={settings.matricula as string}
              onSave={(v) => update('matricula', v)}
              placeholder="00000"
            />
          </div>
        </div>

        {/* ═══ APARÊNCIA ═══ */}
        <div className="settings-section">
          <div className="settings-section-header">Aparência</div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Tema</div>
              <div className="settings-row-desc">Aparência da interface</div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <ThemeOption
                label="🌙 Escuro"
                active={theme === 'dark'}
                onClick={() => setTheme('dark')}
              />
              <ThemeOption
                label="☀ Claro"
                active={theme === 'light'}
                onClick={() => setTheme('light')}
              />
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Idioma</div>
              <div className="settings-row-desc">Idioma do sistema</div>
            </div>
            <div className="settings-row-value" style={{ color: 'var(--text-primary)' }}>
              Português (BR)
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Densidade da interface</div>
              <div className="settings-row-desc">Tamanho dos elementos visuais</div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['compacto', 'normal', 'confortável'] as const).map((d) => (
                <ThemeOption
                  key={d}
                  label={d === 'compacto' ? 'Compacto' : d === 'normal' ? 'Normal' : 'Confortável'}
                  active={settings.density === d}
                  onClick={() => update('density', d)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ═══ NOTIFICAÇÕES ═══ */}
        <div className="settings-section">
          <div className="settings-section-header">Notificações</div>

          <ToggleRow
            label="Notificações push"
            desc="Receber alertas no navegador"
            value={settings.pushEnabled as boolean}
            onChange={(v) => update('pushEnabled', v)}
          />

          <ToggleRow
            label="Cobranças do Coordenador IA"
            desc="Mensagens automáticas do 🤖 no chat do projeto"
            value={settings.aiCobrancas as boolean}
            onChange={(v) => update('aiCobrancas', v)}
          />

          <ToggleRow
            label="Resumo diário por e-mail"
            desc="Receber resumo das pendências todo dia às 8h"
            value={settings.dailyEmail as boolean}
            onChange={(v) => update('dailyEmail', v)}
          />

          <ToggleRow
            label="Alertas de prazo"
            desc="Avisar quando faltar menos de 7 dias para apresentação"
            value={settings.deadlineAlerts as boolean}
            onChange={(v) => update('deadlineAlerts', v)}
          />

          <ToggleRow
            label="Som de notificação"
            desc="Tocar som ao receber cobranças"
            value={settings.soundEnabled as boolean}
            onChange={(v) => update('soundEnabled', v)}
          />
        </div>

        {/* ═══ PROJETOS ═══ */}
        <div className="settings-section">
          <div className="settings-section-header">Projetos</div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Papel padrão</div>
              <div className="settings-row-desc">Como você participa dos projetos</div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['lider', 'membro', 'facilitador'] as const).map((r) => (
                <ThemeOption
                  key={r}
                  label={r === 'lider' ? 'Líder' : r === 'membro' ? 'Membro' : 'Facilitador'}
                  active={settings.defaultRole === r}
                  onClick={() => update('defaultRole', r)}
                />
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Projetos ativos</div>
            </div>
            <div className="settings-row-value" style={statValue}>2</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Requisitos cumpridos (total)</div>
            </div>
            <div className="settings-row-value" style={statValue}>14</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Fases concluídas (total)</div>
            </div>
            <div className="settings-row-value" style={statValue}>7</div>
          </div>
        </div>

        {/* ═══ PRIVACIDADE ═══ */}
        <div className="settings-section">
          <div className="settings-section-header">Privacidade &amp; Dados</div>

          <ToggleRow
            label="Compartilhar dados de uso"
            desc="Ajudar a melhorar o MCO com dados anônimos"
            value={settings.analytics as boolean}
            onChange={(v) => update('analytics', v)}
          />

          <div className="settings-row" style={{ cursor: 'pointer' }}>
            <div>
              <div className="settings-row-label">Exportar meus dados</div>
              <div className="settings-row-desc">Baixar um relatório com todas as suas atividades</div>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--vale-teal-light)' }}>Exportar →</span>
          </div>

          <div className="settings-row" style={{ cursor: 'pointer' }}>
            <div>
              <div className="settings-row-label">Termos de uso</div>
              <div className="settings-row-desc">Política de privacidade e termos do sistema</div>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Ver →</span>
          </div>
        </div>

        {/* ═══ SISTEMA ═══ */}
        <div className="settings-section">
          <div className="settings-section-header">Sistema</div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Versão</div>
            </div>
            <div className="settings-row-value">MCO v1.0.0</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Ambiente</div>
            </div>
            <div className="settings-row-value">
              <span style={{ ...envBadge, background: 'var(--glow-gold)', color: 'var(--vale-gold)' }}>
                DEV
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Engine IA</div>
              <div className="settings-row-desc">ReactionEngine v3 — perfil comportamental ativo</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--vale-green)', boxShadow: '0 0 6px var(--vale-green)' }} />
              <span className="settings-row-value" style={{ color: 'var(--vale-green)' }}>Online</span>
            </div>
          </div>

          <div className="settings-row" style={{ cursor: 'pointer' }}>
            <div>
              <div className="settings-row-label">Enviar feedback</div>
              <div className="settings-row-desc">Reportar problema ou sugerir melhoria</div>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--vale-teal-light)' }}>Abrir →</span>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Banco de dados local</div>
              <div className="settings-row-desc">Seus dados estão salvos no navegador (localStorage)</div>
            </div>
            <button
              onClick={() => {
                if (confirm('Restaurar TODOS os dados ao estado original?\n\nProjetos, evidências, ações e conversas serão resetados.\nEsta ação não pode ser desfeita.')) {
                  import('@shared/api/mock-projetos').then(({ resetProjetosDb }) => resetProjetosDb());
                  import('@shared/api/mock-conversa').then(({ resetConversaDb }) => resetConversaDb());
                  alert('Dados restaurados. A página vai recarregar.');
                  window.location.reload();
                }
              }}
              style={resetDbBtn}
            >
              Restaurar dados originais
            </button>
          </div>
        </div>

        {/* ═══ LOGOUT ═══ */}
        <button onClick={logout} style={logoutBtn}>
          Sair da conta
        </button>

        <div style={footerNote}>
          MCO · Motor de Condução Operacional · Vale S.A.<br />
          CCQ Ferrovia · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════

function ToggleRow({ label, desc, value, onChange }: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="settings-row" style={{ cursor: 'pointer' }} onClick={() => onChange(!value)}>
      <div>
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-desc">{desc}</div>
      </div>
      <div className={`toggle-switch ${value ? 'active' : ''}`} />
    </div>
  );
}

function ThemeOption({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      ...themeOptionStyle,
      background: active ? 'var(--glow-teal)' : 'transparent',
      color: active ? 'var(--vale-teal-light)' : 'var(--text-muted)',
      borderColor: active ? 'var(--vale-teal)' : 'var(--border-default)',
    }}>
      {label}
    </button>
  );
}

function EditableValue({ value, onSave, placeholder }: {
  value: string;
  onSave: (v: string) => void;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onSave(draft); setEditing(false); }
            if (e.key === 'Escape') { setDraft(value); setEditing(false); }
          }}
          onBlur={() => { onSave(draft); setEditing(false); }}
          placeholder={placeholder}
          style={editInput}
        />
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} style={editableBtn}>
      {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{placeholder}</span>}
      <span style={{ fontSize: '0.625rem', opacity: 0.4, marginLeft: '0.25rem' }}>✏</span>
    </button>
  );
}

// ════════════════════════════════════
// SETTINGS PERSISTENCE
// ════════════════════════════════════

function loadSettings(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem('mco-user-settings');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  return {
    unit: 'Ferrovia EFC',
    cargo: '',
    matricula: '',
    density: 'normal',
    defaultRole: 'lider',
    pushEnabled: true,
    aiCobrancas: true,
    dailyEmail: false,
    deadlineAlerts: true,
    soundEnabled: false,
    analytics: true,
  };
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const profileHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.25rem',
  marginBottom: '1.5rem',
  padding: '1.5rem 0 1rem',
};

const avatarLarge: React.CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--vale-teal), var(--vale-cyan))',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: '1.75rem',
  flexShrink: 0,
  boxShadow: '0 0 0 3px var(--bg-surface), 0 0 0 5px var(--vale-teal)',
};

const nameStyle: React.CSSProperties = {
  fontSize: '1.375rem',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: 0,
  lineHeight: 1.3,
};

const emailStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)',
  margin: '0.125rem 0 0.5rem',
};

const roleBadgeRow: React.CSSProperties = {
  display: 'flex',
  gap: '0.375rem',
};

const roleBadge: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontWeight: 700,
  padding: '0.2rem 0.5rem',
  borderRadius: 'var(--radius-full)',
  border: '1px solid',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const themeOptionStyle: React.CSSProperties = {
  padding: '0.375rem 0.625rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
};

const editInput: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--vale-teal)',
  borderRadius: 'var(--radius-sm)',
  padding: '0.375rem 0.5rem',
  fontSize: '0.8125rem',
  fontFamily: 'var(--font-mono)',
  color: 'var(--text-primary)',
  width: 160,
  outline: 'none',
};

const editableBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.8125rem',
  fontFamily: 'var(--font-mono)',
  color: 'var(--text-secondary)',
  padding: '0.25rem 0.375rem',
  borderRadius: 'var(--radius-sm)',
  transition: 'background 0.15s',
  display: 'flex',
  alignItems: 'center',
};

const statValue: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--vale-teal-light)',
};

const envBadge: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontWeight: 700,
  padding: '0.15rem 0.4rem',
  borderRadius: 'var(--radius-full)',
  letterSpacing: '0.06em',
};

const resetDbBtn: React.CSSProperties = {
  padding: '0.4rem 0.75rem',
  fontSize: '0.6875rem',
  fontWeight: 700,
  border: '1px solid var(--vale-gold)',
  color: 'var(--vale-gold)',
  background: 'var(--glow-gold)',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  whiteSpace: 'nowrap',
};

const logoutBtn: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  color: 'var(--sev-critica)',
  background: 'transparent',
  border: '1px solid var(--sev-critica)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const footerNote: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '0.625rem',
  color: 'var(--text-muted)',
  padding: '0.5rem 0 2rem',
  lineHeight: 1.6,
};
