/**
 * Mock DB — modelo centrado em PROJETOS e RESPONSABILIDADES.
 *
 * PERSISTÊNCIA LOCAL:
 *   Todos os dados são salvos em localStorage.
 *   Adicionar, excluir, marcar — tudo persiste entre sessões.
 *   Para resetar ao estado original: chamar resetProjetosDb().
 */

import type { ProjetoMelhoria, Membro, EvidenciaCumprida, AcaoProjeto } from '@shared/engine';
import {
  requisitosDaFase as getRequisitosFase,
  requisitosObrigatorios as getReqObrig,
} from '@shared/engine/requisitos-masp';

const STORAGE_KEY = 'mco-projetos-db';

// ============================
// MEMBROS
// ============================

export const MEMBROS: Membro[] = [
  { id: 'user-gregory', nome: 'Gregory', papel: 'lider' },
  { id: 'user-carlos', nome: 'Carlos', papel: 'membro' },
  { id: 'user-joao', nome: 'João', papel: 'membro' },
  { id: 'user-ana', nome: 'Ana', papel: 'membro' },
  { id: 'user-marcos', nome: 'Marcos', papel: 'facilitador' },
];

// ============================
// SEED DATA (estado inicial)
// ============================

function gerarEvidenciasCompletas(fase: number): EvidenciaCumprida[] {
  const reqs = getRequisitosFase(fase);
  return reqs.map(r => ({
    requisitoId: r.id,
    preenchidoPor: 'user-gregory',
    dataRegistro: '2025-12-01',
    aprovado: r.tipoValidacao === 'aprovacao' ? true : undefined,
  }));
}

