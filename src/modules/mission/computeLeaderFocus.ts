import type { MissionGroup, MissionPriority } from './types';
import { priorityWeight } from './priority';

export interface LeaderFocusItem {
  responsibleName: string;
  projectName: string;
  message: string;
  priority: MissionPriority;
  daysLate?: number;
}

/**
 * Gera a lista de cobranças imediatas do líder.
 *
 * Não agrupa por projeto. Agrupa por urgência.
 * O líder pensa em PESSOAS, não em projetos.
 *
 * Regras:
 *   1. Junta todos os MissionItem de todos os grupos
 *   2. Ordena: CRITICAL → HIGH → MEDIUM → LOW
 *   3. Retorna os 7 mais urgentes
 *   4. Se CRITICAL existe → gera mainAlert com o primeiro
 */
export function computeLeaderFocus(groups: MissionGroup[]): {
  mainAlert?: string;
  focus: LeaderFocusItem[];
} {
  // 1. Flatten — ignora agrupamento por projeto
  const all: LeaderFocusItem[] = groups.flatMap((g) =>
    g.items.map((item) => ({
      responsibleName: item.responsibleName,
      projectName: item.projectName,
      message: item.message,
      priority: item.priority,
      daysLate: item.daysLate,
    })),
  );

  // 2. Ordenar por prioridade (maior primeiro), desempate por dias de atraso
  all.sort((a, b) => {
    const diff = priorityWeight(b.priority) - priorityWeight(a.priority);
    if (diff !== 0) return diff;
    return (b.daysLate ?? 0) - (a.daysLate ?? 0);
  });

  // 3. Top 7
  const focus = all.slice(0, 7);

  // 4. mainAlert se houver CRITICAL
  const critical = focus.find((f) => f.priority === 'CRITICAL');
  const mainAlert = critical
    ? `O projeto "${critical.projectName}" está bloqueado: ${critical.message}`
    : undefined;

  return { mainAlert, focus };
}
