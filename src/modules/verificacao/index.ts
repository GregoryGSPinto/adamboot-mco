/**
 * MÓDULO VERIFICAÇÃO — Comparação antes/depois.
 *
 * Checklist:
 *   [x] Registrar resultado (9)
 *   [x] Comparar antes/depois (9)
 *   [x] Evidência final (9)
 *   [x] Confirmar eliminação (9)
 */

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export interface Resultado {
  id: string;
  projectId: string;
  indicador: string;
  unidade: string;
  valorAntes: number;
  valorDepois: number;
  meta?: number;
  evidenciaAntes?: string; // URL/ref
  evidenciaDepois?: string;
  criadoPor: string;
  criadoEm: string;
}

export interface ComparacaoAntesDepois {
  indicador: string;
  antes: number;
  depois: number;
  meta?: number;
  variacao: number;     // percentual
  atingiuMeta: boolean;
  eliminouProblema: boolean;
}

export interface ConfirmacaoEliminacao {
  projectId: string;
  confirmadoPor: string;
  data: string;
  observacao: string;
  resultados: ComparacaoAntesDepois[];
  aprovado: boolean;
}

// ════════════════════════════════════
// STORE
// ════════════════════════════════════

const _resultados: Resultado[] = [];
const _confirmacoes: ConfirmacaoEliminacao[] = [];
let _counter = 0;

// ════════════════════════════════════
// API
// ════════════════════════════════════

export function registrarResultado(params: {
  projectId: string;
  indicador: string;
  unidade: string;
  valorAntes: number;
  valorDepois: number;
  meta?: number;
  evidenciaAntes?: string;
  evidenciaDepois?: string;
  userId: string;
}): Resultado {
  _counter++;
  const resultado: Resultado = {
    id: `res-${Date.now()}-${_counter}`,
    ...params,
    criadoPor: params.userId,
    criadoEm: new Date().toISOString(),
  };

  _resultados.push(resultado);
  return resultado;
}

export function getResultados(projectId: string): Resultado[] {
  return _resultados
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

/**
 * Calcular comparação antes/depois.
 */
export function compararAntesDepois(resultado: Resultado): ComparacaoAntesDepois {
  const { valorAntes, valorDepois, meta } = resultado;
  const variacao = valorAntes !== 0
    ? ((valorDepois - valorAntes) / Math.abs(valorAntes)) * 100
    : 0;

  const atingiuMeta = meta != null
    ? (variacao < 0 ? valorDepois <= meta : valorDepois >= meta) // se meta é redução, depois <= meta
    : false;

  return {
    indicador: resultado.indicador,
    antes: valorAntes,
    depois: valorDepois,
    meta,
    variacao: Math.round(variacao * 10) / 10,
    atingiuMeta,
    eliminouProblema: atingiuMeta && Math.abs(variacao) >= 50,
  };
}

/**
 * Confirmar eliminação do problema (gate da fase 7→8).
 */
export function confirmarEliminacao(params: {
  projectId: string;
  confirmadoPor: string;
  observacao: string;
}): ConfirmacaoEliminacao {
  const resultados = getResultados(params.projectId);
  const comparacoes = resultados.map(compararAntesDepois);
  const aprovado = comparacoes.length > 0 && comparacoes.every((c) => c.atingiuMeta);

  const confirmacao: ConfirmacaoEliminacao = {
    projectId: params.projectId,
    confirmadoPor: params.confirmadoPor,
    data: new Date().toISOString(),
    observacao: params.observacao,
    resultados: comparacoes,
    aprovado,
  };

  _confirmacoes.push(confirmacao);
  return confirmacao;
}

export function getConfirmacoes(projectId: string): ConfirmacaoEliminacao[] {
  return _confirmacoes.filter((c) => c.projectId === projectId);
}
