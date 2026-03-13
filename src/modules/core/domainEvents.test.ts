import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscribeDomainEvents, dispatchDomainEvent } from './domainEvents';
import type { DomainEvent } from './domainEvents';

describe('domainEvents', () => {
  beforeEach(() => {
    // Clear handlers by subscribing/unsubscribing - no direct reset available
  });

  it('handler receives dispatched event with timestamp', () => {
    const handler = vi.fn();
    const unsub = subscribeDomainEvents(handler);

    dispatchDomainEvent({
      type: 'evidence_added',
      projectId: 'proj-001',
      actorId: 'user-1',
    });

    expect(handler).toHaveBeenCalledOnce();
    const event: DomainEvent = handler.mock.calls[0][0];
    expect(event.type).toBe('evidence_added');
    expect(event.projectId).toBe('proj-001');
    expect(event.actorId).toBe('user-1');
    expect(event.timestamp).toBeGreaterThan(0);

    unsub();
  });

  it('unsubscribe stops receiving events', () => {
    const handler = vi.fn();
    const unsub = subscribeDomainEvents(handler);

    dispatchDomainEvent({ type: 'phase_advanced', projectId: 'p1' });
    expect(handler).toHaveBeenCalledOnce();

    unsub();
    dispatchDomainEvent({ type: 'phase_advanced', projectId: 'p2' });
    expect(handler).toHaveBeenCalledOnce(); // still 1
  });

  it('multiple handlers all receive the event', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    const u1 = subscribeDomainEvents(h1);
    const u2 = subscribeDomainEvents(h2);

    dispatchDomainEvent({ type: 'action_created', projectId: 'p1' });

    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();

    u1();
    u2();
  });

  it('handler error does not break other handlers', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const badHandler = vi.fn(() => {
      throw new Error('boom');
    });
    const goodHandler = vi.fn();

    const u1 = subscribeDomainEvents(badHandler);
    const u2 = subscribeDomainEvents(goodHandler);

    dispatchDomainEvent({ type: 'nudge_sent', projectId: 'p1' });

    expect(badHandler).toHaveBeenCalledOnce();
    expect(goodHandler).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalled();

    u1();
    u2();
    consoleSpy.mockRestore();
  });

  it('payload is forwarded in event', () => {
    const handler = vi.fn();
    const unsub = subscribeDomainEvents(handler);

    dispatchDomainEvent({
      type: 'requirement_completed',
      projectId: 'p1',
      payload: { requisitoId: 'F4_5PORQUES' },
    });

    const event: DomainEvent = handler.mock.calls[0][0];
    expect(event.payload).toEqual({ requisitoId: 'F4_5PORQUES' });

    unsub();
  });
});
