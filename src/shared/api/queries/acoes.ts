import { supabase, USE_SUPABASE } from '../supabase-client';
import { mockProjetosDb } from '../mock-projetos';
import type { AcaoProjeto } from '@shared/engine';

interface AcaoRow {
  id: string;
  projeto_id: string;
  descricao: string;
  responsavel_id: string;
  data_prevista: string;
  data_real: string | null;
  status: string;
  observacao: string | null;
}

function toAcao(row: AcaoRow): AcaoProjeto {
  return {
    id: row.id,
    descricao: row.descricao,
    responsavelId: row.responsavel_id,
    dataPrevista: row.data_prevista,
    dataReal: row.data_real ?? undefined,
    status: row.status as AcaoProjeto['status'],
  };
}

async function listarSupabase(projetoId: string): Promise<AcaoProjeto[]> {
  const { data, error } = await supabase
    .from('acoes')
    .select('*')
    .eq('projeto_id', projetoId)
    .order('data_prevista', { ascending: true });

  if (error) throw error;
  return (data as AcaoRow[]).map(toAcao);
}

async function adicionarSupabase(projetoId: string, acao: Omit<AcaoProjeto, 'id'>): Promise<AcaoProjeto> {
  const { data, error } = await supabase
    .from('acoes')
    .insert({
      projeto_id: projetoId,
      descricao: acao.descricao,
      responsavel_id: acao.responsavelId,
      data_prevista: acao.dataPrevista,
      data_real: acao.dataReal ?? null,
      status: acao.status,
    })
    .select()
    .single();

  if (error) throw error;
  return toAcao(data as AcaoRow);
}

async function atualizarSupabase(
  _projetoId: string,
  acaoId: string,
  update: Partial<AcaoProjeto>,
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (update.descricao !== undefined) payload.descricao = update.descricao;
  if (update.responsavelId !== undefined) payload.responsavel_id = update.responsavelId;
  if (update.dataPrevista !== undefined) payload.data_prevista = update.dataPrevista;
  if (update.dataReal !== undefined) payload.data_real = update.dataReal;
  if (update.status !== undefined) payload.status = update.status;

  const { error } = await supabase
    .from('acoes')
    .update(payload)
    .eq('id', acaoId);

  if (error) throw error;
}

async function removerSupabase(_projetoId: string, acaoId: string): Promise<void> {
  const { error } = await supabase.from('acoes').delete().eq('id', acaoId);
  if (error) throw error;
}

export const acoesApi = {
  listar: (projetoId: string): Promise<AcaoProjeto[]> =>
    USE_SUPABASE
      ? listarSupabase(projetoId)
      : mockProjetosDb.buscarProjeto(projetoId).then((p) => p.acoes),

  adicionar: (projetoId: string, acao: Omit<AcaoProjeto, 'id'>): Promise<AcaoProjeto> =>
    USE_SUPABASE
      ? adicionarSupabase(projetoId, acao)
      : mockProjetosDb.adicionarAcao(projetoId, acao),

  atualizar: (projetoId: string, acaoId: string, update: Partial<AcaoProjeto>): Promise<void> =>
    USE_SUPABASE
      ? atualizarSupabase(projetoId, acaoId, update)
      : mockProjetosDb.atualizarAcao(projetoId, acaoId, update),

  remover: (projetoId: string, acaoId: string): Promise<void> =>
    USE_SUPABASE
      ? removerSupabase(projetoId, acaoId)
      : mockProjetosDb.removerAcao(projetoId, acaoId),
};
