/**
 * MÓDULO IMPEDIMENTO — Registro e resolução de bloqueios operacionais.
 *
 * Checklist:
 *   [x] Registrar impedimento (6)
 *   [x] Recuperar tarefa interrompida (16)
 *   [x] Marcar tarefa como não aplicável (16)
 *   [x] Reabrir tarefa concluída com histórico (16)
 *
 * O membro registra por que não consegue concluir.
 * O sistema notifica líder e pode escalonar.
 */

import { auditLog } from '@modules/audit';
import { dispatchDomainEvent } from '@modules/core/domainEvents';

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type ImpedimentoStatus = 'aberto' | 'resolvido' | 'escalado';
export type ImpedimentoTipo =
  | 'falta_material'
  | 'falta_acesso'
  | 'falta_informacao'
  | 'problema_tecnico'
  | 'seguranca'
  | 'ausencia'
  | 'outro';

export const IMPEDIMENTO_LABELS: Record<ImpedimentoTipo, string> = {
  falta_material: 'Falta material/ferramenta',
  falta_acesso: 'Sem acesso ao local/sistema',
  falta_informacao: 'Falta informação/dado',
  problema_tecnico: 'Problema técnico',
  seguranca: 'Risco de segurança',
  ausencia: 'Responsável ausente',
  outro: 'Outro',
};

export interface Impedimento {
  id: string;
  projectId: string;
  requisitoId?: string;
  acaoId?: string;
  tipo: ImpedimentoTipo;
  descricao: string;
  reportadoPor: string;
  reportadoPorNome: string;
  status: ImpedimentoStatus;
  criadoEm: string;
  resolvidoEm?: string;
  resolvidoPor?: string;
  resolucao?: string;
}

// Status de tarefa expandido (para resiliência operacional)
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'impedida' | 'nao_aplicavel' | 'reaberta';

export interface TaskStatusChange {
  id: string;
  taskId: string;
  from: TaskStatus;
  to: TaskStatus;
  userId: string;
  userName: string;
  motivo?: string;
  timestamp: string;
}

// ════════════════════════════════════
// STORE
// ════════════════════════════════════

const _impedimentos: Map<string, Impedimento> = new Map();
const _taskHistory: TaskStatusChange[] = [];
let _counter = 0;

function genId(prefix: string): string {
  _counter++;
  return `${prefix}-${Date.now()}-${_counter}`;
}

// ════════════════════════════════════
// API — IMPEDIMENTOS
// ════════════════════════════════════

export function registrarImpedimento(params: {
  projectId: string;
  requisitoId?: string;
  acaoId?: string;
  tipo: ImpedimentoTipo;
  descricao: string;
  userId: string;
  userName: string;
}): Impedimento {
  const imp: Impedimento = {
    id: genId('imp'),
    projectId: params.projectId,
    requisitoId: params.requisitoId,
    acaoId: params.acaoId,
    tipo: params.tipo,
    descricao: params.descricao,
    reportadoPor: params.userId,
    reportadoPorNome: params.userName,
    status: 'aberto',
    criadoEm: new Date().toISOString(),
  };

  _impedimentos.set(imp.id, imp);

  auditLog({
    userId: params.userId,
    userName: params.userName,
    action: 'impedimento_registrado',
    projectId: params.projectId,
    description: `Impedimento: ${IMPEDIMENTO_LABELS[params.tipo]} — ${params.descricao}`,
  });

  dispatchDomainEvent({
    type: 'action_created', // reuse existing event type
    projectId: params.projectId,
    actorId: params.userId,
    payload: { impedimentoId: imp.id, tipo: params.tipo },
  });

  return imp;
}

export function resolverImpedimento(params: {
  impedimentoId: string;
  resolucao: string;
  userId: string;
  userName: string;
}): Impedimento | null {
  const imp = _impedimentos.get(params.impedimentoId);
  if (!imp) return null;

  imp.status = 'resolvido';
  imp.resolvidoEm = new Date().toISOString();
  imp.resolvidoPor = params.userId;
  imp.resolucao = params.resolucao;

  auditLog({
    userId: params.userId,
    userName: params.userName,
    action: 'impedimento_resolvido',
    projectId: imp.projectId,
    description: `Impedimento resolvido: ${params.resolucao}`,
  });

  return imp;
}

export function escalarImpedimento(params: {
  impedimentoId: string;
  userId: string;
  userName: string;
}): Impedimento | null {
  const imp = _impedimentos.get(params.impedimentoId);
  if (!imp) return null;

  imp.status = 'escalado';

  auditLog({
    userId: params.userId,
    userName: params.userName,
    action: 'cobranca_escalada',
    projectId: imp.projectId,
    description: `Impedimento escalado para coordenador: ${imp.descricao}`,
  });

  return imp;
}

export function getImpedimentos(projectId: string): Impedimento[] {
  return [..._impedimentos.values()]
    .filter((i) => i.projectId === projectId)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export function getImpedimentosAbertos(projectId: string): Impedimento[] {
  return getImpedimentos(projectId).filter((i) => i.status === 'aberto' || i.status === 'escalado');
}

// ════════════════════════════════════
// API — RESILIÊNCIA DE TAREFAS
// ════════════════════════════════════

export function registrarMudancaStatus(params: {
  taskId: string;
  from: TaskStatus;
  to: TaskStatus;
  userId: string;
  userName: string;
  motivo?: string;
}): TaskStatusChange {
  const change: TaskStatusChange = {
    id: genId('tsc'),
    taskId: params.taskId,
    from: params.from,
    to: params.to,
    userId: params.userId,
    userName: params.userName,
    motivo: params.motivo,
    timestamp: new Date().toISOString(),
  };

  _taskHistory.push(change);
  return change;
}

export function getTaskHistory(taskId: string): TaskStatusChange[] {
  return _taskHistory
    .filter((c) => c.taskId === taskId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Duplicar ação semelhante (cópia com novo responsável/prazo) */
export function duplicarAcao(original: {
  descricao: string;
  responsavelId: string;
  responsavelNome: string;
  prazo: string;
}): { descricao: string; responsavelId: string; responsavelNome: string; prazo: string } {
  return {
    ...original,
    descricao: `${original.descricao} (cópia)`,
  };
}
