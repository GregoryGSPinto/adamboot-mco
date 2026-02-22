/**
 * MÓDULO CHAT QUICK ACTIONS — Ações rápidas no chat.
 *
 * Checklist:
 *   [x] Botões rápidos (2)
 *   [x] Criar ação pelo chat (5)
 *   [x] Perguntas ligadas ao banco (2)
 *   [x] Gerar tarefa automática (5)
 *
 * Botões contextuais que aparecem acima do input baseados na fase atual.
 * Cada botão dispara uma ação que modifica o estado do projeto.
 */

import { FASE_LABELS } from '@shared/engine';

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type QuickActionType =
  | 'registrar_decisao'
  | 'criar_acao'
  | 'anexar_evidencia'
  | 'iniciar_reuniao'
  | 'cobrar_membro'
  | 'registrar_impedimento'
  | 'consultar_checklist'
  | 'ver_pendencias'
  | 'registrar_resultado'
  | 'comparar_antes_depois'
  | 'registrar_licao'
  | 'criar_procedimento';

export interface QuickAction {
  type: QuickActionType;
  label: string;
  icon: string;
  /** Mensagem de texto que vai pro chat quando clica */
  templateMensagem: string;
  /** Fases onde este botão aparece (vazio = todas) */
  fasesVisiveis: number[];
  /** Perfis que podem usar */
  perfis: string[];
}

// ════════════════════════════════════
// AÇÕES DISPONÍVEIS
// ════════════════════════════════════

export const QUICK_ACTIONS: QuickAction[] = [
  {
    type: 'registrar_decisao',
    label: 'Decisão',
    icon: '✔',
    templateMensagem: '📌 DECISÃO: ',
    fasesVisiveis: [],
    perfis: ['lider', 'facilitador'],
  },
  {
    type: 'criar_acao',
    label: 'Nova ação',
    icon: '➕',
    templateMensagem: '🎯 AÇÃO: [descrição] → Responsável: [nome] | Prazo: [data]',
    fasesVisiveis: [5, 6],
    perfis: ['lider', 'facilitador'],
  },
  {
    type: 'anexar_evidencia',
    label: 'Evidência',
    icon: '📷',
    templateMensagem: '',
    fasesVisiveis: [],
    perfis: ['membro', 'lider', 'facilitador'],
  },
  {
    type: 'iniciar_reuniao',
    label: 'Reunião',
    icon: '👥',
    templateMensagem: '👥 REUNIÃO INICIADA',
    fasesVisiveis: [],
    perfis: ['lider'],
  },
  {
    type: 'cobrar_membro',
    label: 'Cobrar',
    icon: '🔔',
    templateMensagem: '🔔 ',
    fasesVisiveis: [],
    perfis: ['lider', 'facilitador'],
  },
  {
    type: 'registrar_impedimento',
    label: 'Impedimento',
    icon: '🚧',
    templateMensagem: '🚧 IMPEDIMENTO: ',
    fasesVisiveis: [],
    perfis: ['membro', 'lider'],
  },
  {
    type: 'consultar_checklist',
    label: 'Checklist',
    icon: '📋',
    templateMensagem: '',
    fasesVisiveis: [],
    perfis: ['lider', 'membro', 'facilitador'],
  },
  {
    type: 'ver_pendencias',
    label: 'Pendências',
    icon: '⚠',
    templateMensagem: '',
    fasesVisiveis: [],
    perfis: ['lider'],
  },
  {
    type: 'registrar_resultado',
    label: 'Resultado',
    icon: '📊',
    templateMensagem: '📊 RESULTADO: Antes: [valor] → Depois: [valor]',
    fasesVisiveis: [7],
    perfis: ['lider', 'membro'],
  },
  {
    type: 'comparar_antes_depois',
    label: 'Antes/Depois',
    icon: '⚖',
    templateMensagem: '⚖ COMPARAÇÃO:\nAntes: \nDepois: \nGanho: ',
    fasesVisiveis: [7],
    perfis: ['lider'],
  },
  {
    type: 'registrar_licao',
    label: 'Lição',
    icon: '💡',
    templateMensagem: '💡 LIÇÃO APRENDIDA: ',
    fasesVisiveis: [7, 8],
    perfis: ['lider', 'facilitador'],
  },
  {
    type: 'criar_procedimento',
    label: 'Procedimento',
    icon: '📄',
    templateMensagem: '📄 NOVO PROCEDIMENTO: ',
    fasesVisiveis: [8],
    perfis: ['lider'],
  },
];

// ════════════════════════════════════
// ENGINE
// ════════════════════════════════════

/**
 * Retorna botões rápidos visíveis para o contexto atual.
 */
export function getQuickActions(params: {
  faseAtual: number;
  perfil: string;
  reuniaoAtiva: boolean;
}): QuickAction[] {
  return QUICK_ACTIONS.filter((action) => {
    // Filtrar por fase
    if (action.fasesVisiveis.length > 0 && !action.fasesVisiveis.includes(params.faseAtual)) {
      return false;
    }

    // Filtrar por perfil
    if (!action.perfis.includes(params.perfil)) {
      return false;
    }

    // Reunião: esconder "iniciar reunião" se já ativa
    if (action.type === 'iniciar_reuniao' && params.reuniaoAtiva) {
      return false;
    }

    return true;
  });
}

/**
 * Gerar resposta automática para consulta ao banco.
 * "Perguntas ligadas ao banco" do checklist.
 */
export function gerarRespostaBanco(params: {
  pergunta: string;
  faseAtual: number;
  pendencias: number;
  diasRestantes: number;
  acoesConcluidas: number;
  acoesTotal: number;
}): string {
  const q = params.pergunta.toLowerCase();

  if (q.includes('checklist') || q.includes('requisito') || q.includes('falta')) {
    return `📋 Fase ${params.faseAtual} — ${FASE_LABELS[params.faseAtual]}. ${params.pendencias} requisitos pendentes.`;
  }

  if (q.includes('prazo') || q.includes('dia') || q.includes('tempo')) {
    return `⏰ ${params.diasRestantes} dias restantes até a apresentação.`;
  }

  if (q.includes('ação') || q.includes('acao') || q.includes('tarefa')) {
    return `🎯 ${params.acoesConcluidas}/${params.acoesTotal} ações concluídas.`;
  }

  if (q.includes('quem') || q.includes('pendência') || q.includes('pendencia')) {
    return `⚠ ${params.pendencias} pendências na fase atual.`;
  }

  return `ℹ Fase ${params.faseAtual}: ${FASE_LABELS[params.faseAtual]} · ${params.pendencias} pendências · ${params.diasRestantes} dias restantes.`;
}

/**
 * Parser simples para extrair ação do texto do chat.
 * Detecta padrão: "🎯 AÇÃO: [desc] → Responsável: [nome] | Prazo: [data]"
 */
export function parseAcaoDoChat(texto: string): {
  descricao: string;
  responsavel: string;
  prazo: string;
} | null {
  const match = texto.match(/🎯\s*AÇÃO:\s*(.+?)→\s*Responsável:\s*(.+?)\|\s*Prazo:\s*(.+)/i);
  if (!match) return null;

  return {
    descricao: match[1].trim(),
    responsavel: match[2].trim(),
    prazo: match[3].trim(),
  };
}
