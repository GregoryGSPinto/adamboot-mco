/**
 * Módulo Conversa — Conversa Operacional Estruturada.
 *
 * Hooks para chat do projeto com poderes especiais:
 *   - Separação automática por fase
 *   - Marcar decisão
 *   - Vincular evidência a requisito
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockConversaDb } from '@shared/api/mock-conversa';
import type { MensagemProjeto, Anexo } from '@shared/api/mock-conversa';
import { dispatchDomainEvent } from '@modules/core/domainEvents';

export type { MensagemProjeto, Anexo, TipoMensagem } from '@shared/api/mock-conversa';

// Re-export components
export { ConversaProjeto } from './ConversaProjeto';
export { MensagemItem } from './MensagemItem';
export { InputOperacional } from './InputOperacional';
export { MenuMensagem } from './MenuMensagem';
export { SeparadorFase } from './SeparadorFase';

export const conversaKeys = {
  mensagens: (projetoId: string) => ['conversa', projetoId] as const,
  decisoes: (projetoId: string) => ['conversa-decisoes', projetoId] as const,
};

/** Lista mensagens de um projeto */
export function useMensagens(projetoId: string) {
  return useQuery({
    queryKey: conversaKeys.mensagens(projetoId),
    queryFn: () => mockConversaDb.listarMensagens(projetoId),
    enabled: !!projetoId,
    refetchInterval: 5000,
  });
}

/** Envia mensagem */
export function useEnviarMensagem(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      autorId: string;
      autorNome: string;
      faseAtual: number;
      texto: string;
      anexos?: Anexo[];
      respostaA?: string;
    }) =>
      mockConversaDb.enviarMensagem(
        projetoId,
        params.autorId,
        params.autorNome,
        params.faseAtual,
        params.texto,
        params.anexos,
        params.respostaA,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: conversaKeys.mensagens(projetoId) });
    },
  });
}

/** Toggle decisão numa mensagem */
export function useMarcarDecisao(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mensagemId: string) => mockConversaDb.marcarDecisao(mensagemId),
    onSuccess: (_data, mensagemId) => {
      qc.invalidateQueries({ queryKey: conversaKeys.mensagens(projetoId) });
      qc.invalidateQueries({ queryKey: conversaKeys.decisoes(projetoId) });
      dispatchDomainEvent({
        type: 'decision_recorded',
        projectId: projetoId,
        payload: { mensagemId },
      });
    },
  });
}

/** Vincular mensagem a requisito da fase */
export function useVincularRequisito(projetoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { mensagemId: string; requisitoId: string }) =>
      mockConversaDb.vincularRequisito(params.mensagemId, params.requisitoId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: conversaKeys.mensagens(projetoId) });
      dispatchDomainEvent({
        type: 'message_linked',
        projectId: projetoId,
        payload: { mensagemId: vars.mensagemId, requisitoId: vars.requisitoId },
      });
    },
  });
}

/** Lista decisões de um projeto */
export function useDecisoes(projetoId: string) {
  return useQuery({
    queryKey: conversaKeys.decisoes(projetoId),
    queryFn: () => mockConversaDb.getDecisoes(projetoId),
    enabled: !!projetoId,
  });
}

/** Upload de foto (mock) */
export function useUploadFoto() {
  return useMutation({
    mutationFn: (nome: string) => mockConversaDb.uploadFoto(nome),
  });
}
