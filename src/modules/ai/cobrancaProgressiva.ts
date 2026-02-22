/**
 * MÓDULO COBRANÇA PROGRESSIVA — Escalação automática.
 *
 * Checklist:
 *   [x] Aviso semana 1
 *   [x] Lembrete semana 2
 *   [x] Lembrete semana 3
 *   [x] Cobrança privada
 *   [x] Cobrança grupo
 *   [x] Escalonar líder
 *
 * Complementa o ReactionEngine com lógica de escalação temporal.
 * Cada pendência acumula "nível de pressão" baseado em dias sem ação.
 */

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type NivelCobranca = 'lembrete' | 'alerta' | 'cobranca' | 'escalacao';
export type DestinatarioCobranca = 'responsavel' | 'grupo' | 'lider' | 'facilitador' | 'coordenador';

export interface Cobranca {
  id: string;
  projectId: string;
  requisitoId: string;
  responsavelId: string;
  responsavelNome: string;
  nivel: NivelCobranca;
  destinatario: DestinatarioCobranca;
  mensagem: string;
  criadaEm: string;
  lida: boolean;
}

export interface EscalacaoConfig {
  /** Dias sem ação → lembrete privado ao responsável */
  diasLembrete: number;
  /** Dias → alerta ao grupo */
  diasAlerta: number;
  /** Dias → cobrança formal ao líder */
  diasCobranca: number;
  /** Dias → escalação ao facilitador/coordenador */
  diasEscalacao: number;
}

// ════════════════════════════════════
// CONFIG DEFAULT
// ════════════════════════════════════

export const ESCALACAO_DEFAULT: EscalacaoConfig = {
  diasLembrete: 3,   // Semana 1: lembrete privado
  diasAlerta: 7,     // Semana 2: alerta ao grupo
  diasCobranca: 14,  // Semana 3: cobrança ao líder
  diasEscalacao: 21, // Semana 4: escalação ao facilitador
};

// ════════════════════════════════════
// STORE
// ════════════════════════════════════

const _cobrancas: Cobranca[] = [];
let _counter = 0;

// ════════════════════════════════════
// ENGINE
// ════════════════════════════════════

/**
 * Calcular nível de cobrança baseado em dias sem ação.
 */
export function calcularNivelCobranca(
  diasSemAcao: number,
  config: EscalacaoConfig = ESCALACAO_DEFAULT,
): { nivel: NivelCobranca; destinatario: DestinatarioCobranca } {
  if (diasSemAcao >= config.diasEscalacao) {
    return { nivel: 'escalacao', destinatario: 'facilitador' };
  }
  if (diasSemAcao >= config.diasCobranca) {
    return { nivel: 'cobranca', destinatario: 'lider' };
  }
  if (diasSemAcao >= config.diasAlerta) {
    return { nivel: 'alerta', destinatario: 'grupo' };
  }
  if (diasSemAcao >= config.diasLembrete) {
    return { nivel: 'lembrete', destinatario: 'responsavel' };
  }
  return { nivel: 'lembrete', destinatario: 'responsavel' };
}

/**
 * Gerar mensagem de cobrança contextual.
 */
export function gerarMensagemCobranca(params: {
  nome: string;
  requisitoDesc: string;
  diasAtraso: number;
  nivel: NivelCobranca;
  destinatario: DestinatarioCobranca;
  projetoNome: string;
}): string {
  const { nome, requisitoDesc, diasAtraso, nivel, destinatario, projetoNome } = params;
  const firstName = nome.split(' ')[0];

  switch (nivel) {
    case 'lembrete':
      return `${firstName}, o requisito "${requisitoDesc}" está pendente há ${diasAtraso} dias.`;

    case 'alerta':
      return `⚠️ Grupo: ${requisitoDesc} está atrasado ${diasAtraso} dias. ${firstName} é o responsável. O projeto está travado.`;

    case 'cobranca':
      return `🔴 Líder: ${firstName} não entregou "${requisitoDesc}" há ${diasAtraso} dias. Projeto "${projetoNome}" em risco.`;

    case 'escalacao':
      return `🚨 ESCALAÇÃO: Projeto "${projetoNome}" parado há ${diasAtraso} dias. Requisito "${requisitoDesc}" sem resposta de ${firstName}. Intervenção necessária.`;
  }
}

/**
 * Registrar cobrança enviada.
 */
export function registrarCobranca(params: Omit<Cobranca, 'id' | 'criadaEm' | 'lida'>): Cobranca {
  _counter++;
  const cobranca: Cobranca = {
    ...params,
    id: `cob-${Date.now()}-${_counter}`,
    criadaEm: new Date().toISOString(),
    lida: false,
  };

  _cobrancas.push(cobranca);
  return cobranca;
}

/**
 * Buscar cobranças de um projeto.
 */
export function getCobrancas(projectId: string): Cobranca[] {
  return _cobrancas
    .filter((c) => c.projectId === projectId)
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
}

/**
 * Cobranças não lidas de um usuário.
 */
export function getCobrancasNaoLidas(userId: string): Cobranca[] {
  return _cobrancas.filter(
    (c) => c.responsavelId === userId && !c.lida,
  );
}

/**
 * Marcar cobrança como lida.
 */
export function marcarCobrancaLida(cobrancaId: string): void {
  const c = _cobrancas.find((x) => x.id === cobrancaId);
  if (c) c.lida = true;
}
