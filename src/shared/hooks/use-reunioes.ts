import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reunioesApi, type Reuniao } from '@shared/api/queries/reunioes';

export function useReunioes(projetoId: string) {
  return useQuery({
    queryKey: ['reunioes', projetoId],
    queryFn: () => reunioesApi.listar(projetoId),
    enabled: !!projetoId,
  });
}

export function useCriarReuniao(projetoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reuniao: Omit<Reuniao, 'id'>) => reunioesApi.criar(reuniao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reunioes', projetoId] });
    },
  });
}
