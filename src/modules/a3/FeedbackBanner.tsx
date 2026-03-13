/**
 * FEEDBACK BANNER — Avisos pedagógicos inline no formulário A3.
 *
 * Três estados visuais:
 *   🟢 OK      → fundo verde sutil, progresso
 *   🟡 AVISO   → fundo amarelo, sugestão (NÃO bloqueia)
 *   🔴 BLOQUEIO → fundo vermelho, impede avanço
 *
 * Visual: barra lateral colorida + ícone + mensagem + dica.
 * Estilo SAP Fiori alert pattern.
 */

import type React from 'react';
import type { ResultadoValidacao, SeveridadeValidacao } from '@modules/ai/a3Validator';

// ════════════════════════════════════
// SINGLE FEEDBACK ITEM
// ════════════════════════════════════

interface FeedbackItemProps {
  validacao: ResultadoValidacao;
}

export function FeedbackItem({ validacao }: FeedbackItemProps) {
  const config = SEVERIDADE_CONFIG[validacao.severidade];

  return (
    <div style={{ ...itemStyle, borderLeftColor: config.borderColor, background: config.bg }}>
      <div style={itemHeaderStyle}>
        <span style={{ fontSize: '16px' }}>{config.icon}</span>
        <span style={{ ...itemMsgStyle, color: config.textColor }}>{validacao.mensagem}</span>
      </div>
      {validacao.dicaCorrecao && (
        <div style={dicaStyle}>
          <span style={{ fontSize: '12px' }}>💡</span>
          <span>{validacao.dicaCorrecao}</span>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════
// FEEDBACK BANNER (group of items)
// ════════════════════════════════════

interface FeedbackBannerProps {
  validacoes: ResultadoValidacao[];
  /** Mostra quando não há validações */
  mensagemVazia?: string;
}

export function FeedbackBanner({ validacoes, mensagemVazia }: FeedbackBannerProps) {
  if (validacoes.length === 0 && !mensagemVazia) return null;

  if (validacoes.length === 0 && mensagemVazia) {
    return (
      <div style={bannerContainerStyle}>
        <div
          style={{
            ...itemStyle,
            borderLeftColor: '#9ca3af',
            background: 'var(--surface-1, #f5f5f5)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{mensagemVazia}</span>
        </div>
      </div>
    );
  }

  // Ordenar: bloqueio → aviso → ok
  const sorted = [...validacoes].sort((a, b) => {
    const order: Record<SeveridadeValidacao, number> = { bloqueio: 0, aviso: 1, ok: 2 };
    return order[a.severidade] - order[b.severidade];
  });

  return (
    <div style={bannerContainerStyle}>
      {sorted.map((v, i) => (
        <FeedbackItem key={`${v.campo}-${i}`} validacao={v} />
      ))}
    </div>
  );
}

// ════════════════════════════════════
// INLINE FIELD FEEDBACK (micro)
// ════════════════════════════════════

interface InlineFeedbackProps {
  feedback: { cor: string; icone: string; msg: string } | null;
}

/**
 * Micro feedback ao lado de um input.
 * Aparece em tempo real enquanto o usuário digita.
 */
export function InlineFeedback({ feedback }: InlineFeedbackProps) {
  if (!feedback) return null;

  return (
    <span style={{ ...inlineStyle, color: feedback.cor }}>
      <span>{feedback.icone}</span>
      <span>{feedback.msg}</span>
    </span>
  );
}

// ════════════════════════════════════
// STEP ORIENTATION HEADER
// ════════════════════════════════════

interface StepOrientationProps {
  pergunta: string;
  dica: string;
  cuidado: string;
}

/**
 * Cabeçalho de orientação no topo de cada passo.
 * Mostra: pergunta guia + exemplo bom + exemplo ruim.
 */
export function StepOrientation({ pergunta, dica, cuidado }: StepOrientationProps) {
  return (
    <div style={orientationStyle}>
      <div style={orientationQuestionStyle}>
        <span style={{ fontSize: '18px' }}>🎯</span>
        <span>{pergunta}</span>
      </div>
      <div style={orientationExamplesStyle}>
        <span style={{ color: 'var(--accent-green)', fontSize: '12px' }}>{dica}</span>
        <span style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>{cuidado}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// BLOQUEIO DE AVANÇO
// ════════════════════════════════════

interface BloqueioAvancoProps {
  mensagem: string;
  onDismiss?: () => void;
}

/**
 * Modal/banner quando o usuário tenta avançar sem validação.
 */
export function BloqueioAvanco({ mensagem, onDismiss }: BloqueioAvancoProps) {
  return (
    <div style={bloqueioOverlay}>
      <div style={bloqueioCard}>
        <span style={{ fontSize: '32px' }}>🚫</span>
        <p style={bloqueioMsgStyle}>{mensagem}</p>
        <button onClick={onDismiss} style={bloqueioBtn}>
          Entendi — vou corrigir
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// CONFIG
// ════════════════════════════════════

const SEVERIDADE_CONFIG: Record<
  SeveridadeValidacao,
  {
    icon: string;
    bg: string;
    borderColor: string;
    textColor: string;
  }
> = {
  ok: {
    icon: '✅',
    bg: 'rgba(105, 190, 40, 0.06)',
    borderColor: 'var(--accent-green)',
    textColor: 'var(--accent-green)',
  },
  aviso: {
    icon: '⚠️',
    bg: 'rgba(237, 177, 17, 0.06)',
    borderColor: 'var(--accent-yellow)',
    textColor: '#8a6d00',
  },
  bloqueio: {
    icon: '🔴',
    bg: 'rgba(229, 57, 53, 0.06)',
    borderColor: '#e53935',
    textColor: '#c62828',
  },
};

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const bannerContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '12px',
};

const itemStyle: React.CSSProperties = {
  borderLeft: '4px solid',
  borderRadius: '0 8px 8px 0',
  padding: '10px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const itemHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const itemMsgStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  lineHeight: 1.3,
};

const dicaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '6px',
  fontSize: '12px',
  color: 'var(--text-secondary, #555)',
  lineHeight: 1.4,
  paddingLeft: '24px',
};

const inlineStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.02em',
};

const orientationStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  borderRadius: '10px',
  padding: '14px 16px',
  marginBottom: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const orientationQuestionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '15px',
  fontWeight: 700,
  color: '#fff',
};

const orientationExamplesStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  paddingLeft: '28px',
};

const bloqueioOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px',
};

const bloqueioCard: React.CSSProperties = {
  background: 'var(--surface-0, #fff)',
  borderRadius: '16px',
  padding: '32px 24px',
  maxWidth: '380px',
  width: '100%',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
};

const bloqueioMsgStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.5,
  color: 'var(--text-primary)',
  margin: 0,
};

const bloqueioBtn: React.CSSProperties = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '10px',
  background: 'var(--btn-primary-bg)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};
