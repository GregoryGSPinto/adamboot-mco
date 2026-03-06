import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projetosApi } from '@shared/api/queries/projetos';

export function useProjetos() {
  return useQuery({
    queryKey: ['projetos'],
    queryFn: () => projetosApi.listar(),
  });
}

export function useProjeto(id: string) {
  return useQuery({
    queryKey: ['projeto', id],
    queryFn: () => projetosApi.buscar(id),
    enabled: !!id,
  });
}

export function useAvancarFase(projetoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => projetosApi.avancarFase(projetoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projeto', projetoId] });
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
    },
  });
}

export function useProjetosStats() {
  return useQuery({
    queryKey: ['projetos', 'stats'],
    queryFn: () => projetosApi.getStats(),
  });
}
