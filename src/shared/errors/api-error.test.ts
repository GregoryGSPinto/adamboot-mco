import { describe, it, expect } from 'vitest';
import { ApiError, ConcurrencyConflictError } from './api-error';

describe('ApiError', () => {
  it('creates error with statusCode and message', () => {
    const err = new ApiError('Not found', 404, 'NOT_FOUND');
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.name).toBe('ApiError');
    expect(err).toBeInstanceOf(Error);
  });

  it('isValidation returns true for 422', () => {
    const err = new ApiError('Invalid', 422);
    expect(err.isValidation).toBe(true);
    expect(err.isUnauthorized).toBe(false);
  });

  it('isUnauthorized returns true for 401', () => {
    const err = new ApiError('Unauthorized', 401);
    expect(err.isUnauthorized).toBe(true);
    expect(err.isForbidden).toBe(false);
  });

  it('isForbidden returns true for 403', () => {
    expect(new ApiError('Forbidden', 403).isForbidden).toBe(true);
  });

  it('isNotFound returns true for 404', () => {
    expect(new ApiError('Not found', 404).isNotFound).toBe(true);
  });

  it('isConflict returns true for 409', () => {
    expect(new ApiError('Conflict', 409).isConflict).toBe(true);
  });

  it('isServerError returns true for 500+', () => {
    expect(new ApiError('Server error', 500).isServerError).toBe(true);
    expect(new ApiError('Server error', 503).isServerError).toBe(true);
    expect(new ApiError('Client error', 400).isServerError).toBe(false);
  });

  it('stores optional data payload', () => {
    const data = { field: 'email', reason: 'invalid' };
    const err = new ApiError('Validation', 422, 'VALIDATION', data);
    expect(err.data).toEqual(data);
  });

  it('data is undefined when not provided', () => {
    const err = new ApiError('Error', 500);
    expect(err.data).toBeUndefined();
  });
});

describe('ConcurrencyConflictError', () => {
  it('creates from response data', () => {
    const err = new ConcurrencyConflictError({
      message: 'Version mismatch',
      code: 'CONCURRENCY_CONFLICT',
      aggregateType: 'Projeto',
      aggregateId: 'proj-001',
    });
    expect(err.statusCode).toBe(409);
    expect(err.isConflict).toBe(true);
    expect(err.aggregateType).toBe('Projeto');
    expect(err.aggregateId).toBe('proj-001');
    expect(err.name).toBe('ConcurrencyConflictError');
    expect(err).toBeInstanceOf(ApiError);
  });

  it('uses defaults when response data is sparse', () => {
    const err = new ConcurrencyConflictError({});
    expect(err.message).toBe('Conflito de concorrência');
    expect(err.code).toBe('CONCURRENCY_CONFLICT');
    expect(err.aggregateType).toBe('');
    expect(err.aggregateId).toBe('');
  });

  it('preserves original response data', () => {
    const data = { message: 'Conflict', extra: 'info' };
    const err = new ConcurrencyConflictError(data);
    expect(err.data).toEqual(data);
  });
});