function criarSeedData(): ProjetoMelhoria[] {
  return [
    {
      id: 'proj-001',
      titulo: 'Falha recorrente em freio manual — vagões série GDE',
      faseAtual: 4,
      dataInicio: '2026-01-20',
      dataApresentacao: '2026-03-15',
      liderId: 'user-gregory',
      facilitadorId: 'user-marcos',
      status: 'ativo',
      membros: [...MEMBROS],
      evidencias: [
        {
          requisitoId: 'F1_DESCRICAO_FACTUAL',
          preenchidoPor: 'user-gregory',
          dataRegistro: '2026-01-21',
        },
        {
          requisitoId: 'F1_INDICADOR_NUMERICO',
          preenchidoPor: 'user-carlos',
          dataRegistro: '2026-01-22',
        },
        { requisitoId: 'F1_ESCOPO', preenchidoPor: 'user-gregory', dataRegistro: '2026-01-22' },
        {
          requisitoId: 'F1_COMPOSICAO_GRUPO',
          preenchidoPor: 'user-gregory',
          dataRegistro: '2026-01-20',
        },
        {
          requisitoId: 'F2_ESTRATIFICACAO',
          preenchidoPor: 'user-carlos',
          dataRegistro: '2026-01-28',
        },
        { requisitoId: 'F2_DADOS_CAMPO', preenchidoPor: 'user-joao', dataRegistro: '2026-01-30' },
        {
          requisitoId: 'F2_GRAFICO_CONCENTRACAO',
          preenchidoPor: 'user-ana',
          dataRegistro: '2026-02-01',
        },
        {
          requisitoId: 'F2_FOCO_PRIORIZADO',
          preenchidoPor: 'user-gregory',
          dataRegistro: '2026-02-02',
        },
        {
          requisitoId: 'F2_REUNIAO_DESDOBRAMENTO',
          preenchidoPor: 'user-gregory',
          dataRegistro: '2026-02-02',
        },
        {
          requisitoId: 'F3_META_NUMERICA',
          preenchidoPor: 'user-gregory',
          dataRegistro: '2026-02-05',
        },
        { requisitoId: 'F3_PRAZO_META', preenchidoPor: 'user-gregory', dataRegistro: '2026-02-05' },
        {
          requisitoId: 'F3_JUSTIFICATIVA_META',
          preenchidoPor: 'user-gregory',
          dataRegistro: '2026-02-05',
        },
        {
          requisitoId: 'F3_APROVACAO_FACILITADOR',
          preenchidoPor: 'user-marcos',
          dataRegistro: '2026-02-06',
          aprovado: true,
        },
        { requisitoId: 'F4_ISHIKAWA', preenchidoPor: 'user-gregory', dataRegistro: '2026-02-12' },
      ],
      acoes: [],
    },
    {
      id: 'proj-002',
      titulo: 'Falha na sinalização sonora de locomotiva em manobra',
      faseAtual: 2,
      dataInicio: '2026-02-10',
      dataApresentacao: '2026-04-20',
      liderId: 'user-gregory',
      facilitadorId: 'user-marcos',
      status: 'ativo',
      membros: [
        { id: 'user-gregory', nome: 'Gregory', papel: 'lider' },
        { id: 'user-carlos', nome: 'Carlos', papel: 'membro' },
        { id: 'user-pedro', nome: 'Pedro', papel: 'membro' },
        { id: 'user-marcos', nome: 'Marcos', papel: 'facilitador' },
      ],
      evidencias: [
        {
          requisitoId: 'F1_DESCRICAO_FACTUAL',
          preenchidoPor: 'user-gregory',
          dataRegistro: '2026-02-11',
        },
        {
          requisitoId: 'F1_INDICADOR_NUMERICO',
          preenchidoPor: 'user-pedro',
          dataRegistro: '2026-02-12',
        },
        { requisitoId: 'F1_ESCOPO', preenchidoPor: 'user-gregory', dataRegistro: '2026-02-12' },
        {
          requisitoId: 'F1_COMPOSICAO_GRUPO',
          preenchidoPor: 'user-gregory',
          dataRegistro: '2026-02-10',
        },
        {
          requisitoId: 'F2_ESTRATIFICACAO',
          preenchidoPor: 'user-carlos',
          dataRegistro: '2026-02-16',
        },
      ],
      acoes: [],
    },
    {
      id: 'proj-003',
      titulo: 'Redução de tempo de troca de turno no pátio',
      faseAtual: 6,
      dataInicio: '2025-11-01',
      dataApresentacao: '2026-02-28',
      liderId: 'user-gregory',
      facilitadorId: 'user-marcos',
      status: 'atrasado',
      membros: [
        { id: 'user-gregory', nome: 'Gregory', papel: 'lider' },
        { id: 'user-joao', nome: 'João', papel: 'membro' },
        { id: 'user-ana', nome: 'Ana', papel: 'membro' },
        { id: 'user-marcos', nome: 'Marcos', papel: 'facilitador' },
      ],
      evidencias: [
        ...gerarEvidenciasCompletas(1),
        ...gerarEvidenciasCompletas(2),
        ...gerarEvidenciasCompletas(3),
        ...gerarEvidenciasCompletas(4),
        ...gerarEvidenciasCompletas(5),
        {
          requisitoId: 'F6_PERCENTUAL_EXECUCAO',
          preenchidoPor: 'user-gregory',
          dataRegistro: '2026-02-15',
        },
      ],
      acoes: [
        {
          id: 'acao-001',
          descricao: 'Instalar relógio digital na cabine de troca de turno',
          responsavelId: 'user-joao',
          dataPrevista: '2026-02-10',
          dataReal: '2026-02-09',
          status: 'concluido',
        },
        {
          id: 'acao-002',
          descricao: 'Criar checklist de passagem de turno padronizado',
          responsavelId: 'user-ana',
          dataPrevista: '2026-02-15',
          status: 'atrasado',
        },
        {
          id: 'acao-003',
          descricao: 'Treinar equipe do turno A no novo procedimento',
          responsavelId: 'user-gregory',
          dataPrevista: '2026-02-20',
          status: 'pendente',
        },
      ],
    },
  ];
}

// ============================
// PERSISTÊNCIA localStorage
// ============================

function loadDb(): ProjetoMelhoria[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 0) return parsed;
    }
  } catch (e) {
    console.warn('[MCO] Erro ao carregar dados locais, usando seed:', e);
  }
  // Primeira execução ou dados corrompidos → seed
  const seed = criarSeedData();
  persist(seed);
  return seed;
}

function persist(data: ProjetoMelhoria[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[MCO] Erro ao salvar dados locais:', e);
  }
}

/** Reseta o banco ao estado original (seed). Útil para debug. */
export function resetProjetosDb(): void {
  const seed = criarSeedData();
  projetosDb.length = 0;
  projetosDb.push(...seed);
  persist(projetosDb);
  console.log('[MCO] Banco de projetos resetado ao estado original.');
}

// Inicializa a partir do localStorage
const projetosDb: ProjetoMelhoria[] = loadDb();

// ============================
// OPERAÇÕES
// ============================

function delay(ms = 300): Promise<void> {
  return new Promise(r => setTimeout(r, ms + Math.random() * 150));
}

