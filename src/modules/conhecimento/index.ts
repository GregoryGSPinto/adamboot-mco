/**
 * MÓDULO CONHECIMENTO — Acervo de projetos e lições aprendidas.
 *
 * Checklist:
 *   [x] Busca por projetos antigos (20)
 *   [x] Sugestões baseadas em falhas recorrentes (20)
 *   [x] Novo procedimento (10)
 *   [x] Lição aprendida (10)
 *   [x] Encerrar projeto (10)
 *   [x] Arquivar projetos encerrados (14)
 *   [x] Histórico de projetos do grupo (14)
 */

import { auditLog } from '@modules/audit';

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type ProjetoStatusFinal = 'concluido' | 'arquivado' | 'cancelado';

export interface LicaoAprendida {
  id: string;
  projectId: string;
  projectName: string;
  fase: number;
  categoria: string; // 'causa_raiz' | 'acao_efetiva' | 'erro_evitar' | 'boas_praticas'
  titulo: string;
  descricao: string;
  tags: string[];
  criadoPor: string;
  criadoEm: string;
}

export interface Procedimento {
  id: string;
  projectId: string;
  titulo: string;
  descricao: string;
  passos: string[];
  aprovadoPor?: string;
  criadoEm: string;
  versao: number;
}

export interface ProjetoArquivado {
  projectId: string;
  projectName: string;
  statusFinal: ProjetoStatusFinal;
  dataInicio: string;
  dataFim: string;
  faseAlcancada: number;
  totalFases: number;
  membros: string[];
  licoes: LicaoAprendida[];
  procedimentos: Procedimento[];
  arquivadoEm: string;
  arquivadoPor: string;
}

export interface SugestaoConhecimento {
  tipo: 'licao' | 'procedimento' | 'projeto_similar';
  titulo: string;
  descricao: string;
  projectIdOrigem: string;
  projectNameOrigem: string;
  relevancia: number; // 0-1
}

// ════════════════════════════════════
// STORE
// ════════════════════════════════════

const _licoes: LicaoAprendida[] = [];
const _procedimentos: Procedimento[] = [];
const _arquivados: ProjetoArquivado[] = [];
let _counter = 0;

function genId(prefix: string): string {
  _counter++;
  return `${prefix}-${Date.now()}-${_counter}`;
}

// ════════════════════════════════════
// API — LIÇÕES APRENDIDAS
// ════════════════════════════════════

export function registrarLicao(params: {
  projectId: string;
  projectName: string;
  fase: number;
  categoria: string;
  titulo: string;
  descricao: string;
  tags: string[];
  userId: string;
  userName: string;
}): LicaoAprendida {
  const licao: LicaoAprendida = {
    id: genId('licao'),
    projectId: params.projectId,
    projectName: params.projectName,
    fase: params.fase,
    categoria: params.categoria,
    titulo: params.titulo,
    descricao: params.descricao,
    tags: params.tags,
    criadoPor: params.userId,
    criadoEm: new Date().toISOString(),
  };

  _licoes.push(licao);
  return licao;
}

