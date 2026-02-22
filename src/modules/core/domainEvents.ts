/**
 * DOMAIN EVENTS — o sistema nervoso do frontend.
 *
 * Equivalente ao DomainEvents do backend, mas em memória.
 * Qualquer ação operacional dispara um evento tipado.
 * O ProjectProvider escuta e reage (reload).
 * Todas as abas atualizam automaticamente.
 *
 * Isso transforma o projeto num objeto VIVO:
 *   Carlos envia foto → evidence_added → provider reload →
 *   caderno atualiza → missão muda → alerta some
 *
 * Sem websocket. Sem server. Puro TypeScript.
 */

// ════════════════════════════════════
// TIPOS DE EVENTO
// ════════════════════════════════════

export type DomainEventType =
  | 'evidence_added'
  | 'requirement_completed'
  | 'phase_advanced'
  | 'decision_recorded'
  | 'message_linked'
  | 'nudge_sent'
  | 'action_created'
  | 'action_completed'
  | 'reuniao_iniciada'
  | 'reuniao_finalizada'
  | 'impedimento_registrado'
  | 'impedimento_resolvido'
  | 'cobranca_escalada'
  | 'resultado_registrado'
  | 'projeto_arquivado'
  | 'projeto_restaurado';

export interface DomainEvent {
  type: DomainEventType;
  projectId: string;
  /** Quem causou o evento */
  actorId?: string;
  /** Dados adicionais (requisito, fase, etc.) */
  payload?: Record<string, unknown>;
  /** Timestamp automático */
  timestamp: number;
}

export type DomainEventHandler = (event: DomainEvent) => void;

// ════════════════════════════════════
// BUS
// ════════════════════════════════════

const handlers = new Set<DomainEventHandler>();

/**
 * Escuta eventos de domínio.
 * Retorna função de unsubscribe.
 */
export function subscribeDomainEvents(handler: DomainEventHandler): () => void {
  handlers.add(handler);
  return () => { handlers.delete(handler); };
}

/**
 * Dispara evento de domínio.
 * Todos os handlers registrados são notificados.
 *
 * Uso:
 *   dispatchDomainEvent({
 *     type: 'requirement_completed',
 *     projectId: 'proj-001',
 *     payload: { requisitoId: 'F4_5PORQUES' },
 *   })
 */
export function dispatchDomainEvent(
  event: Omit<DomainEvent, 'timestamp'>,
): void {
  const full: DomainEvent = {
    ...event,
    timestamp: Date.now(),
  };

  handlers.forEach((fn) => {
    try {
      fn(full);
    } catch (err) {
      console.error('[DomainEvents] Handler threw:', err);
    }
  });
}
