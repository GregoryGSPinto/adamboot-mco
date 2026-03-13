import type React from 'react';
import { useState, useCallback } from 'react';
import { useAuth } from '@app/auth';
import { useAppStore } from '@shared/hooks/use-app-store';

/**
 * PERFIL — configuracoes completas do usuario MCO.
 *
 * Secoes:
 *   1. Identidade (avatar, nome, email, cargo, unidade)
 *   2. Preferencias (tema, idioma, notificacoes)
 *   3. Notificacoes (push, email, cobrancas IA, resumo)
 *   4. Projetos (papel, estatisticas rapidas)
 *   5. Sistema (versao, termos, feedback, sair)
 */
export function PerfilPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useAppStore();

  // Settings state (localStorage persisted)
  const [settings, setSettings] = useState(() => loadSettings());

  const update = useCallback((key: string, value: unknown) => {
    setSettings((prev: Record<string, unknown>) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('mco-user-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const userName = user?.name ?? 'Usuario';
  const userEmail = user?.email ?? '—';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="fade-in" style={{ maxWidth: 640, margin: '0 auto', padding: '24px 0' }}>
      {/* HEADER: AVATAR + IDENTITY */}
      <div style={profileHeader}>
        <div style={avatarLarge}>{initial}</div>
        <div>
          <h1 style={nameStyle}>{userName}</h1>
          <p style={emailStyle}>{userEmail}</p>
          <div style={roleBadgeRow}>
            <span
              style={{
                ...roleBadge,
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              Lider CCQ
            </span>
            <span
              style={{
                ...roleBadge,
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              Membro
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* INFORMACOES PESSOAIS */}
        <Section title="INFORMACOES PESSOAIS">
          <Row label="Nome completo" desc="Exibido nos projetos e cobrancas">
            <span style={rowValue}>{userName}</span>
          </Row>
          <Row label="E-mail corporativo" desc="Autenticado via Azure AD">
            <span style={rowValue}>{userEmail}</span>
          </Row>
          <Row label="Unidade" desc="Planta ou area operacional">
            <EditableValue
              value={settings.unit as string}
              onSave={v => update('unit', v)}
              placeholder="Ex: Ferrovia EFC"
            />
          </Row>
          <Row label="Cargo" desc="Funcao na organizacao">
            <EditableValue
              value={settings.cargo as string}
              onSave={v => update('cargo', v)}
              placeholder="Ex: Operador Ferroviario"
            />
          </Row>
          <Row label="Matricula">
            <EditableValue
              value={settings.matricula as string}
              onSave={v => update('matricula', v)}
              placeholder="00000"
            />
          </Row>
        </Section>

        {/* APARENCIA */}
        <Section title="APARENCIA">
          <Row label="Tema" desc="Aparencia da interface">
            <div style={{ display: 'flex', gap: 4 }}>
              <OptionBtn
                label="Escuro"
                active={theme === 'dark'}
                onClick={() => setTheme('dark')}
              />
              <OptionBtn
                label="Claro"
                active={theme === 'light'}
                onClick={() => setTheme('light')}
              />
            </div>
          </Row>
          <Row label="Idioma" desc="Idioma do sistema">
            <span style={rowValue}>Portugues (BR)</span>
          </Row>
          <Row label="Densidade da interface" desc="Tamanho dos elementos visuais">
            <div style={{ display: 'flex', gap: 4 }}>
              {(['compacto', 'normal', 'confortavel'] as const).map(d => (
                <OptionBtn
                  key={d}
                  label={d === 'compacto' ? 'Compacto' : d === 'normal' ? 'Normal' : 'Confortavel'}
                  active={settings.density === d}
                  onClick={() => update('density', d)}
                />
              ))}
            </div>
          </Row>
        </Section>

        {/* NOTIFICACOES */}
        <Section title="NOTIFICACOES">
          <ToggleRow
            label="Notificacoes push"
            desc="Receber alertas no navegador"
            value={settings.pushEnabled as boolean}
            onChange={v => update('pushEnabled', v)}
          />
          <ToggleRow
            label="Cobrancas do Coordenador IA"
            desc="Mensagens automaticas do assistente no chat do projeto"
            value={settings.aiCobrancas as boolean}
            onChange={v => update('aiCobrancas', v)}
          />
          <ToggleRow
            label="Resumo diario por e-mail"
            desc="Receber resumo das pendencias todo dia as 8h"
            value={settings.dailyEmail as boolean}
            onChange={v => update('dailyEmail', v)}
          />
          <ToggleRow
            label="Alertas de prazo"
            desc="Avisar quando faltar menos de 7 dias para apresentacao"
            value={settings.deadlineAlerts as boolean}
            onChange={v => update('deadlineAlerts', v)}
          />
          <ToggleRow
            label="Som de notificacao"
            desc="Tocar som ao receber cobrancas"
            value={settings.soundEnabled as boolean}
            onChange={v => update('soundEnabled', v)}
          />
        </Section>

        {/* PROJETOS */}
        <Section title="PROJETOS">
          <Row label="Papel padrao" desc="Como voce participa dos projetos">
            <div style={{ display: 'flex', gap: 4 }}>
              {(['lider', 'membro', 'facilitador'] as const).map(r => (
                <OptionBtn
                  key={r}
                  label={r === 'lider' ? 'Lider' : r === 'membro' ? 'Membro' : 'Facilitador'}
                  active={settings.defaultRole === r}
                  onClick={() => update('defaultRole', r)}
                />
              ))}
            </div>
          </Row>
          <Row label="Projetos ativos">
            <span style={statValue}>2</span>
          </Row>
          <Row label="Requisitos cumpridos (total)">
            <span style={statValue}>14</span>
          </Row>
          <Row label="Fases concluidas (total)">
            <span style={statValue}>7</span>
          </Row>
        </Section>

        {/* PRIVACIDADE */}
        <Section title="PRIVACIDADE E DADOS">
          <ToggleRow
            label="Compartilhar dados de uso"
            desc="Ajudar a melhorar o MCO com dados anonimos"
            value={settings.analytics as boolean}
            onChange={v => update('analytics', v)}
          />
          <Row
            label="Exportar meus dados"
            desc="Baixar um relatorio com todas as suas atividades"
            clickable
          >
            <span style={{ fontSize: 14, color: 'var(--accent-blue)' }}>Exportar</span>
          </Row>
          <Row label="Termos de uso" desc="Politica de privacidade e termos do sistema" clickable>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Ver</span>
          </Row>
        </Section>

        {/* SISTEMA */}
        <Section title="SISTEMA">
          <Row label="Versao">
            <span style={rowValue}>MCO v1.0.0</span>
          </Row>
          <Row label="Ambiente">
            <span style={envBadge}>DEV</span>
          </Row>
          <Row label="Engine IA" desc="ReactionEngine v3 — perfil comportamental ativo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                }}
              />
              <span style={{ fontSize: 14, color: 'var(--accent-green)' }}>Online</span>
            </div>
          </Row>
          <Row label="Enviar feedback" desc="Reportar problema ou sugerir melhoria" clickable>
            <span style={{ fontSize: 14, color: 'var(--accent-blue)' }}>Abrir</span>
          </Row>
          <Row
            label="Banco de dados local"
            desc="Seus dados estao salvos no navegador (localStorage)"
          >
            <button
              onClick={() => {
                if (
                  confirm(
                    'Restaurar TODOS os dados ao estado original?\n\nProjetos, evidencias, acoes e conversas serao resetados.\nEsta acao nao pode ser desfeita.'
                  )
                ) {
                  import('@shared/api/mock-projetos').then(({ resetProjetosDb }) =>
                    resetProjetosDb()
                  );
                  import('@shared/api/mock-conversa').then(({ resetConversaDb }) =>
                    resetConversaDb()
                  );
                  alert('Dados restaurados. A pagina vai recarregar.');
                  window.location.reload();
                }
              }}
              style={resetDbBtn}
            >
              Restaurar dados originais
            </button>
          </Row>
        </Section>

        {/* LOGOUT */}
        <button onClick={logout} style={logoutBtn}>
          Sair da conta
        </button>

        <div style={footerNote}>
          MCO -- Motor de Conducao Operacional -- Vale S.A.
          <br />
          CCQ Ferrovia -- {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={sectionCard}>
      <div style={sectionHeader}>{title}</div>
      {children}
    </div>
  );
}

function Row({
  label,
  desc,
  children,
  clickable,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
  clickable?: boolean;
}) {
  return (
    <div style={{ ...settingsRow, cursor: clickable ? 'pointer' : 'default' }}>
      <div style={{ flex: 1 }}>
        <div style={rowLabel}>{label}</div>
        {desc && <div style={rowDesc}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ ...settingsRow, cursor: 'pointer' }} onClick={() => onChange(!value)}>
      <div style={{ flex: 1 }}>
        <div style={rowLabel}>{label}</div>
        <div style={rowDesc}>{desc}</div>
      </div>
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: value ? 'var(--accent-green)' : 'var(--bg-secondary)',
          border: '1px solid',
          borderColor: value ? 'var(--accent-green)' : 'var(--border)',
          position: 'relative',
          transition: 'all 0.2s',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 2,
            left: value ? 19 : 2,
            transition: 'left 0.2s',
          }}
        />
      </div>
    </div>
  );
}

function OptionBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'inherit',
        borderRadius: 6,
        border: '1px solid',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap' as const,
        background: active ? 'var(--btn-primary-bg)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
        borderColor: active ? 'var(--btn-primary-bg)' : 'var(--border)',
      }}
    >
      {label}
    </button>
  );
}

