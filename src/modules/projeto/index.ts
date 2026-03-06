/**
 * Módulo Projeto — centro do sistema MCO.
 *
 * Hooks retornam StatusProjeto, não dados brutos.
 * A PhaseEngine calcula bloqueios, risco e mensagens da IA.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockProjetosDb } from '@shared/api/mock-projetos';
import { calcularStatusProjeto } from '@shared/engine';
import type { StatusProjeto } from '@shared/engine';
import { dispatchDomainEvent } from '@modules/core/domainEvents';

export const projetoKeys = {
  all: ['projetos'] as const,
  detail: (id: string) => ['projeto', id] as const,
  stats: ['projetos-stats'] as const,
};

/** Lista projetos com status calculado pela engine */
export function useProjetos() {
  return useQuery({
    queryKey: projetoKeys.all,
    queryFn: async (): Promise<StatusProjeto[]> => {
      const projetos = await mockProjetosDb.listarProjetos();
      return projetos.map(calcularStatusProjeto);
    },
  });
}

/** Projeto individual com status completo */
export function useProjeto(id: string) {
  return useQuery({
    queryKey: projetoKeys.detail(id),
    queryFn: async (): Promise<StatusProjeto> => {
      const projeto = await mockProjetosDb.buscarProjeto(id);
      return calcularStatusProjeto(projeto);
    },
    enabled: !!id,
  });
}

/** Cumprir requisito de uma fase */
export function useCumprirRequisito(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { requisitoId: string; userId: string; aprovado?: boolean }) =>
      mockProjetosDb.cumprirRequisito(projetoId, params.requisitoId, params.userId, params.aprovado),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: projetoKeys.detail(projetoId) });
      qc.invalidateQueries({ queryKey: projetoKeys.all });
      dispatchDomainEvent({
        type: 'requirement_completed',
        projectId: projetoId,
        actorId: vars.userId,
        payload: { requisitoId: vars.requisitoId },
      });
    },
  });
}

/** Avançar fase (só se engine permitir) */
export function useAvancarFaseProjeto(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => mockProjetosDb.avancarFase(projetoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projetoKeys.detail(projetoId) });
      qc.invalidateQueries({ queryKey: projetoKeys.all });
      dispatchDomainEvent({
        type: 'phase_advanced',
        projectId: projetoId,
      });
    },
  });
}

/** Remover evidência de um requisito */
export function useRemoverEvidencia(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requisitoId: string) =>
      mockProjetosDb.removerEvidencia(projetoId, requisitoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projetoKeys.detail(projetoId) });
      qc.invalidateQueries({ queryKey: projetoKeys.all });
    },
  });
}

/** Adicionar ação ao projeto */
export function useAdicionarAcao(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (acao: { descricao: string; responsavelId: string; dataPrevista: string }) =>
      mockProjetosDb.adicionarAcao(projetoId, { ...acao, status: 'pendente' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projetoKeys.detail(projetoId) });
      qc.invalidateQueries({ queryKey: projetoKeys.all });
      dispatchDomainEvent({
        type: 'action_created',
        projectId: projetoId,
      });
    },
  });
}

/** Remover ação do projeto */
export function useRemoverAcao(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (acaoId: string) =>
      mockProjetosDb.removerAcao(projetoId, acaoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projetoKeys.detail(projetoId) });
      qc.invalidateQueries({ queryKey: projetoKeys.all });
    },
  });
}

/** Criar projeto novo */
export function useAdicionarProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: {
      titulo: string;
      dataApresentacao: string;
      liderId: string;
      facilitadorId: string;
      membros: { id: string; nome: string; papel: 'lider' | 'membro' | 'facilitador' }[];
    }) => mockProjetosDb.adicionarProjeto(dados),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projetoKeys.all });
      qc.invalidateQueries({ queryKey: projetoKeys.stats });
    },
  });
}

/** Remover projeto */
export function useRemoverProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projetoId: string) => mockProjetosDb.removerProjeto(projetoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projetoKeys.all });
      qc.invalidateQueries({ queryKey: projetoKeys.stats });
    },
  });
}

/** Stats gerais */
export function useProjetosStats() {
  return useQuery({
    queryKey: projetoKeys.stats,
    queryFn: () => mockProjetosDb.getStats(),
  });
}

// ════════════════════════════════════
// CONTEXT (workspace)
// ════════════════════════════════════

export { ProjectProvider, useProjectContext } from './context/ProjectContext';
