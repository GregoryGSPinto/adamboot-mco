/**
 * A3 WORKSPACE VIEW — Visão principal orientada por A3.
 *
 * COMPOSIÇÃO (não substitui — envolve):
 *   A3StepIndicator (topo)
 *   → StepOrientation (pergunta guia do passo)
 *   → FeedbackBanner (validações do passo)
 *   → CadernoView (formulário existente — INTOCADO)
 *   → Barra de ação (avançar/voltar)
 *
 * Visual: corporativo industrial Vale/SAP.
 * Fundo escuro no header, cards brancos, tipografia condensada.
 */

import { useState, useMemo } from 'react';
import type React from 'react';
import { useProjectContext } from '@modules/projeto';
import { FASE_LABELS, TOTAL_FASES } from '@shared/engine';
import { CadernoView } from '@modules/caderno';
import { A3StepIndicator } from './A3StepIndicator';
import { FeedbackBanner, StepOrientation, BloqueioAvanco } from './FeedbackBanner';
import {
  validarProblema,
  validarMeta,
  validarCausaRaiz,
  validarContramedida,
  podAcessarPasso,
  type ResultadoValidacao,
  type A3DadosProjeto,
} from '@modules/ai/a3Validator';
import { gerarDicaPasso, mensagemBloqueioAvanco } from '@modules/ai/pedagogicalFeedback';

