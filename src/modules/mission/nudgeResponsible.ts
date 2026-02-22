import type { MissionItem } from './types';

export interface NudgeMessage {
  projectId: string;
  text: string;
}

/**
 * Gera mensagem de cobrança para o chat do projeto.
 *
 * Tom: curto, direto, estilo WhatsApp.
 * Não é e-mail. É cutucada de líder.
 */
export function nudgeResponsible(item: MissionItem): NudgeMessage {
  const firstName = item.responsibleName.split(' ')[0];
  const late = item.daysLate != null && item.daysLate > 0
    ? ` (${item.daysLate}d atrasado)`
    : '';

  return {
    projectId: item.projectId,
    text: `${firstName}, o líder está aguardando: ${item.requirementDescription}${late}`,
  };
}
