import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@shared/api';
import { mockDb } from '@shared/api/mock-db';
import { isDevAuth } from '@app/auth/dev-auth';
import type { EventoDto, CriarEventoDto } from '@shared/dto';

const api = new ApiService<EventoDto>('/eventos');

export const eventoKeys = {
  all: ['eventos'] as const,
  detail: (id: string) => ['evento', id] as const,
};

export function useEventos(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...eventoKeys.all, params],
    queryFn: () => isDevAuth ? mockDb.listarEventos(params) : api.list(params),
  });
}

export function useEvento(id: string) {
  return useQuery({
    queryKey: [...eventoKeys.detail(id)],
    queryFn: () => isDevAuth ? mockDb.buscarEvento(id) : api.getById(id),
    enabled: !!id,
  });
}

export function useCriarEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CriarEventoDto) =>
      isDevAuth ? mockDb.criarEvento(dto) : api.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventoKeys.all });
    },
  });
}

export { api as eventoApi };
