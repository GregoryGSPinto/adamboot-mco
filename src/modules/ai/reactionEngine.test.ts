import { describe, it, expect } from 'vitest';
import { evaluateBehavior, type ProjectBehaviorProfile } from './reactionEngine';

function makeMemory(overrides: Record<string, unknown> = {}) {
  const now = Date.now();
  return {
    lastEventAt: now,
    lastProgressAt: now,
    phaseStartAt: now,
    lastHumanMessageAt: 0,
    pendingInterventions: [],
    lastPhase: 1,
    pendingCount: 0,
    previousPendingCount: -1,
    messageCountInPhase: 0,
    completedInPhase: 0,
    participantsInPhase: new Set<string>(),
    phaseDurations: new Map<number, number>(),
    currentProfile: 'SAUDAVEL' as ProjectBehaviorProfile,
    cooldowns: new Map<string, number>(),
    ...overrides,
  };
}

describe('evaluateBehavior', () => {
  it('returns SAUDAVEL for fresh project', () => {
    expect(evaluateBehavior(makeMemory())).toBe('SAUDAVEL');
  });

  it('returns PASSIVO when no events for 3+ days', () => {
    const mem = makeMemory({
      lastEventAt: Date.now() - 4 * 24 * 3600_000,
    });
    expect(evaluateBehavior(mem)).toBe('PASSIVO');
  });

  it('returns INDIVIDUAL when only 1 participant with activity', () => {
    const participants = new Set(['user-1']);
    const mem = makeMemory({
      participantsInPhase: participants,
      messageCountInPhase: 5,
      phaseStartAt: Date.now() - 3 * 24 * 3600_000,
    });
    expect(evaluateBehavior(mem)).toBe('INDIVIDUAL');
  });

  it('returns DESORGANIZADO when lots of talk, few completions', () => {
    const participants = new Set(['user-1', 'user-2']);
    const mem = makeMemory({
      participantsInPhase: participants,
      messageCountInPhase: 20,
      completedInPhase: 0,
    });
    expect(evaluateBehavior(mem)).toBe('DESORGANIZADO');
  });

  it('returns SAUDAVEL when good progress', () => {
    const participants = new Set(['user-1', 'user-2', 'user-3']);
    const mem = makeMemory({
      participantsInPhase: participants,
      messageCountInPhase: 5,
      completedInPhase: 3,
    });
    expect(evaluateBehavior(mem)).toBe('SAUDAVEL');
  });
});
