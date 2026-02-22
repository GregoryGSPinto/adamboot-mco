import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { ConcurrencyConflictError, ApiError } from '@shared/errors';

/**
 * Opções estendidas para mutações com retry semântico.
 */
interface ApiMutationOptions<TData, TVariables> {
  /** Função de mutação principal */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * Query keys para invalidar após sucesso.
   * Garante que dados stale sejam refetchados automaticamente.
   */
  invalidateKeys?: string[][];

  /**
   * Número máximo de retries automáticos em caso de 409.
   * Default: 2 (total de 3 tentativas incluindo a original).
   */
  maxConflictRetries?: number;

  /**
   * Função de refetch executada ANTES do retry.
   * Deve recarregar o dado atualizado para que a próxima
   * tentativa use a versão correta do aggregate.
   *
   * Fluxo: mutação falha 409 → refetchBeforeRetry() → retry mutação
   */
  refetchBeforeRetry?: () => Promise<void>;

  /** Callbacks do TanStack Query */
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: () => void;
}

/**
 * Hook de mutação com retry semântico para conflitos de concorrência.
 *
 * Quando o backend retorna HTTP 409 (optimistic locking):
 *   1. Invalidar queries relacionadas (atualizar cache)
 *   2. Executar refetchBeforeRetry (se fornecido)
 *   3. Aguardar breve delay (evitar thundering herd)
 *   4. Retry automaticamente a mutação original
 *   5. Se exceder maxConflictRetries → propagar erro
 *
 * Uso:
 *   const { mutate, isPending } = useApiMutation({
 *     mutationFn: (dto) => cicloApi.action(id, 'avancar-fase', dto),
 *     invalidateKeys: [['ciclo', id]],
 *     refetchBeforeRetry: () => queryClient.refetchQueries(['ciclo', id]),
 *   });
 */
export function useApiMutation<TData = unknown, TVariables = void>(
  options: ApiMutationOptions<TData, TVariables>,
): UseMutationResult<TData, ApiError, TVariables> {
  const queryClient = useQueryClient();
  const maxRetries = options.maxConflictRetries ?? 2;

  const wrappedMutationFn = async (variables: TVariables): Promise<TData> => {
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await options.mutationFn(variables);
      } catch (error) {
        if (!(error instanceof ConcurrencyConflictError)) {
          throw error;
        }

        lastError = error;

        if (attempt < maxRetries) {
          console.warn(
            `[useApiMutation] 409 Conflict — retry ${attempt + 1}/${maxRetries} ` +
            `(${error.aggregateType}:${error.aggregateId})`,
          );

          // 1. Invalidar cache para forçar refetch
          if (options.invalidateKeys) {
            await Promise.all(
              options.invalidateKeys.map((key) =>
                queryClient.invalidateQueries({ queryKey: key }),
              ),
            );
          }

          // 2. Refetch explícito antes do retry
          if (options.refetchBeforeRetry) {
            await options.refetchBeforeRetry();
          }

          // 3. Delay progressivo (200ms, 400ms, ...)
          await delay(200 * (attempt + 1));
        }
      }
    }

    // Excedeu retries — propagar último erro
    throw lastError ?? new ApiError('Conflito de concorrência persistente', 409);
  };

  return useMutation({
    mutationFn: wrappedMutationFn,
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas após sucesso
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options.onError?.(error as ApiError, variables);
    },
    onSettled: options.onSettled,
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
