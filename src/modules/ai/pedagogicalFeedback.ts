/**
 * FEEDBACK PEDAGÓGICO — Orientação inteligente por passo do A3.
 *
 * O sistema não é um formulário. É um orientador.
 * Cada passo tem mensagens contextuais baseadas no que o usuário está fazendo.
 *
 * Três níveis visuais:
 *   🟢 OK      — feedback positivo, progresso
 *   🟡 AVISO   — sugestão de melhoria, não bloqueia
 *   🔴 BLOQUEIO — impede avanço, exige correção
 */

import type { ResultadoValidacao } from './a3Validator';

// ════════════════════════════════════
// ORIENTAÇÕES POR PASSO
// ════════════════════════════════════

export interface OrientacaoPasso {
  passo: number;
  titulo: string;
  perguntaGuia: string;
  /** O que uma banca avaliadora procura */
  criterioAprovacao: string;
  /** Erros mais comuns que reprovam */
  errosComuns: string[];
  /** Exemplos de resposta boa vs ruim */
  exemploBom: string;
  exemploRuim: string;
}

export const ORIENTACOES_A3: OrientacaoPasso[] = [
  {
    passo: 1,
    titulo: 'Clarificar o Problema',
    perguntaGuia: 'O que está acontecendo e com que frequência?',
    criterioAprovacao: 'Problema factual com indicador numérico e escopo definido.',
    errosComuns: [
      'Descrever CAUSA em vez de PROBLEMA',
      'Sem número (apenas adjetivos: grave, crítico)',
      'Escopo vago (sem local, sem período)',
    ],
    exemploBom:
      '90% dos eventos com maquinista de viagem acontecem ao assumir e vistoriar a locomotiva.',
    exemploRuim: 'Há risco operacional na via permanente.',
  },
  {
    passo: 2,
    titulo: 'Desdobrar o Problema',
    perguntaGuia: 'Onde exatamente o problema mais se concentra?',
    criterioAprovacao: 'Problema priorizado com dados: onde, quando, quem, quanto.',
    errosComuns: [
      'Pular direto para causa sem desdobrar',
      'Não usar Pareto para priorizar',
      'Tratar todo problema como igual',
    ],
    exemploBom: 'Dos 10 erros: 7 são em pedidos especiais (molho) e 3 em pedidos rotineiros.',
    exemploRuim: 'Vários problemas acontecem na operação.',
  },
  {
    passo: 3,
    titulo: 'Definir Meta',
    perguntaGuia: 'Quanto quer melhorar e até quando?',
    criterioAprovacao: 'Meta SMART: Específica, Mensurável, com prazo.',
    errosComuns: [
      'Meta sem número: "melhorar o processo"',
      'Meta sem prazo: "reduzir erros"',
      'Meta impossível: "zero acidentes para sempre"',
    ],
    exemploBom: 'Reduzir erros de entrega de 10 para 0 até 28/01/2026.',
    exemploRuim: 'Melhorar a qualidade do serviço.',
  },
  {
    passo: 4,
    titulo: 'Analisar Causa Raiz',
    perguntaGuia: 'Por que o problema acontece? (5x Por quê?)',
    criterioAprovacao:
      'Causa sistêmica identificada via 5 Porquês ou Ishikawa. NÃO pode ser erro humano.',
    errosComuns: [
      'Parar no primeiro "por quê"',
      'Culpar pessoa: "falta de atenção"',
      'Não validar a causa com dados',
    ],
    exemploBom: 'O texto "molho balsâmico" não é destacado na tela da TV como pedido especial.',
    exemploRuim: 'O empregado não presta atenção.',
  },
  {
    passo: 5,
    titulo: 'Contramedidas',
    perguntaGuia: 'Que mudança no sistema elimina a causa raiz?',
    criterioAprovacao: 'Ação sistêmica que ataca a causa raiz diretamente. Avaliada por S/Q/L/C.',
    errosComuns: [
      'Retreinar (não resolve causa sistêmica)',
      'Conscientizar (não muda o sistema)',
      'Ação não vinculada à causa raiz',
    ],
    exemploBom: 'Colocar texto "molho balsâmico" em destaque piscando na tela.',
    exemploRuim: 'Retreinar empregados no processo de seleção.',
  },
  {
    passo: 6,
    titulo: 'Plano de Ação',
    perguntaGuia: 'Quem faz o quê até quando?',
    criterioAprovacao: 'Cada ação com responsável, prazo e status.',
    errosComuns: [
      'Ação sem responsável definido',
      'Ação sem prazo',
      'Responsável genérico: "equipe"',
    ],
    exemploBom: 'Solicitar alteração do software — Fulano (Sistemas) — até 15/02 — Realizado.',
    exemploRuim: 'A equipe vai resolver o problema.',
  },
  {
    passo: 7,
    titulo: 'Verificar Resultado',
    perguntaGuia: 'O processo melhorou? A meta foi atingida?',
    criterioAprovacao: 'Comparação antes/depois com dados. Evidência fotográfica.',
    errosComuns: ['Sem dados de comparação', 'Sem evidência visual', 'Declarar sucesso sem medir'],
    exemploBom: 'Antes: 10 erros/mês. Depois: 0 erros em 30 visitas. Meta atingida ✅',
    exemploRuim: 'O processo melhorou bastante.',
  },
  {
    passo: 8,
    titulo: 'Padronizar e Replicar',
    perguntaGuia: 'O novo padrão foi documentado? Onde pode ser replicado?',
    criterioAprovacao: 'Procedimento atualizado + plano de replicação em outras áreas.',
    errosComuns: [
      'Não documentar o novo padrão',
      'Não pensar em replicação',
      'Encerrar sem garantir sustentabilidade',
    ],
    exemploBom: 'STW modificado. Replicar sistema e STW em todas as lojas.',
    exemploRuim: 'Problema resolvido, projeto encerrado.',
  },
];