export function buscarLicoes(query: string): LicaoAprendida[] {
  const q = query.toLowerCase();
  return _licoes.filter(
    (l) =>
      l.titulo.toLowerCase().includes(q) ||
      l.descricao.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

export function getLicoes(projectId?: string): LicaoAprendida[] {
  if (projectId) return _licoes.filter((l) => l.projectId === projectId);
  return [..._licoes];
}

// ════════════════════════════════════
// API — PROCEDIMENTOS
// ════════════════════════════════════

export function registrarProcedimento(params: {
  projectId: string;
  titulo: string;
  descricao: string;
  passos: string[];
  userId: string;
}): Procedimento {
  const proc: Procedimento = {
    id: genId('proc'),
    projectId: params.projectId,
    titulo: params.titulo,
    descricao: params.descricao,
    passos: params.passos,
    criadoEm: new Date().toISOString(),
    versao: 1,
  };

  _procedimentos.push(proc);
  return proc;
}

export function getProcedimentos(projectId?: string): Procedimento[] {
  if (projectId) return _procedimentos.filter((p) => p.projectId === projectId);
  return [..._procedimentos];
}

// ════════════════════════════════════
// API — ARQUIVAMENTO
// ════════════════════════════════════

export function arquivarProjeto(params: {
  projectId: string;
  projectName: string;
  statusFinal: ProjetoStatusFinal;
  dataInicio: string;
  faseAlcancada: number;
  totalFases: number;
  membros: string[];
  userId: string;
  userName: string;
}): ProjetoArquivado {
  const arquivo: ProjetoArquivado = {
    projectId: params.projectId,
    projectName: params.projectName,
    statusFinal: params.statusFinal,
    dataInicio: params.dataInicio,
    dataFim: new Date().toISOString().split('T')[0],
    faseAlcancada: params.faseAlcancada,
    totalFases: params.totalFases,
    membros: params.membros,
    licoes: _licoes.filter((l) => l.projectId === params.projectId),
    procedimentos: _procedimentos.filter((p) => p.projectId === params.projectId),
    arquivadoEm: new Date().toISOString(),
    arquivadoPor: params.userId,
  };

  _arquivados.push(arquivo);

  auditLog({
    userId: params.userId,
    userName: params.userName,
    action: 'projeto_arquivado',
    projectId: params.projectId,
    projectName: params.projectName,
    description: `Projeto ${params.statusFinal}: ${params.projectName}`,
  });

  return arquivo;
}

export function restaurarProjeto(
  projectId: string,
  userId: string,
  userName: string,
): ProjetoArquivado | null {
  const idx = _arquivados.findIndex((a) => a.projectId === projectId);
  if (idx < 0) return null;

  const arquivo = _arquivados[idx];
  _arquivados.splice(idx, 1);

  auditLog({
    userId,
    userName,
    action: 'projeto_restaurado',
    projectId,
    projectName: arquivo.projectName,
    description: `Projeto restaurado: ${arquivo.projectName}`,
  });

  return arquivo;
}

export function getProjetosArquivados(): ProjetoArquivado[] {
  return [..._arquivados].sort((a, b) => b.arquivadoEm.localeCompare(a.arquivadoEm));
}

export function buscarProjetos(query: string): ProjetoArquivado[] {
  const q = query.toLowerCase();
  return _arquivados.filter(
    (a) =>
      a.projectName.toLowerCase().includes(q) ||
      a.membros.some((m) => m.toLowerCase().includes(q)),
  );
}

// ════════════════════════════════════
// API — SUGESTÕES INTELIGENTES
// ════════════════════════════════════

/**
 * Buscar sugestões baseadas em falhas recorrentes.
 * Compara problema atual com histórico de lições e projetos.
 */
export function buscarSugestoes(params: {
  problema: string;
  fase: number;
  tags?: string[];
}): SugestaoConhecimento[] {
  const q = params.problema.toLowerCase();
  const sugestoes: SugestaoConhecimento[] = [];

  // Buscar lições relevantes
  _licoes.forEach((l) => {
    const match =
      l.titulo.toLowerCase().includes(q) ||
      l.descricao.toLowerCase().includes(q) ||
      l.tags.some((t) => q.includes(t.toLowerCase()));

    if (match) {
      sugestoes.push({
        tipo: 'licao',
        titulo: l.titulo,
        descricao: l.descricao,
        projectIdOrigem: l.projectId,
        projectNameOrigem: l.projectName,
        relevancia: l.fase === params.fase ? 0.9 : 0.6,
      });
    }
  });

  // Buscar projetos similares
  _arquivados.forEach((a) => {
    if (a.projectName.toLowerCase().includes(q)) {
      sugestoes.push({
        tipo: 'projeto_similar',
        titulo: a.projectName,
        descricao: `${a.statusFinal} — Fase ${a.faseAlcancada}/${a.totalFases}`,
        projectIdOrigem: a.projectId,
        projectNameOrigem: a.projectName,
        relevancia: 0.5,
      });
    }
  });

  return sugestoes.sort((a, b) => b.relevancia - a.relevancia);
}
