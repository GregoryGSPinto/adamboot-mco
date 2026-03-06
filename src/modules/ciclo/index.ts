import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@shared/api';
import { mockDb } from '@shared/api/mock-db';
import { isDevAuth } from '@app/auth/dev-auth';
import type { CicloDto, AvancarFaseDto } from '@shared/dto';

const api = new ApiService<CicloDto>('/ciclos-melhoria');

export const cicloKeys = {
  all: ['ciclos'] as const,
  detail: (id: string) => ['ciclo', id] as const,
  stats: ['stats'] as const,
};

export function useCiclos(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...cicloKeys.all, params],
    queryFn: () => isDevAuth ? mockDb.listarCiclos(params) : api.list(params),
  });
}

export function useCiclo(id: string) {
  return useQuery({
    queryKey: [...cicloKeys.detail(id)],
    queryFn: () => isDevAuth ? mockDb.buscarCiclo(id) : api.getById(id),
    enabled: !!id,
  });
}

export function useAvancarFase(cicloId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AvancarFaseDto) =>
      isDevAuth
        ? mockDb.avancarFase(cicloId, dto.observacao)
        : api.action<AvancarFaseDto>(cicloId, 'avancar-fase', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cicloKeys.all });
      qc.invalidateQueries({ queryKey: cicloKeys.detail(cicloId) });
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: cicloKeys.stats,
    queryFn: () => mockDb.getStats(),
    enabled: isDevAuth,
  });
}

export { api as cicloApi };
