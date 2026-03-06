/**
 * VALIDADOR A3 — Lógica de validação inteligente do A3/MASP.
 *
 * Baseado no template A3 real da ArtTrem/Vale:
 *   1º Passo: Clarificar Problema
 *   2º Passo: Desdobrar Problema
 *   3º Passo: Definir Meta (SMART)
 *   4º Passo: Causa Raiz (5 Porquês + Ishikawa)
 *   5º+6º: Contramedidas + Plano de Ação
 *   7º Passo: Verificar Resultado
 *   8º Passo: Padronizar e Replicar
 *
 * REGRA CENTRAL: O sistema não é preenchimento de formulário.
 * É um orientador obrigatório de raciocínio de melhoria contínua.
 *
 * Três níveis de feedback:
 *   AVISO   → amarelo, não bloqueia, sugere melhoria
 *   BLOQUEIO → vermelho, impede avanço
 *   OK       → verde, aprovado
 */

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type SeveridadeValidacao = 'ok' | 'aviso' | 'bloqueio';

export interface ResultadoValidacao {
  campo: string;
  severidade: SeveridadeValidacao;
  mensagem: string;
  dicaCorrecao?: string;
}

// ════════════════════════════════════
// 1. VALIDAÇÃO DE PROBLEMA (Passo 1)
// ════════════════════════════════════

/**
 * Bloquear se problema não contém número ou indicador.
 * "há risco operacional" → BLOQUEIO
 * "25% dos eventos ocorrem ao assumir locomotiva" → OK
 */
export function validarProblema(texto: string): ResultadoValidacao {
  if (!texto || texto.trim().length < 10) {
    return {
      campo: 'problema',
      severidade: 'bloqueio',
      mensagem: 'O problema precisa ser descrito.',
      dicaCorrecao: 'Diga O QUE acontece, ONDE, COM QUE FREQUÊNCIA.',
    };
  }

  // Verificar se contém número/indicador
  const temNumero = /\d+/.test(texto);
  const temIndicador = /(vezes|%|porcento|eventos|ocorrências|horas|minutos|dias|reais|r\$|km|ton|unidades)/i.test(texto);
  const temMensuracao = temNumero || temIndicador;

  if (!temMensuracao) {
    return {
      campo: 'problema',
      severidade: 'bloqueio',
      mensagem: 'Seu problema ainda não é mensurável.',
      dicaCorrecao: 'Inclua um número. Exemplo: "25% dos eventos ocorrem ao assumir locomotiva" ou "4 paradas não-programadas no mês".',
    };
  }

  // Aviso se parece conter causa no lugar de problema
  const contemCausa = /(porque|devido a|por causa|por falta|pela ausência|o motivo)/i.test(texto);
  if (contemCausa) {
    return {
      campo: 'problema',
      severidade: 'aviso',
      mensagem: 'Parece que há uma CAUSA misturada com o problema.',
      dicaCorrecao: 'Descreva apenas O QUE acontece, não POR QUE. A causa vem no Passo 4.',
    };
  }

  // Aviso se muito genérico
  const generico = /(risco|perigo|problema|situação|questão|dificuldade)\s*(operacional|geral|grave|crítico|sério)/i.test(texto);
  if (generico && !temNumero) {
    return {
      campo: 'problema',
      severidade: 'aviso',
      mensagem: 'Descrição vaga. Problema precisa ser específico.',
      dicaCorrecao: 'Especifique: qual equipamento? qual operação? qual frequência?',
    };
  }

  return { campo: 'problema', severidade: 'ok', mensagem: 'Problema mensurável.' };
}

// ════════════════════════════════════
// 2. VALIDAÇÃO DE META (Passo 3)
// ════════════════════════════════════

/**
 * Validar se meta é SMART:
 *   S - Específica
 *   M - Mensurável (tem número)
 *   A - Atingível
 *   R - Relevante
 *   T - Temporal (tem prazo)
 */