export function A3WorkspaceView() {
  const { status } = useProjectContext();
  const { projeto, bloqueio: _bloqueio } = status;
  const [showBloqueio, setShowBloqueio] = useState<string | null>(null);

  // Extrair dados do projeto para validação
  const a3Dados = useMemo((): A3DadosProjeto => {
    // Tentar extrair dados do projeto real
    // Em mock, usa campos do projeto existente
    const descricao = projeto.titulo;
    const acoes = projeto.acoes?.map(a => a.descricao) ?? [];
    return {
      problema: descricao,
      meta: undefined, // será preenchido pelo formulário
      causaRaiz: undefined,
      contramedidas: acoes.length > 0 ? acoes : undefined,
      desdobramento: undefined,
    };
  }, [projeto]);

  // Validações do passo atual
  const validacoes = useMemo((): ResultadoValidacao[] => {
    const results: ResultadoValidacao[] = [];
    const fase = projeto.faseAtual;

    if (fase === 1 && a3Dados.problema) {
      results.push(validarProblema(a3Dados.problema));
    }
    if (fase === 3 && a3Dados.meta) {
      results.push(validarMeta(a3Dados.meta));
    }
    if (fase === 4 && a3Dados.causaRaiz) {
      results.push(validarCausaRaiz(a3Dados.causaRaiz));
    }
    if ((fase === 5 || fase === 6) && a3Dados.contramedidas) {
      a3Dados.contramedidas.forEach((cm, i) => {
        const v = validarContramedida(cm, a3Dados.causaRaiz);
        results.push({ ...v, campo: `contramedida_${i + 1}` });
      });
    }

    return results;
  }, [projeto.faseAtual, a3Dados]);

  // Dica do passo
  const dica = useMemo(() => gerarDicaPasso(projeto.faseAtual), [projeto.faseAtual]);

  // Handler de avanço com validação
  const handleTentarAvancar = () => {
    const proxPasso = projeto.faseAtual + 1;
    const check = podAcessarPasso(proxPasso, a3Dados);
    if (!check.podeAcessar) {
      setShowBloqueio(check.motivoBloqueio ?? mensagemBloqueioAvanco(projeto.faseAtual));
    }
  };

  // Handler select fase
  const handleSelectFase = (fase: number) => {
    const check = podAcessarPasso(fase, a3Dados);
    if (!check.podeAcessar) {
      setShowBloqueio(
        check.motivoBloqueio ?? `Passo ${fase} bloqueado. Complete o passo anterior.`
      );
    }
  };

  const temBloqueios = validacoes.some(v => v.severidade === 'bloqueio');

  return (
    <div style={containerStyle}>
      {/* ═══ SYSTEM HEADER ═══ */}
      <div style={systemHeaderStyle}>
        <div style={systemHeaderRow}>
          <div style={systemTitleStyle}>
            <span style={systemIconStyle}>◈</span>
            <div>
              <div style={systemNameStyle}>ADAMBOOT</div>
              <div style={systemSubStyle}>Sistema de Melhoria Contínua — A3 / MASP / PDCA</div>
            </div>
          </div>
          <div style={projectIdStyle}>{projeto.id.slice(0, 8).toUpperCase()}</div>
        </div>
      </div>

      {/* ═══ A3 STEP INDICATOR ═══ */}
      <A3StepIndicator
        faseAtual={projeto.faseAtual}
        totalFases={TOTAL_FASES}
        onSelectFase={handleSelectFase}
        bloqueadaAte={projeto.faseAtual}
      />

      {/* ═══ STEP ORIENTATION ═══ */}
      {dica.pergunta && (
        <StepOrientation pergunta={dica.pergunta} dica={dica.dica} cuidado={dica.cuidado} />
      )}

      {/* ═══ VALIDAÇÃO FEEDBACK ═══ */}
      <FeedbackBanner
        validacoes={validacoes}
        mensagemVazia="Preencha os campos para ver a validação A3."
      />

      {/* ═══ PROJECT CARD ═══ */}
      <div style={projectCardStyle}>
        <div style={projectCardHeader}>
          <h2 style={projectTitleStyle}>{projeto.titulo}</h2>
          <div style={projectMetaRow}>
            <span style={metaChipStyle}>📋 {FASE_LABELS[projeto.faseAtual]}</span>
            <span style={metaChipStyle}>⏱ {status.diasRestantes}d restantes</span>
            <span
              style={{
                ...metaChipStyle,
                background:
                  status.risco === 'CRITICO'
                    ? 'rgba(229,57,53,0.1)'
                    : status.risco === 'ALTO'
                      ? 'rgba(237,177,17,0.1)'
                      : 'rgba(105,190,40,0.1)',
                color:
                  status.risco === 'CRITICO'
                    ? '#c62828'
                    : status.risco === 'ALTO'
                      ? '#8a6d00'
                      : '#2d7a0a',
              }}
            >
              {status.risco}
            </span>
          </div>
        </div>

        {/* Barra de progresso fina */}
        <div style={progressBarBg}>
          <div
            style={{
              ...progressBarFill,
              width: `${Math.round(((projeto.faseAtual - 1) / TOTAL_FASES) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* ═══ CADERNO VIEW (EXISTENTE — INTOCADO) ═══ */}
      <div style={cadernoWrapperStyle}>
        <CadernoView status={status} />
      </div>

      {/* ═══ BARRA DE AÇÃO INFERIOR ═══ */}
      <div style={actionBarStyle}>
        {projeto.faseAtual > 1 && <button style={btnSecondaryStyle}>← Passo anterior</button>}
        <div style={{ flex: 1 }} />
        <button
          onClick={handleTentarAvancar}
          disabled={temBloqueios}
          style={{
            ...btnPrimaryStyle,
            opacity: temBloqueios ? 0.5 : 1,
            cursor: temBloqueios ? 'not-allowed' : 'pointer',
          }}
        >
          Avançar para Passo {Math.min(projeto.faseAtual + 1, TOTAL_FASES)} →
        </button>
      </div>

      {/* ═══ BLOQUEIO MODAL ═══ */}
      {showBloqueio && (
        <BloqueioAvanco mensagem={showBloqueio} onDismiss={() => setShowBloqueio(null)} />
      )}
    </div>
  );
}

// ════════════════════════════════════
// STYLES — Corporativo Industrial Vale/SAP
// ════════════════════════════════════

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
  minHeight: '100%',
};

const systemHeaderStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  borderRadius: '12px 12px 0 0',
  padding: '12px 16px',
  marginBottom: '0',
};

const systemHeaderRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const systemTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const systemIconStyle: React.CSSProperties = {
  fontSize: '20px',
  color: 'var(--accent-green)',
  fontWeight: 700,
};

const systemNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 800,
  letterSpacing: '0.1em',
  color: '#fff',
  textTransform: 'uppercase',
  fontFamily: 'var(--font-mono, monospace)',
};

const systemSubStyle: React.CSSProperties = {
  fontSize: '10px',
  color: 'var(--text-muted, #9ca3af)',
  letterSpacing: '0.04em',
};

const projectIdStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--text-muted, #6b7280)',
  fontFamily: 'var(--font-mono, monospace)',
  letterSpacing: '0.08em',
  background: 'rgba(255,255,255,0.06)',
  padding: '4px 8px',
  borderRadius: '4px',
};

const projectCardStyle: React.CSSProperties = {
  background: 'var(--surface-0, #fff)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '16px',
  marginBottom: '12px',
};

const projectCardHeader: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const projectTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  margin: 0,
  color: 'var(--text-primary)',
  lineHeight: 1.3,
};

const projectMetaRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
};

const metaChipStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  padding: '3px 8px',
  borderRadius: '6px',
  background: 'var(--surface-1, #f3f4f6)',
  color: 'var(--text-secondary, #555)',
  whiteSpace: 'nowrap',
};

const progressBarBg: React.CSSProperties = {
  width: '100%',
  height: '4px',
  background: 'var(--surface-2, #e5e7eb)',
  borderRadius: '2px',
  marginTop: '12px',
  overflow: 'hidden',
};

const progressBarFill: React.CSSProperties = {
  height: '100%',
  background: 'var(--btn-primary-bg)',
  borderRadius: '2px',
  transition: 'width 0.5s ease',
};

const cadernoWrapperStyle: React.CSSProperties = {
  // O CadernoView já tem seus próprios estilos
  // Só adicionamos o container
};

const actionBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 0',
  borderTop: '1px solid var(--border)',
  marginTop: '12px',
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '8px',
  background: 'var(--btn-primary-bg)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const btnSecondaryStyle: React.CSSProperties = {
  padding: '10px 16px',
  border: '1px solid var(--border-color, #ddd)',
  borderRadius: '8px',
  background: 'transparent',
  color: 'var(--text-secondary)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
};
