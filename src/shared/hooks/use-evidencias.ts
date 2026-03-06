import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evidenciasApi } from '@shared/api/queries/evidencias';

export function useCumprirEvidencia(projetoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { requisitoId: string; userId: string; aprovado?: boolean }) =>
      evidenciasApi.cumprir(projetoId, params.requisitoId, params.userId, params.aprovado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projeto', projetoId] });
    },
  });
}

export function useRemoverEvidencia(projetoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requisitoId: string) => evidenciasApi.remover(projetoId, requisitoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projeto', projetoId] });
    },
  });
}
