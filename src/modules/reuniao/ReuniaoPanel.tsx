/**
 * REUNIÃO PANEL — Painel de modo reunião dentro do workspace.
 *
 * Checklist 7:
 *   [x] Ativar modo reunião
 *   [x] Registrar decisões
 *   [x] Criar tarefas rápidas
 *   [x] Alterar fase coletiva
 *   [x] Registrar presença
 *   [x] Gerar ata automática
 */

import { useState } from 'react';
import { useAuth } from '@app/auth';
import {
  getReuniaoAtiva,
  iniciarReuniao,
  finalizarReuniao,
  marcarPresenca,
  registrarDecisao,
  criarTarefaRapida,
  type Reuniao,
  type AtaGerada,
} from '@modules/reuniao';
import type { StatusProjeto } from '@shared/engine';

// ═══════════════════════════════════
// STYLES
// ═══════════════════════════════════

const panelStyle: React.CSSProperties = {
  padding: 16,
};

const sectionTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: '0.95rem',
  color: 'var(--text-primary)',
  marginBottom: 12,
  marginTop: 20,
};

const cardStyle: React.CSSProperties = {
  background: 'var(--surface-primary)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
};

const checkRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 0',
  borderBottom: '1px solid var(--border)',
  minHeight: 48,
};

const checkLabel: React.CSSProperties = {
  flex: 1,
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
};

const roleTag: React.CSSProperties = {
  fontSize: '0.7rem',
  padding: '2px 6px',
  borderRadius: 6,
  background: 'var(--surface-tertiary)',
  color: 'var(--text-secondary)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  minHeight: 48,
  marginBottom: 8,
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--btn-primary-bg)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  minHeight: 48,
  width: '100%',
};

const btnDanger: React.CSSProperties = {
  ...btnPrimary,
  background: '#dc2626',
};

const miniBtn: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 6,
  border: 'none',
  background: 'var(--btn-primary-bg)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.8rem',
  cursor: 'pointer',
  minHeight: 40,
};

const listItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 0',
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border)',
};

const ataBox: React.CSSProperties = {
  background: 'var(--surface-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: 16,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.8rem',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.5,
  maxHeight: 400,
  overflow: 'auto',
  color: 'var(--text-primary)',
};

const activeBanner: React.CSSProperties = {
  background: 'var(--btn-primary-bg)',
  color: '#fff',
  borderRadius: 12,
  padding: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 16,
};

// ═══════════════════════════════════
// COMPONENT
// ═══════════════════════════════════

interface Props {
  status: StatusProjeto;
}

