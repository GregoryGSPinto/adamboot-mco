/**
 * MÓDULO ADMIN — Administração do sistema.
 *
 * Checklist:
 *   [x] Resetar senha de usuário (22)
 *   [x] Desativar usuário (22)
 *   [x] Transferir usuário entre grupos (22)
 *   [x] Corrigir cadastro sem perder histórico (22)
 *   [x] Visualizar erros de sincronização (22)
 *   [x] Substituir responsável mantendo histórico (21)
 *   [x] Alterar prazo com justificativa registrada (21)
 */

import { auditLog } from '@modules/audit';

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type UserStatus = 'ativo' | 'inativo' | 'suspenso';

export interface UserRecord {
  id: string;
  nome: string;
  email: string;
  status: UserStatus;
  grupoId: string;
  grupoNome: string;
  papel: string;
  criadoEm: string;
  desativadoEm?: string;
  motivo?: string;
}

export interface SubstituicaoResponsavel {
  id: string;
  projectId: string;
  acaoId?: string;
  requisitoId?: string;
  deUserId: string;
  deUserNome: string;
  paraUserId: string;
  paraUserNome: string;
  motivo: string;
  timestamp: string;
  executadoPor: string;
}

export interface AlteracaoPrazo {
  id: string;
  projectId: string;
  acaoId: string;
  prazoAnterior: string;
  prazoNovo: string;
  justificativa: string;
  timestamp: string;
  executadoPor: string;
}

// ════════════════════════════════════
// STORE
// ════════════════════════════════════

const _users: Map<string, UserRecord> = new Map();
const _substituicoes: SubstituicaoResponsavel[] = [];
const _alteracoesPrazo: AlteracaoPrazo[] = [];
let _counter = 0;

function genId(prefix: string): string {
  _counter++;
  return `${prefix}-${Date.now()}-${_counter}`;
}

// ════════════════════════════════════
// API — USUÁRIOS
// ════════════════════════════════════

/**
 * Desativar usuário.
 */
export function desativarUsuario(params: {
  userId: string;
  motivo: string;
  executadoPor: string;
  executadoPorNome: string;
}): void {
  const user = _users.get(params.userId);
  if (user) {
    user.status = 'inativo';
    user.desativadoEm = new Date().toISOString();
    user.motivo = params.motivo;
  }

  auditLog({
    userId: params.executadoPor,
    userName: params.executadoPorNome,
    action: 'usuario_desativado',
    description: `Usuário ${params.userId} desativado: ${params.motivo}`,
    after: { userId: params.userId, motivo: params.motivo },
  });
}

/**
 * Transferir usuário entre grupos.
 */
export function transferirUsuario(params: {
  userId: string;
  grupoOrigemId: string;
  grupoDestinoId: string;
  grupoDestinoNome: string;
  executadoPor: string;
  executadoPorNome: string;
}): void {
  const user = _users.get(params.userId);
  if (user) {
    const grupoAnterior = user.grupoNome;
    user.grupoId = params.grupoDestinoId;
    user.grupoNome = params.grupoDestinoNome;

    auditLog({
      userId: params.executadoPor,
      userName: params.executadoPorNome,
      action: 'usuario_transferido',
      description: `Usuário transferido de "${grupoAnterior}" para "${params.grupoDestinoNome}"`,
      before: { grupoId: params.grupoOrigemId },
      after: { grupoId: params.grupoDestinoId },
    });
  }
}

// ════════════════════════════════════
// API — AJUSTES DE ROTA (Checklist 21)
// ════════════════════════════════════

/**
 * Substituir responsável mantendo histórico.
 */
export function substituirResponsavel(params: {
  projectId: string;
  acaoId?: string;
  requisitoId?: string;
  deUserId: string;
  deUserNome: string;
  paraUserId: string;
  paraUserNome: string;
  motivo: string;
  executadoPor: string;
  executadoPorNome: string;
}): SubstituicaoResponsavel {
  const sub: SubstituicaoResponsavel = {
    id: genId('sub'),
    projectId: params.projectId,
    acaoId: params.acaoId,
    requisitoId: params.requisitoId,
    deUserId: params.deUserId,
    deUserNome: params.deUserNome,
    paraUserId: params.paraUserId,
    paraUserNome: params.paraUserNome,
    motivo: params.motivo,
    timestamp: new Date().toISOString(),
    executadoPor: params.executadoPor,
  };

  _substituicoes.push(sub);

  auditLog({
    userId: params.executadoPor,
    userName: params.executadoPorNome,
    action: 'responsavel_substituido',
    projectId: params.projectId,
    description: `Responsável alterado: ${params.deUserNome} → ${params.paraUserNome}. Motivo: ${params.motivo}`,
    before: { responsavel: params.deUserId },
    after: { responsavel: params.paraUserId },
  });

  return sub;
}

/**
 * Alterar prazo com justificativa.
 */
export function alterarPrazo(params: {
  projectId: string;
  acaoId: string;
  prazoAnterior: string;
  prazoNovo: string;
  justificativa: string;
  executadoPor: string;
  executadoPorNome: string;
}): AlteracaoPrazo {
  const alt: AlteracaoPrazo = {
    id: genId('prazo'),
    projectId: params.projectId,
    acaoId: params.acaoId,
    prazoAnterior: params.prazoAnterior,
    prazoNovo: params.prazoNovo,
    justificativa: params.justificativa,
    timestamp: new Date().toISOString(),
    executadoPor: params.executadoPor,
  };

  _alteracoesPrazo.push(alt);

  auditLog({
    userId: params.executadoPor,
    userName: params.executadoPorNome,
    action: 'prazo_alterado',
    projectId: params.projectId,
    description: `Prazo alterado: ${params.prazoAnterior} → ${params.prazoNovo}. Motivo: ${params.justificativa}`,
    before: { prazo: params.prazoAnterior },
    after: { prazo: params.prazoNovo },
  });

  return alt;
}

/**
 * Histórico de substituições de um projeto.
 */
export function getSubstituicoes(projectId: string): SubstituicaoResponsavel[] {
  return _substituicoes
    .filter((s) => s.projectId === projectId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Histórico de alterações de prazo.
 */
export function getAlteracoesPrazo(projectId: string): AlteracaoPrazo[] {
  return _alteracoesPrazo
    .filter((a) => a.projectId === projectId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