// ════════════════════════════════════
// MENSAGENS CONTEXTUAIS
// ════════════════════════════════════

/**
 * Gerar mensagem de coaching baseada no passo atual e validações.
 */
export function gerarFeedbackPedagogico(passo: number, validacoes: ResultadoValidacao[]): string[] {
  const orientacao = ORIENTACOES_A3.find(o => o.passo === passo);
  if (!orientacao) return [];

  const mensagens: string[] = [];

  // Bloqueios primeiro
  const bloqueios = validacoes.filter(v => v.severidade === 'bloqueio');
  bloqueios.forEach(b => {
    mensagens.push(`🔴 ${b.mensagem}`);
    if (b.dicaCorrecao) mensagens.push(`   💡 ${b.dicaCorrecao}`);
  });

  // Avisos
  const avisos = validacoes.filter(v => v.severidade === 'aviso');
  avisos.forEach(a => {
    mensagens.push(`🟡 ${a.mensagem}`);
    if (a.dicaCorrecao) mensagens.push(`   💡 ${a.dicaCorrecao}`);
  });

  // Se tudo ok, mensagem positiva
  const todosOk = validacoes.every(v => v.severidade === 'ok');
  if (todosOk && validacoes.length > 0) {
    mensagens.push(`🟢 Passo ${passo} validado. Pode avançar.`);
  }

  return mensagens;
}

/**
 * Gerar dica proativa quando o usuário abre um passo.
 * Mostra no topo da tela antes do formulário.
 */
export function gerarDicaPasso(passo: number): {
  pergunta: string;
  dica: string;
  cuidado: string;
} {
  const o = ORIENTACOES_A3.find(x => x.passo === passo);
  if (!o) return { pergunta: '', dica: '', cuidado: '' };

  return {
    pergunta: o.perguntaGuia,
    dica: `✅ Bom exemplo: "${o.exemploBom}"`,
    cuidado: `⚠ Evite: "${o.exemploRuim}"`,
  };
}

/**
 * Gerar mensagem quando o usuário tenta avançar mas não pode.
 */
export function mensagemBloqueioAvanco(passo: number): string {
  const o = ORIENTACOES_A3.find(x => x.passo === passo);
  if (!o) return 'Complete o passo atual antes de avançar.';

  const erros = o.errosComuns;
  const random = erros[Math.floor(Math.random() * erros.length)];

  return `Não é possível avançar. Critério: ${o.criterioAprovacao}. Erro comum: ${random}.`;
}

/**
 * Feedback ao salvar texto em um campo do A3.
 * Retorna resposta imediata ao keystroke/save.
 */
export function feedbackInstantaneo(
  campo: 'problema' | 'meta' | 'causa_raiz' | 'contramedida',
  texto: string
): { cor: string; icone: string; msg: string } | null {
  if (!texto || texto.length < 5) return null;

  // Feedback rápido sem validação completa
  const t = texto.toLowerCase();

  if (campo === 'problema') {
    if (!/\d/.test(texto)) {
      return { cor: 'var(--accent-yellow)', icone: '⚠', msg: 'Inclua um número' };
    }
    return { cor: 'var(--accent-green)', icone: '✓', msg: 'Mensurável' };
  }

  if (campo === 'meta') {
    const temNum = /\d/.test(texto);
    const temPrazo = /(até|antes|data|\d{2}\/)/i.test(texto);
    if (!temNum && !temPrazo)
      return { cor: 'var(--accent-yellow)', icone: '⚠', msg: 'Falta número e prazo' };
    if (!temNum) return { cor: 'var(--accent-yellow)', icone: '⚠', msg: 'Falta número' };
    if (!temPrazo) return { cor: 'var(--accent-yellow)', icone: '⚠', msg: 'Falta prazo' };
    return { cor: 'var(--accent-green)', icone: '✓', msg: 'SMART' };
  }

  if (campo === 'causa_raiz') {
    const proibidas = ['atenção', 'erro humano', 'descuido', 'negligência', 'falha operacional'];
    for (const p of proibidas) {
      if (t.includes(p)) return { cor: '#e53935', icone: '✕', msg: `"${p}" não é causa raiz` };
    }
    return { cor: 'var(--accent-green)', icone: '✓', msg: 'Sistêmica' };
  }

  if (campo === 'contramedida') {
    const fracas = ['retreinar', 'conscientizar', 'orientar', 'DDS'];
    for (const f of fracas) {
      if (t.includes(f))
        return { cor: 'var(--accent-yellow)', icone: '⚠', msg: `"${f}" é ação fraca` };
    }
    return null;
  }

  return null;
}
