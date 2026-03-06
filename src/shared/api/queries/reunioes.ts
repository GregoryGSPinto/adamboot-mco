import { supabase, USE_SUPABASE } from '../supabase-client';

export interface Reuniao {
  id: string;
  projetoId: string;
  titulo: string;
  tipo: 'ordinaria' | 'extraordinaria' | 'apresentacao' | 'facilitador';
  dataHora: string;
  duracaoMin: number;
  local: string;
  pauta: string;
  ata: string;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  criadoPor: string;
}

interface ReuniaoRow {
  id: string;
  projeto_id: string;
  titulo: string;
  tipo: string;
  data_hora: string;
  duracao_min: number;
  local: string | null;
  pauta: string | null;
  ata: string | null;
  status: string;
  criado_por: string;
}

function toReuniao(row: ReuniaoRow): Reuniao {
  return {
    id: row.id,
    projetoId: row.projeto_id,
    titulo: row.titulo,
    tipo: row.tipo as Reuniao['tipo'],
    dataHora: row.data_hora,
    duracaoMin: row.duracao_min,
    local: row.local ?? '',
    pauta: row.pauta ?? '',
    ata: row.ata ?? '',
    status: row.status as Reuniao['status'],
    criadoPor: row.criado_por,
  };
}

// Mock local (quando Supabase desativado)
const mockReunioes: Reuniao[] = [];

async function listarSupabase(projetoId: string): Promise<Reuniao[]> {
  const { data, error } = await supabase
    .from('reunioes')
    .select('*')
    .eq('projeto_id', projetoId)
    .order('data_hora', { ascending: false });

  if (error) throw error;
  return (data as ReuniaoRow[]).map(toReuniao);
}

async function criarSupabase(reuniao: Omit<Reuniao, 'id'>): Promise<Reuniao> {
  const { data, error } = await supabase
    .from('reunioes')
    .insert({
      projeto_id: reuniao.projetoId,
      titulo: reuniao.titulo,
      tipo: reuniao.tipo,
      data_hora: reuniao.dataHora,
      duracao_min: reuniao.duracaoMin,
      local: reuniao.local || null,
      pauta: reuniao.pauta || null,
      status: reuniao.status,
      criado_por: reuniao.criadoPor,
    })
    .select()
    .single();

  if (error) throw error;
  return toReuniao(data as ReuniaoRow);
}

export const reunioesApi = {
  listar: (projetoId: string): Promise<Reuniao[]> =>
    USE_SUPABASE
      ? listarSupabase(projetoId)
      : Promise.resolve(mockReunioes.filter((r) => r.projetoId === projetoId)),

  criar: (reuniao: Omit<Reuniao, 'id'>): Promise<Reuniao> =>
    USE_SUPABASE
      ? criarSupabase(reuniao)
      : Promise.resolve({ ...reuniao, id: `reu-${Date.now()}` }),
};
