import { supabase, USE_SUPABASE } from '../supabase-client';
import { mockProjetosDb } from '../mock-projetos';
import type { ProjetoMelhoria, Membro, EvidenciaCumprida, AcaoProjeto } from '@shared/engine';

// ============================
// Tipos do Supabase (DB rows)
// ============================

interface ProjetoRow {
  id: string;
  titulo: string;
  descricao: string | null;
  fase_atual: number;
  status: string;
  data_inicio: string;
  data_apresentacao: string | null;
  lider_id: string;
  facilitador_id: string | null;
}

interface MembroRow {
  usuario_id: string;
  papel: string;
  profiles: { id: string; nome: string };
}

interface EvidenciaRow {
  requisito_id: string;
  preenchido_por: string;
  data_registro: string;
  aprovado: boolean | null;
}

interface AcaoRow {
  id: string;
  descricao: string;
  responsavel_id: string;
  data_prevista: string;
  data_real: string | null;
  status: string;
}

// ============================
// Conversores
// ============================

function toMembro(row: MembroRow): Membro {
  return {
    id: row.usuario_id,
    nome: row.profiles.nome,
    papel: row.papel as Membro['papel'],
  };
}

function toEvidencia(row: EvidenciaRow): EvidenciaCumprida {
  return {
    requisitoId: row.requisito_id,
    preenchidoPor: row.preenchido_por,
    dataRegistro: row.data_registro,
    aprovado: row.aprovado ?? undefined,
  };
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

// ============================
// Queries Supabase
// ============================

async function listarProjetosSupabase(): Promise<ProjetoMelhoria[]> {
  const { data: projetos, error } = await supabase
    .from('projetos')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) throw error;

  const result: ProjetoMelhoria[] = [];

  for (const p of projetos as ProjetoRow[]) {
    const { data: membrosData } = await supabase
      .from('projeto_membros')
      .select('usuario_id, papel, profiles(id, nome)')
      .eq('projeto_id', p.id);

    const { data: evidenciasData } = await supabase
      .from('evidencias')
      .select('requisito_id, preenchido_por, data_registro, aprovado')
      .eq('projeto_id', p.id);

    const { data: acoesData } = await supabase
      .from('acoes')
      .select('id, descricao, responsavel_id, data_prevista, data_real, status')
      .eq('projeto_id', p.id);

    result.push({
      id: p.id,
      titulo: p.titulo,
      faseAtual: p.fase_atual,
      dataInicio: p.data_inicio,
      dataApresentacao: p.data_apresentacao ?? '',
      liderId: p.lider_id,
      facilitadorId: p.facilitador_id ?? '',
      status: p.status as ProjetoMelhoria['status'],
      membros: (membrosData as unknown as MembroRow[])?.map(toMembro) ?? [],
      evidencias: (evidenciasData as EvidenciaRow[])?.map(toEvidencia) ?? [],
      acoes: (acoesData as AcaoRow[])?.map(toAcao) ?? [],
    });
  }

  return result;
}

async function buscarProjetoSupabase(id: string): Promise<ProjetoMelhoria> {
  const { data: p, error } = await supabase
    .from('projetos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  const row = p as ProjetoRow;

  const { data: membrosData } = await supabase
    .from('projeto_membros')
    .select('usuario_id, papel, profiles(id, nome)')
    .eq('projeto_id', id);

  const { data: evidenciasData } = await supabase
    .from('evidencias')
    .select('requisito_id, preenchido_por, data_registro, aprovado')
    .eq('projeto_id', id);

  const { data: acoesData } = await supabase
    .from('acoes')
    .select('id, descricao, responsavel_id, data_prevista, data_real, status')
    .eq('projeto_id', id);

  return {
    id: row.id,
    titulo: row.titulo,
    faseAtual: row.fase_atual,
    dataInicio: row.data_inicio,
    dataApresentacao: row.data_apresentacao ?? '',
    liderId: row.lider_id,
    facilitadorId: row.facilitador_id ?? '',
    status: row.status as ProjetoMelhoria['status'],
    membros: (membrosData as unknown as MembroRow[])?.map(toMembro) ?? [],
    evidencias: (evidenciasData as EvidenciaRow[])?.map(toEvidencia) ?? [],
    acoes: (acoesData as AcaoRow[])?.map(toAcao) ?? [],
  };
}

// ============================
// API Publica (feature flag)
// ============================

export const projetosApi = {
  listar: (): Promise<ProjetoMelhoria[]> =>
    USE_SUPABASE ? listarProjetosSupabase() : mockProjetosDb.listarProjetos(),

  buscar: (id: string): Promise<ProjetoMelhoria> =>
    USE_SUPABASE ? buscarProjetoSupabase(id) : mockProjetosDb.buscarProjeto(id),

  avancarFase: (projetoId: string): Promise<ProjetoMelhoria> =>
    USE_SUPABASE
      ? avancarFaseSupabase(projetoId)
      : mockProjetosDb.avancarFase(projetoId),

  getStats: () =>
    USE_SUPABASE ? getStatsSupabase() : mockProjetosDb.getStats(),
};

async function avancarFaseSupabase(projetoId: string): Promise<ProjetoMelhoria> {
  const projeto = await buscarProjetoSupabase(projetoId);
  const novaFase = Math.min(projeto.faseAtual + 1, 8);
  const novoStatus = novaFase >= 8 ? 'concluido' : projeto.status;

  const { error } = await supabase
    .from('projetos')
    .update({ fase_atual: novaFase, status: novoStatus })
    .eq('id', projetoId);

  if (error) throw error;

  await supabase.from('historico_fases').insert({
    projeto_id: projetoId,
    fase_de: projeto.faseAtual,
    fase_para: novaFase,
    usuario_id: projeto.liderId,
    observacao: `Avancado para fase ${novaFase}`,
  });

  return buscarProjetoSupabase(projetoId);
}

async function getStatsSupabase() {
  const { data, error } = await supabase.from('projetos').select('status');
  if (error) throw error;
  const rows = data as { status: string }[];
  return {
    totalProjetos: rows.length,
    ativos: rows.filter((r) => r.status === 'ativo').length,
    atrasados: rows.filter((r) => r.status === 'atrasado').length,
    concluidos: rows.filter((r) => r.status === 'concluido').length,
  };
}
