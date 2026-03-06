import { supabase, USE_SUPABASE } from '../supabase-client';

export interface AuditEntry {
  id: string;
  usuarioId: string | null;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  dadosAntes: unknown;
  dadosDepois: unknown;
  criadoEm: string;
}

interface AuditRow {
  id: string;
  usuario_id: string | null;
  acao: string;
  entidade: string;
  entidade_id: string | null;
  dados_antes: unknown;
  dados_depois: unknown;
  criado_em: string;
}

function toAuditEntry(row: AuditRow): AuditEntry {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    acao: row.acao,
    entidade: row.entidade,
    entidadeId: row.entidade_id,
    dadosAntes: row.dados_antes,
    dadosDepois: row.dados_depois,
    criadoEm: row.criado_em,
  };
}

async function listarSupabase(params?: {
  entidade?: string;
  limit?: number;
}): Promise<AuditEntry[]> {
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(params?.limit ?? 100);

  if (params?.entidade) {
    query = query.eq('entidade', params.entidade);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as AuditRow[]).map(toAuditEntry);
}

async function registrarSupabase(entry: {
  usuarioId: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  dadosAntes?: unknown;
  dadosDepois?: unknown;
}): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    usuario_id: entry.usuarioId,
    acao: entry.acao,
    entidade: entry.entidade,
    entidade_id: entry.entidadeId ?? null,
    dados_antes: entry.dadosAntes ?? null,
    dados_depois: entry.dadosDepois ?? null,
  });

  if (error) throw error;
}

// Mock local
const mockAuditLog: AuditEntry[] = [];

export const auditApi = {
  listar: (params?: { entidade?: string; limit?: number }): Promise<AuditEntry[]> =>
    USE_SUPABASE ? listarSupabase(params) : Promise.resolve(mockAuditLog),

  registrar: (entry: {
    usuarioId: string;
    acao: string;
    entidade: string;
    entidadeId?: string;
    dadosAntes?: unknown;
    dadosDepois?: unknown;
  }): Promise<void> =>
    USE_SUPABASE
      ? registrarSupabase(entry)
      : Promise.resolve(void mockAuditLog.push({
          id: `audit-${Date.now()}`,
          usuarioId: entry.usuarioId,
          acao: entry.acao,
          entidade: entry.entidade,
          entidadeId: entry.entidadeId ?? null,
          dadosAntes: entry.dadosAntes,
          dadosDepois: entry.dadosDepois,
          criadoEm: new Date().toISOString(),
        })),
};
