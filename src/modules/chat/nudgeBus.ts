/**
 * Event bus de cobranças — desacopla dashboard do chat.
 *
 * Dashboard dispara → Chat escuta.
 * Também emite domain event para o ProjectProvider reagir.
 */

import { dispatchDomainEvent } from '@modules/core/domainEvents';

export type NudgeListener = (message: { projectId: string; text: string }) => void;

const listeners = new Set<NudgeListener>();

export function subscribeNudges(listener: NudgeListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function dispatchNudge(message: { projectId: string; text: string }): void {
  listeners.forEach((fn) => fn(message));
  dispatchDomainEvent({
    type: 'nudge_sent',
    projectId: message.projectId,
    payload: { text: message.text },
  });
}
