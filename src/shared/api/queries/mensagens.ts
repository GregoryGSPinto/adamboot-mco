import { supabase, USE_SUPABASE } from '../supabase-client';
import { mockConversaDb, type MensagemProjeto, type Anexo } from '../mock-conversa';

interface MensagemRow {
  id: string;
  projeto_id: string;
  fase: number;
  autor_id: string;
  autor_nome: string;
  texto: string | null;
  tipo: string;
  eh_decisao: boolean;
  requisito_vinculado: string | null;
  resposta_a: string | null;
  criada_em: string;
}

function toMensagem(row: MensagemRow): MensagemProjeto {
  return {
    id: row.id,
    projetoId: row.projeto_id,
    fase: row.fase,
    autorId: row.autor_id,
    autorNome: row.autor_nome,
    texto: row.texto ?? undefined,
    tipo: row.tipo as MensagemProjeto['tipo'],
    anexos: [],
    criadaEm: row.criada_em,
    ehDecisao: row.eh_decisao,
    requisitoVinculado: row.requisito_vinculado ?? undefined,
    respostaA: row.resposta_a ?? undefined,
  };
}

async function listarSupabase(projetoId: string): Promise<MensagemProjeto[]> {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .eq('projeto_id', projetoId)
    .order('criada_em', { ascending: true });

  if (error) throw error;
  return (data as MensagemRow[]).map(toMensagem);
}

async function enviarSupabase(
  projetoId: string,
  autorId: string,
  autorNome: string,
  faseAtual: number,
  texto: string,
  _anexos: Anexo[] = [],
  respostaA?: string,
): Promise<MensagemProjeto> {
  const { data, error } = await supabase
    .from('mensagens')
    .insert({
      projeto_id: projetoId,
      fase: faseAtual,
      autor_id: autorId,
      autor_nome: autorNome,
      texto,
      tipo: 'texto',
      resposta_a: respostaA ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return toMensagem(data as MensagemRow);
}

async function marcarDecisaoSupabase(mensagemId: string): Promise<MensagemProjeto> {
  const { data: current } = await supabase
    .from('mensagens')
    .select('eh_decisao')
    .eq('id', mensagemId)
    .single();

  const { data, error } = await supabase
    .from('mensagens')
    .update({ eh_decisao: !(current as { eh_decisao: boolean })?.eh_decisao })
    .eq('id', mensagemId)
    .select()
    .single();

  if (error) throw error;
  return toMensagem(data as MensagemRow);
}

async function getDecisoesSupabase(projetoId: string): Promise<MensagemProjeto[]> {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .eq('projeto_id', projetoId)
    .eq('eh_decisao', true)
    .order('criada_em', { ascending: true });

  if (error) throw error;
  return (data as MensagemRow[]).map(toMensagem);
}

export const mensagensApi = {
  listar: (projetoId: string): Promise<MensagemProjeto[]> =>
    USE_SUPABASE
      ? listarSupabase(projetoId)
      : mockConversaDb.listarMensagens(projetoId),

  enviar: (
    projetoId: string,
    autorId: string,
    autorNome: string,
    faseAtual: number,
    texto: string,
    anexos?: Anexo[],
    respostaA?: string,
  ): Promise<MensagemProjeto> =>
    USE_SUPABASE
      ? enviarSupabase(projetoId, autorId, autorNome, faseAtual, texto, anexos, respostaA)
      : mockConversaDb.enviarMensagem(projetoId, autorId, autorNome, faseAtual, texto, anexos, respostaA),

  marcarDecisao: (mensagemId: string): Promise<MensagemProjeto> =>
    USE_SUPABASE
      ? marcarDecisaoSupabase(mensagemId)
      : mockConversaDb.marcarDecisao(mensagemId),

  getDecisoes: (projetoId: string): Promise<MensagemProjeto[]> =>
    USE_SUPABASE
      ? getDecisoesSupabase(projetoId)
      : mockConversaDb.getDecisoes(projetoId),
};