function EditableValue({
  value,
  onSave,
  placeholder,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onSave(draft);
              setEditing(false);
            }
            if (e.key === 'Escape') {
              setDraft(value);
              setEditing(false);
            }
          }}
          onBlur={() => {
            onSave(draft);
            setEditing(false);
          }}
          placeholder={placeholder}
          style={editInput}
        />
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} style={editableBtn}>
      {value || (
        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{placeholder}</span>
      )}
    </button>
  );
}

// ═══════════════════════════════════
// SETTINGS PERSISTENCE
// ═══════════════════════════════════

function loadSettings(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem('mco-user-settings');
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }

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

// ═══════════════════════════════════
// STYLES
// ═══════════════════════════════════

const profileHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  marginBottom: 24,
  paddingBottom: 16,
  borderBottom: '1px solid var(--border)',
};

const avatarLarge: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'var(--bg-secondary)',
  border: '2px solid var(--border)',
  color: 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: 24,
  flexShrink: 0,
};

const nameStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  margin: 0,
  color: 'var(--text-primary)',
  lineHeight: 1.3,
};

const emailStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-muted)',
  margin: '2px 0 8px',
};

const roleBadgeRow: React.CSSProperties = {
  display: 'flex',
  gap: 6,
};

const roleBadge: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 6,
  border: '1px solid',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const sectionCard: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 6,
  overflow: 'hidden',
};

