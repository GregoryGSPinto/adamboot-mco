import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { ApiError } from '@shared/errors';

/**
 * Hook de query tipado — wrapper leve sobre useQuery.
 *
 * Uso:
 *   const { data, isLoading } = useApiQuery({
 *     queryKey: ['ciclo', id],
 *     queryFn: () => cicloApi.getById(id),
 *     enabled: !!id,
 *   });
 */
export function useApiQuery<TData = unknown>(
  options: UseQueryOptions<TData, ApiError>,
): UseQueryResult<TData, ApiError> {
  return useQuery(options);
}
