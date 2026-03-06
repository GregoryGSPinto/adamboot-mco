import { supabase, USE_SUPABASE } from '../supabase-client';
import { mockDb } from '../mock-db';
import type { EventoDto, CriarEventoDto } from '@shared/dto';

interface EventoRow {
  id: string;
  data: string;
  local: string;
  descricao: string;
  tipo: string;
  severidade: string;
  usuario_id: string;
  projeto_id: string | null;
  criado_em: string;
  atualizado_em: string;
}

function toEventoDto(row: EventoRow): EventoDto {
  return {
    id: row.id,
    data: row.data,
    local: row.local,
    descricao: row.descricao,
    tipo: row.tipo as EventoDto['tipo'],
    severidade: row.severidade as EventoDto['severidade'],
    usuarioId: row.usuario_id,
    evidenciaIds: [],
    cicloMelhoriaId: row.projeto_id,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

async function listarSupabase(params?: Record<string, unknown>) {
  const page = Number(params?.page ?? 1);
  const limit = Number(params?.limit ?? 20);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('eventos')
    .select('*', { count: 'exact' })
    .order('criado_em', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data as EventoRow[]).map(toEventoDto),
    total: count ?? 0,
    page,
    limit,
  };
}

async function criarSupabase(dto: CriarEventoDto, usuarioId: string): Promise<EventoDto> {
  const { data, error } = await supabase
    .from('eventos')
    .insert({
      data: dto.data,
      local: dto.local,
      descricao: dto.descricao,
      tipo: dto.tipo,
      severidade: dto.severidade,
      usuario_id: usuarioId,
    })
    .select()
    .single();

  if (error) throw error;
  return toEventoDto(data as EventoRow);
}

export const eventosApi = {
  listar: (params?: Record<string, unknown>) =>
    USE_SUPABASE ? listarSupabase(params) : mockDb.listarEventos(params),

  buscar: (id: string) =>
    USE_SUPABASE
      ? supabase
          .from('eventos')
          .select('*')
          .eq('id', id)
          .single()
          .then(({ data, error }) => {
            if (error) throw error;
            return toEventoDto(data as EventoRow);
          })
      : mockDb.buscarEvento(id),

  criar: (dto: CriarEventoDto, usuarioId?: string): Promise<EventoDto> =>
    USE_SUPABASE
      ? criarSupabase(dto, usuarioId ?? '')
      : mockDb.criarEvento(dto),

  getStats: () =>
    USE_SUPABASE
      ? supabase
          .from('eventos')
          .select('tipo, severidade')
          .then(({ data }) => {
            const rows = (data ?? []) as { tipo: string; severidade: string }[];
            return {
              totalEventos: rows.length,
              eventosSemCiclo: 0,
              ciclosAtivos: 0,
              ciclosConcluidos: 0,
              porSeveridade: {
                CRITICA: rows.filter((r) => r.severidade === 'CRITICA').length,
                ALTA: rows.filter((r) => r.severidade === 'ALTA').length,
                MEDIA: rows.filter((r) => r.severidade === 'MEDIA').length,
                BAIXA: rows.filter((r) => r.severidade === 'BAIXA').length,
              },
              porTipo: {
                INCIDENTE: rows.filter((r) => r.tipo === 'INCIDENTE').length,
                QUASE_ACIDENTE: rows.filter((r) => r.tipo === 'QUASE_ACIDENTE').length,
                DESVIO: rows.filter((r) => r.tipo === 'DESVIO').length,
                OBSERVACAO: rows.filter((r) => r.tipo === 'OBSERVACAO').length,
                AUDITORIA: rows.filter((r) => r.tipo === 'AUDITORIA').length,
              },
            };
          })
      : mockDb.getStats(),
};
