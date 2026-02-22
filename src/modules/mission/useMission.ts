import { useQuery } from '@tanstack/react-query';
import { mockProjetosDb } from '@shared/api/mock-projetos';
import { calcularStatusProjeto, FASE_LABELS, TOTAL_FASES } from '@shared/engine';
import type { StatusProjeto, RequisitoPendente } from '@shared/engine';
import type { MissionItem, MissionGroup } from './types';
import { calculatePriority } from './priority';

/**
 * useMission — conecta a engine MASP ao dashboard do líder.
 *
 * Fluxo:
 *   mock-projetos → calcularStatusProjeto() → StatusProjeto → MissionGroup[]
 *
 * Cada requisito pendente vira uma MissionItem (linha de cobrança).
 * O MissionGroup carrega dados da engine para o card (risco, IA, dias).
 */
export function useMission(): {
  groups: MissionGroup[];
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ['mission-groups'],
    queryFn: async (): Promise<MissionGroup[]> => {
      const projetos = await mockProjetosDb.listarProjetos();
      const statuses = projetos.map(calcularStatusProjeto);
      return statuses.map(statusToGroup);
    },
  });

  return {
    groups: data ?? [],
    isLoading,
  };
}

// ════════════════════════════════════
// CONVERTERS
// ════════════════════════════════════

/**
 * statusToGroup — converte StatusProjeto em MissionGroup.
 *
 * Puro, sem side effects. Usado por:
 *   - useMission (radar global)
 *   - ProjectContext (workspace, sem re-fetch)
 */
export function statusToGroup(status: StatusProjeto): MissionGroup {
  const { projeto, bloqueio, diasRestantes, risco, mensagensIA, faseLabel } = status;
  const daysLate = diasRestantes < 0 ? Math.abs(diasRestantes) : undefined;
  const daysRemaining = diasRestantes >= 0 ? diasRestantes : undefined;

  const items: MissionItem[] = bloqueio.pendentes.map((pend, idx) =>
    pendenteToItem(pend, projeto.id, projeto.titulo, bloqueio.fase, daysLate, daysRemaining, idx),
  );

  return {
    projectId: projeto.id,
    projectName: projeto.titulo,
    items,
    phaseNumber: projeto.faseAtual,
    phaseName: faseLabel,
    totalPhases: TOTAL_FASES,
    daysRemaining: diasRestantes,
    completedRequirements: bloqueio.cumpridos,
    totalRequirements: bloqueio.totalRequisitos,
    canAdvance: bloqueio.podeSeguir,
    riskLevel: risco,
    aiMessages: mensagensIA
      .filter((m) => m.destinatario === 'lider')
      .map((m) => ({ text: m.mensagem, urgency: m.urgencia })),
  };
}

function pendenteToItem(
  pend: RequisitoPendente,
  projectId: string,
  projectName: string,
  fase: number,
  daysLate: number | undefined,
  daysRemaining: number | undefined,
  idx: number,
): MissionItem {
  const priority = calculatePriority(daysLate, daysRemaining);

  return {
    id: `${projectId}-${pend.requisito.id}-${idx}`,
    projectId,
    projectName,
    phaseNumber: fase,
    phaseName: FASE_LABELS[fase] ?? `Fase ${fase}`,
    responsibleId: pend.responsavelTipo,
    responsibleName: pend.responsavelNome,
    responsibleRole: mapRole(pend.responsavelTipo),
    requirementCode: pend.requisito.codigo,
    requirementDescription: pend.requisito.descricaoCurta,
    message: pend.requisito.dicaIA,
    priority,
    dueDate: undefined,
    daysLate,
  };
}

function mapRole(tipo: string): 'LEADER' | 'MEMBER' | 'FACILITATOR' {
  switch (tipo) {
    case 'lider':       return 'LEADER';
    case 'facilitador': return 'FACILITATOR';
    default:            return 'MEMBER';
  }
}
