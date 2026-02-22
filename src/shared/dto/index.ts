/**
 * DTOs compartilhados — espelham os contratos da API backend.
 * Cada módulo pode ter DTOs adicionais específicos.
 */

// ============================
// EVENTO
// ============================

export type TipoEvento =
  | 'INCIDENTE'
  | 'QUASE_ACIDENTE'
  | 'DESVIO'
  | 'OBSERVACAO'
  | 'AUDITORIA';

export type SeveridadeEvento = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export interface EventoDto {
  id: string;
  data: string;
  local: string;
  descricao: string;
  tipo: TipoEvento;
  severidade: SeveridadeEvento;
  usuarioId: string;
  evidenciaIds: string[];
  cicloMelhoriaId: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CriarEventoDto {
  data: string;
  local: string;
  descricao: string;
  tipo: TipoEvento;
  severidade: SeveridadeEvento;
}

// ============================
// CICLO DE MELHORIA
// ============================

export type FaseCiclo =
  | 'REGISTRO'
  | 'CLASSIFICACAO'
  | 'INVESTIGACAO'
  | 'CAUSA_RAIZ'
  | 'CONTRAMEDIDA'
  | 'ACAO_CORRETIVA'
  | 'VERIFICACAO'
  | 'PADRONIZACAO';

export type StatusCiclo = 'ATIVO' | 'CONCLUIDO' | 'CANCELADO';

export interface CicloDto {
  id: string;
  titulo: string;
  descricao: string;
  responsavelId: string;
  eventoOrigemId: string;
  faseAtual: FaseCiclo;
  faseNumero: number;
  status: StatusCiclo;
  eventoIds: string[];
  investigacaoId: string | null;
  acaoIds: string[];
  evidenciaIds: string[];
  conhecimentoId: string | null;
  historicoFases: TransicaoFaseDto[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface TransicaoFaseDto {
  faseDe: FaseCiclo;
  fasePara: FaseCiclo;
  data: string;
  usuarioId: string;
  observacao?: string;
}

export interface CriarCicloDto {
  titulo: string;
  descricao: string;
  eventoOrigemId: string;
}

export interface AvancarFaseDto {
  observacao?: string;
}

// ============================
// EVIDÊNCIA
// ============================

export interface EvidenciaDto {
  id: string;
  nomeOriginal: string;
  mimeType: string;
  tamanhoBytes: number;
  eventoId: string;
  caminho: string;
  criadoEm: string;
}

// ============================
// API RESPONSE WRAPPER
// ============================

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}
