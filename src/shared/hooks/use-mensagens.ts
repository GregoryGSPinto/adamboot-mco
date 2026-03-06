import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mensagensApi } from '@shared/api/queries/mensagens';
import type { Anexo } from '@shared/api/mock-conversa';

export function useMensagens(projetoId: string) {
  return useQuery({
    queryKey: ['mensagens', projetoId],
    queryFn: () => mensagensApi.listar(projetoId),
    enabled: !!projetoId,
  });
}

export function useEnviarMensagem(projetoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      autorId: string;
      autorNome: string;
      faseAtual: number;
      texto: string;
      anexos?: Anexo[];
      respostaA?: string;
    }) =>
      mensagensApi.enviar(
        projetoId,
        params.autorId,
        params.autorNome,
        params.faseAtual,
        params.texto,
        params.anexos,
        params.respostaA,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens', projetoId] });
    },
  });
}

export function useMarcarDecisao(projetoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mensagemId: string) => mensagensApi.marcarDecisao(mensagemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens', projetoId] });
    },
  });
}

export function useDecisoes(projetoId: string) {
  return useQuery({
    queryKey: ['decisoes', projetoId],
    queryFn: () => mensagensApi.getDecisoes(projetoId),
    enabled: !!projetoId,
  });
}
