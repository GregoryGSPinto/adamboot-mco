import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateRelative,
  calculateKPIImprovement,
  truncateText,
  generateProjectNumber,
} from './index';

describe('formatDate', () => {
  it('formats a valid ISO date to DD/MM/YYYY', () => {
    expect(formatDate('2024-03-15')).toBe('15/03/2024');
  });

  it('formats a full ISO datetime string', () => {
    const result = formatDate('2023-12-25T10:30:00Z');
    expect(result).toMatch(/25\/12\/2023/);
  });

  it('returns empty string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('handles single-digit day and month with zero padding', () => {
    expect(formatDate('2024-01-05')).toBe('05/01/2024');
  });
});

describe('formatDateRelative', () => {
  it('returns "Hoje" for today', () => {
    const today = new Date().toISOString();
    expect(formatDateRelative(today)).toBe('Hoje');
  });

  it('returns "Ontem" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDateRelative(yesterday.toISOString())).toBe('Ontem');
  });

  it('returns "X dias atras" for older dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    expect(formatDateRelative(past.toISOString())).toContain('dias atrás');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDateRelative('invalid')).toBe('');
  });
});

describe('calculateKPIImprovement', () => {
  it('calculates positive improvement (reduction)', () => {
    // from 10 defects to 3 defects = 70% improvement
    expect(calculateKPIImprovement(10, 3)).toBe(70);
  });

  it('calculates negative improvement (worsening)', () => {
    // from 5 to 8 = -60%
    expect(calculateKPIImprovement(5, 8)).toBe(-60);
  });

  it('returns 0 when before is 0 (division by zero guard)', () => {
    expect(calculateKPIImprovement(0, 5)).toBe(0);
  });

  it('returns 100 when after is 0 (complete elimination)', () => {
    expect(calculateKPIImprovement(10, 0)).toBe(100);
  });

  it('returns 0 when both are the same (no change)', () => {
    expect(calculateKPIImprovement(7, 7)).toBe(0);
  });
});

describe('truncateText', () => {
  it('returns original text when shorter than maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('returns original text when exactly maxLength', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('truncates and appends ellipsis when longer than maxLength', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
  });

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

describe('generateProjectNumber', () => {
  it('generates format CCQ-YYYY-NNN', () => {
    expect(generateProjectNumber('2024-06-01', 1)).toBe('CCQ-2024-001');
  });

  it('pads sequence to 3 digits', () => {
    expect(generateProjectNumber('2024-01-15', 42)).toBe('CCQ-2024-042');
  });

  it('handles 3-digit sequence without padding', () => {
    expect(generateProjectNumber('2025-03-10', 123)).toBe('CCQ-2025-123');
  });

  it('uses year from dataInicio', () => {
    const result = generateProjectNumber('2023-11-30', 7);
    expect(result).toContain('2023');
  });
});