export function validarMeta(texto: string): ResultadoValidacao {
  if (!texto || texto.trim().length < 10) {
    return {
      campo: 'meta',
      severidade: 'bloqueio',
      mensagem: 'Meta precisa ser definida.',
      dicaCorrecao: 'Formato: "Reduzir [indicador] de [X] para [Y] até [data]".',
    };
  }

  const problemas: string[] = [];

  // M - Mensurável
  const temNumero = /\d+/.test(texto);
  if (!temNumero) {
    problemas.push('Sem valor numérico');
  }

  // T - Temporal
  const temPrazo = /(até|antes de|data|prazo|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|\d{2}\/\d{2}|\d{4}|semana|mês|trimestre)/i.test(texto);
  if (!temPrazo) {
    problemas.push('Sem prazo definido');
  }

  // S - Específica (tem indicador)
  const temIndicador = /(reduzir|aumentar|eliminar|atingir|alcançar|manter|zero|100%|%)/i.test(texto);
  if (!temIndicador) {
    problemas.push('Sem verbo de ação (reduzir, eliminar, atingir)');
  }

  if (problemas.length >= 2) {
    return {
      campo: 'meta',
      severidade: 'bloqueio',
      mensagem: `Meta não é SMART: ${problemas.join(', ')}.`,
      dicaCorrecao: 'Formato SMART: "Reduzir [indicador] de [X] para [Y] até [data]". Exemplo: "Reduzir erros de 10 para 0 até 28/01/2026".',
    };
  }

  if (problemas.length === 1) {
    return {
      campo: 'meta',
      severidade: 'aviso',
      mensagem: `Meta quase SMART: ${problemas[0]}.`,
      dicaCorrecao: 'Inclua: valor + indicador + prazo.',
    };
  }

  return { campo: 'meta', severidade: 'ok', mensagem: 'Meta SMART.' };
}

// ════════════════════════════════════
// 3. VALIDAÇÃO DE CAUSA RAIZ (Passo 4)
// ════════════════════════════════════

/**
 * Bloquear se causa termina em erro humano genérico.
 * Sistema deve exigir causa SISTÊMICA.
 */
const CAUSAS_PROIBIDAS = [
  'falta de atenção',
  'erro humano',
  'falha operacional',
  'erro do colaborador',
  'descuido',
  'negligência',
  'falta de cuidado',
  'desatenção',
  'imprudência',
  'irresponsabilidade',
  'falta de comprometimento',
  'não seguiu procedimento',
  'falha do operador',
  'erro do operador',
  'falta de treinamento', // sem especificar qual treinamento
];

export function validarCausaRaiz(texto: string): ResultadoValidacao {
  if (!texto || texto.trim().length < 10) {
    return {
      campo: 'causa_raiz',
      severidade: 'bloqueio',
      mensagem: 'Causa raiz precisa ser identificada.',
      dicaCorrecao: 'Use 5 Porquês: por que aconteceu? E por que isso? Continue até chegar na causa que o sistema pode resolver.',
    };
  }

  const t = texto.toLowerCase();

  // Verificar causas proibidas (erro humano genérico)
  for (const proibida of CAUSAS_PROIBIDAS) {
    if (t.includes(proibida)) {
      return {
        campo: 'causa_raiz',
        severidade: 'bloqueio',
        mensagem: `Você está atacando SINTOMA, não CAUSA. "${proibida}" não é causa raiz.`,
        dicaCorrecao: `Pergunte: "Por que ${proibida}?" até encontrar algo que o SISTEMA pode resolver. Exemplo: "O texto na tela é pequeno demais para leitura rápida" em vez de "falta de atenção".`,
      };
    }
  }

  // Aviso se causa parece ser comportamental
  const comportamental = /(pessoa|colaborador|empregado|operador|maquinista)\s*(não|nao)\s*(fez|seguiu|executou|realizou|faz)/i.test(texto);
  if (comportamental) {
    return {
      campo: 'causa_raiz',
      severidade: 'aviso',
      mensagem: 'Causa parece comportamental. Procure a causa SISTÊMICA por trás.',
      dicaCorrecao: 'Por que a pessoa não fez? O procedimento existe? É claro? O sistema permite o erro?',
    };
  }

  return { campo: 'causa_raiz', severidade: 'ok', mensagem: 'Causa sistêmica identificada.' };
}