export function ReuniaoPanel({ status }: Props) {
  const { user } = useAuth();
  const { projeto } = status;

  const [reuniao, setReuniao] = useState<Reuniao | null>(() => getReuniaoAtiva(projeto.id));
  const [ata, setAta] = useState<AtaGerada | null>(null);

  // Forms
  const [decisaoText, setDecisaoText] = useState('');
  const [tarefaDesc, setTarefaDesc] = useState('');
  const [tarefaResp, setTarefaResp] = useState('');
  const [tarefaPrazo, setTarefaPrazo] = useState('');
  const [obsFinais, setObsFinais] = useState('');

  // ── Iniciar reunião ──
  function handleIniciar() {
    if (!user) return;
    const r = iniciarReuniao({
      projectId: projeto.id,
      projectName: projeto.titulo,
      faseAtual: projeto.faseAtual,
      membros: projeto.membros.map(m => ({ id: m.id, nome: m.nome, papel: m.papel })),
      userId: user.id,
      userName: user.name,
    });
    setReuniao({ ...r });
  }

  // ── Presença ──
  function handlePresenca(userId: string, presente: boolean) {
    if (!reuniao) return;
    marcarPresenca(reuniao.id, userId, presente);
    setReuniao({ ...reuniao });
  }

  // ── Decisão ──
  function handleDecisao() {
    if (!reuniao || !decisaoText.trim()) return;
    registrarDecisao(reuniao.id, decisaoText.trim());
    setDecisaoText('');
    setReuniao({ ...getReuniaoAtiva(projeto.id)! });
  }

  // ── Tarefa rápida ──
  function handleTarefa() {
    if (!reuniao || !tarefaDesc.trim() || !tarefaResp) return;
    const membro = projeto.membros.find(m => m.id === tarefaResp);
    criarTarefaRapida(reuniao.id, {
      descricao: tarefaDesc.trim(),
      responsavelId: tarefaResp,
      responsavelNome: membro?.nome ?? tarefaResp,
      prazo: tarefaPrazo || new Date(Date.now() + 7 * 86400_000).toISOString().split('T')[0],
    });
    setTarefaDesc('');
    setTarefaResp('');
    setTarefaPrazo('');
    setReuniao({ ...getReuniaoAtiva(projeto.id)! });
  }

  // ── Finalizar ──
  function handleFinalizar() {
    if (!reuniao || !user) return;
    const result = finalizarReuniao(reuniao.id, {
      faseNoFim: projeto.faseAtual,
      observacoes: obsFinais,
      userId: user.id,
      userName: user.name,
    });
    setAta(result);
    setReuniao(null);
  }

  // ═══ SEM REUNIÃO ATIVA ═══
  if (!reuniao && !ata) {
    return (
      <div style={panelStyle}>
        <h3 style={sectionTitle}>👥 Modo Reunião</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
          Ative o modo reunião para registrar presenças, decisões e tarefas em tempo real.
        </p>
        <button style={btnPrimary} onClick={handleIniciar}>
          ▶ Iniciar Reunião
        </button>
      </div>
    );
  }

  // ═══ ATA GERADA ═══
  if (ata) {
    return (
      <div style={panelStyle}>
        <h3 style={sectionTitle}>📋 Ata da Reunião</h3>
        <div style={ataBox}>{ata.textoCompleto}</div>
        <button
          style={{ ...btnPrimary, marginTop: 16 }}
          onClick={() => {
            navigator.clipboard?.writeText(ata.textoCompleto);
          }}
        >
          📋 Copiar Ata
        </button>
        <button
          style={{
            ...btnPrimary,
            marginTop: 8,
            background: 'var(--surface-tertiary)',
            color: 'var(--text-primary)',
          }}
          onClick={() => setAta(null)}
        >
          ← Voltar
        </button>
      </div>
    );
  }

  // ═══ REUNIÃO ATIVA ═══
  const presentes = reuniao!.participantes.filter(p => p.presente).length;
  const total = reuniao!.participantes.length;

  return (
    <div style={panelStyle}>
      {/* Banner ativo */}
      <div style={activeBanner}>
        <span style={{ fontSize: '1.5rem' }}>🔴</span>
        <div>
          <div style={{ fontWeight: 700 }}>Reunião em andamento</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            {presentes}/{total} presentes · Fase {projeto.faseAtual}
          </div>
        </div>
      </div>

      {/* Presença */}
      <h4 style={sectionTitle}>Presença</h4>
      <div style={cardStyle}>
        {reuniao!.participantes.map(p => (
          <div key={p.userId} style={checkRow}>
            <input
              type="checkbox"
              checked={p.presente}
              onChange={e => handlePresenca(p.userId, e.target.checked)}
              style={{ width: 22, height: 22, cursor: 'pointer' }}
            />
            <span style={checkLabel}>{p.nome}</span>
            <span style={roleTag}>{p.papel}</span>
          </div>
        ))}
      </div>

      {/* Decisões */}
      <h4 style={sectionTitle}>Decisões ({reuniao!.decisoes.length})</h4>
      <div style={cardStyle}>
        {reuniao!.decisoes.map((d, i) => (
          <div key={d.id} style={listItem}>
            <span style={{ fontWeight: 700, color: 'var(--accent-yellow)' }}>{i + 1}.</span>
            <span>{d.texto}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            type="text"
            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
            placeholder="Registrar decisão..."
            value={decisaoText}
            onChange={e => setDecisaoText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDecisao()}
          />
          <button style={miniBtn} onClick={handleDecisao}>
            +
          </button>
        </div>
      </div>

      {/* Tarefas rápidas */}
      <h4 style={sectionTitle}>Tarefas ({reuniao!.tarefas.length})</h4>
      <div style={cardStyle}>
        {reuniao!.tarefas.map((t, i) => (
          <div key={t.id} style={listItem}>
            <span style={{ fontWeight: 700 }}>{i + 1}.</span>
            <span style={{ flex: 1 }}>{t.descricao}</span>
            <span style={roleTag}>{t.responsavelNome}</span>
          </div>
        ))}
        <input
          type="text"
          style={inputStyle}
          placeholder="Descrição da tarefa..."
          value={tarefaDesc}
          onChange={e => setTarefaDesc(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            style={{ ...inputStyle, flex: 1 }}
            value={tarefaResp}
            onChange={e => setTarefaResp(e.target.value)}
          >
            <option value="">Responsável...</option>
            {projeto.membros.map(m => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
          <input
            type="date"
            style={{ ...inputStyle, flex: 1 }}
            value={tarefaPrazo}
            onChange={e => setTarefaPrazo(e.target.value)}
          />
        </div>
        <button style={{ ...miniBtn, width: '100%' }} onClick={handleTarefa}>
          ➕ Adicionar Tarefa
        </button>
      </div>

      {/* Observações finais */}
      <h4 style={sectionTitle}>Observações</h4>
      <textarea
        style={{ ...inputStyle, minHeight: 60 }}
        placeholder="Observações gerais da reunião..."
        value={obsFinais}
        onChange={e => setObsFinais(e.target.value)}
      />

      {/* Finalizar */}
      <button style={{ ...btnDanger, marginTop: 12 }} onClick={handleFinalizar}>
        ⏹ Finalizar Reunião e Gerar Ata
      </button>
    </div>
  );
}
