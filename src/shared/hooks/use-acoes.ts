import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { acoesApi } from '@shared/api/queries/acoes';
import type { AcaoProjeto } from '@shared/engine';

export function useAcoes(projetoId: string) {
  return useQuery({
    queryKey: ['acoes', projetoId],
    queryFn: () => acoesApi.listar(projetoId),
    enabled: !!projetoId,
  });
}

export function useAdicionarAcao(projetoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (acao: Omit<AcaoProjeto, 'id'>) => acoesApi.adicionar(projetoId, acao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acoes', projetoId] });
      queryClient.invalidateQueries({ queryKey: ['projeto', projetoId] });
    },
  });
}

export function useAtualizarAcao(projetoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { acaoId: string; update: Partial<AcaoProjeto> }) =>
      acoesApi.atualizar(projetoId, params.acaoId, params.update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acoes', projetoId] });
      queryClient.invalidateQueries({ queryKey: ['projeto', projetoId] });
    },
  });
}

export function useRemoverAcao(projetoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (acaoId: string) => acoesApi.remover(projetoId, acaoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acoes', projetoId] });
      queryClient.invalidateQueries({ queryKey: ['projeto', projetoId] });
    },
  });
}
