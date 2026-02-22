import type { MissionPriority } from './types';

/**
 * Calcula prioridade de um item de missão.
 *
 * Regras (em ordem de precedência):
 *   daysLate > 3        → CRITICAL
 *   daysLate 1-3        → HIGH
 *   daysRemaining <= 5  → MEDIUM
 *   senão               → LOW
 *
 * Padrão único para todo o sistema.
 */
export function calculatePriority(
  daysLate?: number,
  daysRemaining?: number,
): MissionPriority {
  if (daysLate != null && daysLate > 3) return 'CRITICAL';
  if (daysLate != null && daysLate >= 1) return 'HIGH';
  if (daysRemaining != null && daysRemaining <= 5) return 'MEDIUM';
  return 'LOW';
}

/** Peso numérico para ordenação (maior = mais urgente) */
export function priorityWeight(p: MissionPriority): number {
  switch (p) {
    case 'CRITICAL': return 4;
    case 'HIGH':     return 3;
    case 'MEDIUM':   return 2;
    case 'LOW':      return 1;
  }
}
