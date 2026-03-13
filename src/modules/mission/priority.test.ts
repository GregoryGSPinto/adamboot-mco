import { describe, it, expect } from 'vitest';
import { calculatePriority, priorityWeight } from './priority';

describe('calculatePriority', () => {
  it('returns CRITICAL when daysLate > 3', () => {
    expect(calculatePriority(4)).toBe('CRITICAL');
    expect(calculatePriority(10)).toBe('CRITICAL');
  });

  it('returns HIGH when daysLate is 1-3', () => {
    expect(calculatePriority(1)).toBe('HIGH');
    expect(calculatePriority(2)).toBe('HIGH');
    expect(calculatePriority(3)).toBe('HIGH');
  });

  it('returns MEDIUM when daysRemaining <= 5', () => {
    expect(calculatePriority(0, 5)).toBe('MEDIUM');
    expect(calculatePriority(0, 1)).toBe('MEDIUM');
    expect(calculatePriority(undefined, 0)).toBe('MEDIUM');
  });

  it('returns LOW when no urgency signals', () => {
    expect(calculatePriority(0, 10)).toBe('LOW');
    expect(calculatePriority(undefined, 20)).toBe('LOW');
    expect(calculatePriority()).toBe('LOW');
  });

  it('daysLate takes precedence over daysRemaining', () => {
    expect(calculatePriority(5, 1)).toBe('CRITICAL');
    expect(calculatePriority(2, 1)).toBe('HIGH');
  });

  it('handles null/undefined inputs gracefully', () => {
    expect(calculatePriority(undefined, undefined)).toBe('LOW');
    expect(calculatePriority(undefined, 3)).toBe('MEDIUM');
  });

  it('boundary: daysLate exactly 0 does not trigger HIGH', () => {
    expect(calculatePriority(0, 30)).toBe('LOW');
  });

  it('boundary: daysRemaining exactly 6 is LOW', () => {
    expect(calculatePriority(undefined, 6)).toBe('LOW');
  });
});

describe('priorityWeight', () => {
  it('returns correct weights for ordering', () => {
    expect(priorityWeight('CRITICAL')).toBe(4);
    expect(priorityWeight('HIGH')).toBe(3);
    expect(priorityWeight('MEDIUM')).toBe(2);
    expect(priorityWeight('LOW')).toBe(1);
  });

  it('CRITICAL > HIGH > MEDIUM > LOW', () => {
    expect(priorityWeight('CRITICAL')).toBeGreaterThan(priorityWeight('HIGH'));
    expect(priorityWeight('HIGH')).toBeGreaterThan(priorityWeight('MEDIUM'));
    expect(priorityWeight('MEDIUM')).toBeGreaterThan(priorityWeight('LOW'));
  });
});