const sectionHeader: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  letterSpacing: '0.04em',
  padding: '10px 16px',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border)',
};

const settingsRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 16px',
  borderBottom: '1px solid var(--border)',
  gap: 12,
};

const rowLabel: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--text-primary)',
};

const rowDesc: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-muted)',
  marginTop: 1,
};

const rowValue: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
};

const editInput: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--focus-ring)',
  borderRadius: 6,
  padding: '4px 8px',
  fontSize: 14,
  color: 'var(--text-primary)',
  width: 160,
  outline: 'none',
  fontFamily: 'inherit',
};

const editableBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  color: 'var(--text-secondary)',
  padding: '4px 6px',
  borderRadius: 6,
  transition: 'background 0.15s',
  display: 'flex',
  alignItems: 'center',
  fontFamily: 'inherit',
};

const statValue: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const envBadge: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 6,
  background: 'var(--accent-yellow)',
  color: '#fff',
  letterSpacing: '0.04em',
};

const resetDbBtn: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  border: '1px solid var(--accent-yellow)',
  color: 'var(--accent-yellow)',
  background: 'transparent',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
};

const logoutBtn: React.CSSProperties = {
  width: '100%',
  padding: 12,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'inherit',
  color: 'var(--accent-red)',
  background: 'transparent',
  border: '1px solid var(--accent-red)',
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const footerNote: React.CSSProperties = {
  textAlign: 'center',
  fontSize: 12,
  color: 'var(--text-muted)',
  padding: '8px 0 32px',
  lineHeight: 1.6,
};
