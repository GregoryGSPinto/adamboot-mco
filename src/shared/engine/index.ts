export {
  REQUISITOS_MASP,
  requisitosDaFase,
  requisitosObrigatorios,
  FASE_LABELS,
  FASE_LABELS_CURTOS,
  TOTAL_FASES,
} from './requisitos-masp';
export type { RequisitoFase, TipoValidacao, ResponsavelTipo } from './requisitos-masp';

export { calcularStatusProjeto } from './phase-engine';
export type {
  ProjetoMelhoria,
  Membro,
  EvidenciaCumprida,
  AcaoProjeto,
  StatusProjeto,
  BloqueioFase,
  RequisitoPendente,
  MensagemIA,
  NivelRisco,
} from './phase-engine';