// ════════════════════════════════════
// 4. VALIDAÇÃO DE CONTRAMEDIDA (Passo 5+6)
// ════════════════════════════════════

/**
 * Contramedida precisa ter vínculo com causa raiz.
 * Ação genérica (retreinar, conscientizar) → AVISO.
 */
const ACOES_FRACAS = [
  'retreinar',
  'retreinamento',
  'conscientizar',
  'conscientização',
  'orientar',
  'alertar',
  'reforçar',
  'relembrar',
  'cobrar mais',
  'ficar atento',
  'chamar atenção',
  'DDS',
];

export function validarContramedida(
  contramedida: string,
  _causaRaiz?: string,
): ResultadoValidacao {
  if (!contramedida || contramedida.trim().length < 10) {
    return {
      campo: 'contramedida',
      severidade: 'bloqueio',
      mensagem: 'Contramedida precisa ser descrita.',
      dicaCorrecao: 'A ação deve eliminar diretamente a causa raiz identificada.',
    };
  }

  const t = contramedida.toLowerCase();

  // Ações fracas
  for (const fraca of ACOES_FRACAS) {
    if (t.includes(fraca)) {
      return {
        campo: 'contramedida',
        severidade: 'aviso',
        mensagem: `"${fraca}" é uma ação fraca. Pode não resolver a causa raiz.`,
        dicaCorrecao: 'Prefira ações que mudam o SISTEMA: poka-yoke, redesenho de processo, automação, sinalização visual, barreira física.',
      };
    }
  }

  return { campo: 'contramedida', severidade: 'ok', mensagem: 'Contramedida vinculada.' };
}

// ════════════════════════════════════
// 5. VALIDAÇÃO DE RESULTADO (Passo 7)
// ════════════════════════════════════

/**
 * Resultado precisa ter comparação antes/depois.
 */
export function validarResultado(params: {
  temComparacao: boolean;
  temEvidencia: boolean;
  metaAtingida?: boolean;
}): ResultadoValidacao {
  if (!params.temComparacao) {
    return {
      campo: 'resultado',
      severidade: 'bloqueio',
      mensagem: 'Resultado sem comparação antes/depois.',
      dicaCorrecao: 'Registre: indicador ANTES da contramedida vs. indicador DEPOIS.',
    };
  }

  if (!params.temEvidencia) {
    return {
      campo: 'resultado',
      severidade: 'aviso',
      mensagem: 'Resultado sem evidência fotográfica.',
      dicaCorrecao: 'Anexe foto ou documento que comprove o resultado.',
    };
  }

  if (params.metaAtingida === false) {
    return {
      campo: 'resultado',
      severidade: 'aviso',
      mensagem: 'Meta não foi atingida. Pode ser necessário voltar ao Passo 4.',
      dicaCorrecao: 'Se a meta não foi atingida, reavalie: a causa raiz estava correta? A contramedida foi implementada completamente?',
    };
  }

  return { campo: 'resultado', severidade: 'ok', mensagem: 'Resultado verificado.' };
}

// ════════════════════════════════════
// 6. VALIDAÇÃO COMPLETA DO A3
// ════════════════════════════════════

export interface A3DadosProjeto {
  problema?: string;
  objetivoFinal?: string;
  situacaoIdeal?: string;
  situacaoAtual?: string;
  desdobramento?: string;
  meta?: string;
  causaRaiz?: string;
  contramedidas?: string[];
  temResultado?: boolean;
  temComparacao?: boolean;
  temEvidencia?: boolean;
  metaAtingida?: boolean;
  padronizacao?: string;
  replicacao?: string;
}

