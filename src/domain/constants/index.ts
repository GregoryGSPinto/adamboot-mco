/**
 * Domain Constants — Canonical values for the MASP/CCQ domain.
 *
 * Re-exports engine constants so consumers only need one import path.
 */

import type { ProjectStatus, ActionStatus } from '../models';

// Re-export from shared engine (single source of truth)
export { REQUISITOS_MASP, FASE_LABELS, TOTAL_FASES } from '@shared/engine/requisitos-masp';

// ════════════════════════════════════
// STEP NAMES (PT-BR short labels)
// ════════════════════════════════════

export const STEP_NAMES: Record<number, string> = {
  1: 'Problema',
  2: 'Desdobramento',
  3: 'Meta',
  4: 'Causa Raiz',
  5: 'Contramedidas',
  6: 'Execução',
  7: 'Verificação',
  8: 'Padronização',
} as const;

// ════════════════════════════════════
// STATUS ENUMS
// ════════════════════════════════════

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'rascunho',
  'em_andamento',
  'pausado',
  'concluido',
  'arquivado',
  'cancelado',
] as const;

export const ACTION_STATUSES: readonly ActionStatus[] = [
  'pendente',
  'em_andamento',
  'concluida',
  'atrasada',
  'cancelada',
] as const;

// ════════════════════════════════════
// LIMITS
// ════════════════════════════════════

export const MAX_PHASES = 8;
