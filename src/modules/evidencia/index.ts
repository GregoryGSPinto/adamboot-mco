import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@shared/api';
import { mockDb } from '@shared/api/mock-db';
import { isDevAuth } from '@app/auth/dev-auth';
import type { EvidenciaDto } from '@shared/dto';

const api = new ApiService<EvidenciaDto>('/evidencias');

export const evidenciaKeys = {
  all: ['evidencias'] as const,
  byEvento: (eventoId: string) => ['evidencias', 'evento', eventoId] as const,
};

export function useEvidencias(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...evidenciaKeys.all, params],
    queryFn: () => isDevAuth ? mockDb.listarEvidencias(params) : api.list(params),
  });
}

export { api as evidenciaApi };
