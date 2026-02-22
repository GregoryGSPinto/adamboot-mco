/**
 * Hierarquia de erros tipados — mapeia respostas HTTP do backend MCO.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
    public readonly data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isValidation()   { return this.statusCode === 422; }
  get isUnauthorized() { return this.statusCode === 401; }
  get isForbidden()    { return this.statusCode === 403; }
  get isNotFound()     { return this.statusCode === 404; }
  get isConflict()     { return this.statusCode === 409; }
  get isServerError()  { return this.statusCode >= 500; }
}

/**
 * HTTP 409 — Conflito de concorrência otimista.
 * Backend detectou aggregateVersion divergente.
 * Frontend: invalidar cache → refetch → retry automático.
 */
export class ConcurrencyConflictError extends ApiError {
  public readonly aggregateType: string;
  public readonly aggregateId: string;

  constructor(responseData: Record<string, unknown>) {
    super(
      (responseData.message as string) ?? 'Conflito de concorrência',
      409,
      (responseData.code as string) ?? 'CONCURRENCY_CONFLICT',
      responseData,
    );
    this.name = 'ConcurrencyConflictError';
    this.aggregateType = (responseData.aggregateType as string) ?? '';
    this.aggregateId = (responseData.aggregateId as string) ?? '';
  }
}