export const mockProjetosDb = {
  async listarProjetos(): Promise<ProjetoMelhoria[]> {
    await delay();
    return [...projetosDb];
  },

  async buscarProjeto(id: string): Promise<ProjetoMelhoria> {
    await delay();
    const p = projetosDb.find(p => p.id === id);
    if (!p) throw new Error(`Projeto ${id} não encontrado`);
    return { ...p };
  },

  async cumprirRequisito(
    projetoId: string,
    requisitoId: string,
    userId: string,
    aprovado?: boolean
  ): Promise<void> {
    await delay(400);
    const projeto = projetosDb.find(p => p.id === projetoId);
    if (!projeto) throw new Error('Projeto não encontrado');
    projeto.evidencias = projeto.evidencias.filter(e => e.requisitoId !== requisitoId);
    projeto.evidencias.push({
      requisitoId,
      preenchidoPor: userId,
      dataRegistro: new Date().toISOString().split('T')[0],
      aprovado,
    });
    persist(projetosDb);
  },

  async avancarFase(projetoId: string): Promise<ProjetoMelhoria> {
    await delay(500);
    const projeto = projetosDb.find(p => p.id === projetoId);
    if (!projeto) throw new Error('Projeto não encontrado');
    const obrig = getReqObrig(projeto.faseAtual);
    const evidenciaIds = new Set(projeto.evidencias.map(e => e.requisitoId));
    const faltantes = obrig.filter(r => {
      if (r.tipoValidacao === 'aprovacao') {
        const ev = projeto.evidencias.find(e => e.requisitoId === r.id);
        return !ev?.aprovado;
      }
      return !evidenciaIds.has(r.id);
    });
    if (faltantes.length > 0)
      throw new Error(`Ainda faltam ${faltantes.length} requisitos obrigatórios`);
    projeto.faseAtual += 1;
    if (projeto.faseAtual > 8) {
      projeto.faseAtual = 8;
      projeto.status = 'concluido';
    }
    persist(projetosDb);
    return { ...projeto };
  },

  async getStats() {
    await delay(200);
    return {
      totalProjetos: projetosDb.length,
      ativos: projetosDb.filter(p => p.status === 'ativo').length,
      atrasados: projetosDb.filter(p => p.status === 'atrasado').length,
      concluidos: projetosDb.filter(p => p.status === 'concluido').length,
    };
  },

  // ── CRUD: Evidências ──

  async removerEvidencia(projetoId: string, requisitoId: string): Promise<void> {
    await delay(300);
    const projeto = projetosDb.find(p => p.id === projetoId);
    if (!projeto) throw new Error('Projeto não encontrado');
    projeto.evidencias = projeto.evidencias.filter(e => e.requisitoId !== requisitoId);
    persist(projetosDb);
  },

  // ── CRUD: Ações ──

  async adicionarAcao(projetoId: string, acao: Omit<AcaoProjeto, 'id'>): Promise<AcaoProjeto> {
    await delay(300);
    const projeto = projetosDb.find(p => p.id === projetoId);
    if (!projeto) throw new Error('Projeto não encontrado');
    const nova: AcaoProjeto = { ...acao, id: `acao-${Date.now()}` };
    projeto.acoes.push(nova);
    persist(projetosDb);
    return nova;
  },

  async removerAcao(projetoId: string, acaoId: string): Promise<void> {
    await delay(300);
    const projeto = projetosDb.find(p => p.id === projetoId);
    if (!projeto) throw new Error('Projeto não encontrado');
    projeto.acoes = projeto.acoes.filter(a => a.id !== acaoId);
    persist(projetosDb);
  },

  async atualizarAcao(
    projetoId: string,
    acaoId: string,
    update: Partial<AcaoProjeto>
  ): Promise<void> {
    await delay(300);
    const projeto = projetosDb.find(p => p.id === projetoId);
    if (!projeto) throw new Error('Projeto não encontrado');
    const acao = projeto.acoes.find(a => a.id === acaoId);
    if (!acao) throw new Error('Ação não encontrada');
    Object.assign(acao, update);
    persist(projetosDb);
  },

  // ── CRUD: Projetos ──

  async adicionarProjeto(dados: {
    titulo: string;
    dataApresentacao: string;
    liderId: string;
    facilitadorId: string;
    membros: Membro[];
  }): Promise<ProjetoMelhoria> {
    await delay(400);
    const novo: ProjetoMelhoria = {
      id: `proj-${Date.now()}`,
      titulo: dados.titulo,
      faseAtual: 1,
      dataInicio: new Date().toISOString().split('T')[0],
      dataApresentacao: dados.dataApresentacao,
      liderId: dados.liderId,
      facilitadorId: dados.facilitadorId,
      membros: dados.membros,
      evidencias: [],
      acoes: [],
      status: 'ativo',
    };
    projetosDb.push(novo);
    persist(projetosDb);
    return novo;
  },

  async removerProjeto(projetoId: string): Promise<void> {
    await delay(300);
    const idx = projetosDb.findIndex(p => p.id === projetoId);
    if (idx < 0) throw new Error('Projeto não encontrado');
    projetosDb.splice(idx, 1);
    persist(projetosDb);
  },
};
