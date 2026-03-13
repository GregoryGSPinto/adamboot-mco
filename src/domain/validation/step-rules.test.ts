import { describe, it, expect } from 'vitest';
import {
  canAdvanceStep,
  getStepCompletionPercentage,
  isProjectOverdue,
  getDaysRemaining,
} from './step-rules';

describe('canAdvanceStep', () => {
  it('returns true when all required requirements are met', () => {
    expect(canAdvanceStep(1, 4, 4)).toBe(true);
  });

  it('returns true when completed exceeds required', () => {
    expect(canAdvanceStep(3, 5, 4)).toBe(true);
  });

  it('returns false when not all requirements are met', () => {
    expect(canAdvanceStep(2, 2, 5)).toBe(false);
  });

  it('returns false when zero completed out of required', () => {
    expect(canAdvanceStep(1, 0, 4)).toBe(false);
  });

  it('returns false when totalRequired is zero', () => {
    expect(canAdvanceStep(1, 0, 0)).toBe(false);
  });

  it('returns false for invalid phase numbers', () => {
    expect(canAdvanceStep(0, 4, 4)).toBe(false);
    expect(canAdvanceStep(9, 4, 4)).toBe(false);
  });
});

describe('getStepCompletionPercentage', () => {
  it('returns 0% when nothing is completed', () => {
    expect(getStepCompletionPercentage(0, 10)).toBe(0);
  });

  it('returns 50% when half is completed', () => {
    expect(getStepCompletionPercentage(5, 10)).toBe(50);
  });

  it('returns 100% when all are completed', () => {
    expect(getStepCompletionPercentage(4, 4)).toBe(100);
  });

  it('caps at 100% even if completed exceeds total', () => {
    expect(getStepCompletionPercentage(12, 10)).toBe(100);
  });

  it('returns 0 when total is zero (division by zero guard)', () => {
    expect(getStepCompletionPercentage(0, 0)).toBe(0);
  });

  it('returns 0 when total is negative', () => {
    expect(getStepCompletionPercentage(5, -1)).toBe(0);
  });
});

describe('isProjectOverdue', () => {
  it('returns true for a past date', () => {
    expect(isProjectOverdue('2020-01-01')).toBe(true);
  });

  it('returns false for a future date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isProjectOverdue(future.toISOString())).toBe(false);
  });

  it('returns false for today (deadline day is not overdue)', () => {
    const today = new Date();
    const iso = today.toISOString().split('T')[0];
    expect(isProjectOverdue(iso)).toBe(false);
  });
});

describe('getDaysRemaining', () => {
  it('returns positive number for future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const iso = future.toISOString().split('T')[0];
    expect(getDaysRemaining(iso)).toBe(10);
  });

  it('returns negative number for past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const iso = past.toISOString().split('T')[0];
    expect(getDaysRemaining(iso)).toBe(-5);
  });

  it('returns 0 for today', () => {
    const today = new Date();
    const iso = today.toISOString().split('T')[0];
    expect(getDaysRemaining(iso)).toBe(0);
  });
});
