/**
 * Domain Models — Core interfaces for the ADAMBOOT MCO platform.
 *
 * Re-exports shared types from their canonical locations.
 * Domain models are pure data structures with no behavior.
 */

// Re-export existing types (single source of truth)
export type { Perfil, AcaoProtegida } from '@modules/permissao/index';
export type { MissionPriority } from '@modules/mission/types';

// ════════════════════════════════════
// PROJECT
// ════════════════════════════════════

export type ProjectStatus =
  | 'rascunho'
  | 'em_andamento'
  | 'pausado'
  | 'concluido'
  | 'arquivado'
  | 'cancelado';

export type ActionStatus = 'pendente' | 'em_andamento' | 'concluida' | 'atrasada' | 'cancelada';

export interface Project {
  id: string;
  titulo: string;
  descricao: string;
  faseAtual: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  status: ProjectStatus;
  dataInicio: string;
  dataApresentacao: string;
  liderId: string;
  facilitadorId: string;
  membros: TeamMember[];
  evidencias: Evidence[];
  acoes: Action[];
}

// ════════════════════════════════════
// STEP (phase progression)
// ════════════════════════════════════

export interface Step {
  fase: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  label: string;
  requirementsCount: number;
  completedCount: number;
}

// ════════════════════════════════════
// TEAM
// ════════════════════════════════════

export interface TeamMember {
  id: string;
  nome: string;
  email: string;
  papel: import('@modules/permissao/index').Perfil;
}

// ════════════════════════════════════
// EVIDENCE
// ════════════════════════════════════

export interface Evidence {
  id: string;
  projetoId: string;
  requisitoId: string;
  preenchidoPor: string;
  dataRegistro: string;
  aprovado: boolean;
  aprovadoPor?: string;
}

// ════════════════════════════════════
// ACTION (5W2H)
// ════════════════════════════════════

export interface Action {
  id: string;
  projetoId: string;
  descricao: string;
  responsavelId: string;
  dataPrevista: string;
  dataReal?: string;
  status: ActionStatus;
}

// ════════════════════════════════════
// KPI METRICS
// ════════════════════════════════════

export interface KPIMetrics {
  indicadorAntes: number;
  indicadorDepois: number;
  percentualAtingimento: number;
  unidade: string;
}
