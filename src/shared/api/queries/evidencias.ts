import { supabase, USE_SUPABASE } from '../supabase-client';
import { mockProjetosDb } from '../mock-projetos';
import type { EvidenciaCumprida } from '@shared/engine';

interface EvidenciaRow {
  id: string;
  projeto_id: string;
  requisito_id: string;
  preenchido_por: string;
  data_registro: string;
  aprovado: boolean | null;
  observacao: string | null;
  arquivo_url: string | null;
}

function toEvidencia(row: EvidenciaRow): EvidenciaCumprida {
  return {
    requisitoId: row.requisito_id,
    preenchidoPor: row.preenchido_por,
    dataRegistro: row.data_registro,
    aprovado: row.aprovado ?? undefined,
  };
}

async function listarSupabase(projetoId: string): Promise<EvidenciaCumprida[]> {
  const { data, error } = await supabase
    .from('evidencias')
    .select('*')
    .eq('projeto_id', projetoId);

  if (error) throw error;
  return (data as EvidenciaRow[]).map(toEvidencia);
}

async function cumprirSupabase(
  projetoId: string,
  requisitoId: string,
  userId: string,
  aprovado?: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('evidencias')
    .upsert(
      {
        projeto_id: projetoId,
        requisito_id: requisitoId,
        preenchido_por: userId,
        data_registro: new Date().toISOString().split('T')[0],
        aprovado: aprovado ?? null,
      },
      { onConflict: 'projeto_id,requisito_id' },
    );

  if (error) throw error;
}

async function removerSupabase(projetoId: string, requisitoId: string): Promise<void> {
  const { error } = await supabase
    .from('evidencias')
    .delete()
    .eq('projeto_id', projetoId)
    .eq('requisito_id', requisitoId);

  if (error) throw error;
}

export const evidenciasApi = {
  listar: (projetoId: string): Promise<EvidenciaCumprida[]> =>
    USE_SUPABASE
      ? listarSupabase(projetoId)
      : mockProjetosDb.buscarProjeto(projetoId).then((p) => p.evidencias),

  cumprir: (projetoId: string, requisitoId: string, userId: string, aprovado?: boolean): Promise<void> =>
    USE_SUPABASE
      ? cumprirSupabase(projetoId, requisitoId, userId, aprovado)
      : mockProjetosDb.cumprirRequisito(projetoId, requisitoId, userId, aprovado),

  remover: (projetoId: string, requisitoId: string): Promise<void> =>
    USE_SUPABASE
      ? removerSupabase(projetoId, requisitoId)
      : mockProjetosDb.removerEvidencia(projetoId, requisitoId),
};