/**
 * Validar todo o A3 de uma vez.
 * Retorna array de resultados — UI pode mostrar semáforo por passo.
 */
export function validarA3Completo(dados: A3DadosProjeto): ResultadoValidacao[] {
  const results: ResultadoValidacao[] = [];

  // Passo 1: Problema
  if (dados.problema) {
    results.push(validarProblema(dados.problema));
  }

  // Passo 3: Meta
  if (dados.meta) {
    results.push(validarMeta(dados.meta));
  }

  // Passo 4: Causa raiz
  if (dados.causaRaiz) {
    results.push(validarCausaRaiz(dados.causaRaiz));
  }

  // Passo 5+6: Contramedidas
  if (dados.contramedidas) {
    dados.contramedidas.forEach((cm, i) => {
      const r = validarContramedida(cm, dados.causaRaiz);
      results.push({ ...r, campo: `contramedida_${i + 1}` });
    });
  }

  // Passo 7: Resultado
  if (dados.temResultado) {
    results.push(validarResultado({
      temComparacao: dados.temComparacao ?? false,
      temEvidencia: dados.temEvidencia ?? false,
      metaAtingida: dados.metaAtingida,
    }));
  }

  return results;
}

/**
 * Verificar se passo pode ser acessado (anterior precisa estar válido).
 * Retorna { podeAcessar, motivoBloqueio? }
 */
export function podAcessarPasso(passo: number, dados: A3DadosProjeto): {
  podeAcessar: boolean;
  motivoBloqueio?: string;
} {
  // Passo 1 sempre acessível
  if (passo <= 1) return { podeAcessar: true };

  // Passo 2: precisa ter problema válido
  if (passo === 2) {
    const v = dados.problema ? validarProblema(dados.problema) : null;
    if (!v || v.severidade === 'bloqueio') {
      return { podeAcessar: false, motivoBloqueio: 'Passo 1 (Problema) precisa ser preenchido e mensurável.' };
    }
  }

  // Passo 3: precisa ter desdobramento
  if (passo === 3) {
    if (!dados.desdobramento || dados.desdobramento.trim().length < 10) {
      return { podeAcessar: false, motivoBloqueio: 'Passo 2 (Desdobramento) precisa ser preenchido.' };
    }
  }

  // Passo 4: precisa ter meta SMART
  if (passo === 4) {
    const v = dados.meta ? validarMeta(dados.meta) : null;
    if (!v || v.severidade === 'bloqueio') {
      return { podeAcessar: false, motivoBloqueio: 'Passo 3 (Meta) precisa ser SMART: valor + prazo + indicador.' };
    }
  }

  // Passo 5+6: precisa ter causa raiz sistêmica
  if (passo >= 5 && passo <= 6) {
    const v = dados.causaRaiz ? validarCausaRaiz(dados.causaRaiz) : null;
    if (!v || v.severidade === 'bloqueio') {
      return { podeAcessar: false, motivoBloqueio: 'Passo 4 (Causa Raiz) precisa ser sistêmica. Erro humano não é causa raiz.' };
    }
  }

  // Passo 7: precisa ter contramedidas
  if (passo === 7) {
    if (!dados.contramedidas || dados.contramedidas.length === 0) {
      return { podeAcessar: false, motivoBloqueio: 'Passo 5/6 (Contramedidas) precisa ter pelo menos 1 ação.' };
    }
  }

  // Passo 8: precisa ter resultado verificado
  if (passo === 8) {
    if (!dados.temResultado || !dados.temComparacao) {
      return { podeAcessar: false, motivoBloqueio: 'Passo 7 (Resultado) precisa ter comparação antes/depois.' };
    }
  }

  return { podeAcessar: true };
}
