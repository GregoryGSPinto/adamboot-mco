/**
 * Mock de Conversa Estruturada — dados realistas de CCQ ferroviário.
 *
 * PERSISTÊNCIA LOCAL:
 *   Mensagens salvas em localStorage.
 *   Enviar, marcar decisão, vincular requisito — tudo persiste.
 *   resetConversaDb() restaura ao estado original.
 */

const STORAGE_KEY = 'mco-conversa-db';

export type TipoMensagem = 'texto' | 'imagem' | 'arquivo' | 'sistema';

export interface Anexo {
  id: string;
  nome: string;
  tipo: 'imagem' | 'pdf' | 'planilha';
  tamanho: number;
  url: string;
  thumbUrl?: string;
}

export interface MensagemProjeto {
  id: string;
  projetoId: string;
  fase: number;
  autorId: string;
  autorNome: string;
  texto?: string;
  tipo: TipoMensagem;
  anexos: Anexo[];
  criadaEm: string;
  ehDecisao: boolean;
  requisitoVinculado?: string;
  respostaA?: string;
}

// ============================
// SEED DATA
// ============================

function m(
  id: string, projetoId: string, fase: number,
  autorId: string, autorNome: string, texto: string, criadaEm: string,
  overrides?: Partial<MensagemProjeto>,
): MensagemProjeto {
  return {
    id, projetoId, fase, autorId, autorNome, texto,
    tipo: 'texto', anexos: [], criadaEm, ehDecisao: false,
    ...overrides,
  };
}

function criarSeedMensagens(): MensagemProjeto[] {
  return [
    m('m001', 'proj-001', 1, 'user-gregory', 'Gregory',
      'Pessoal, vamos abrir o projeto sobre o freio manual dos GDE. Já é a terceira falha em 30 dias.',
      '2026-01-21T08:00:00Z'),
    m('m002', 'proj-001', 1, 'user-carlos', 'Carlos',
      'Eu peguei os registros da manutenção. Foram 7 paradas nos últimos 30 dias, todas na série GDE.',
      '2026-01-21T08:15:00Z'),
    m('m003', 'proj-001', 1, 'user-gregory', 'Gregory',
      'Perfeito. Então o problema é: freio manual não destravam completamente nos vagões série GDE, causando 7 paradas não programadas nos últimos 30 dias.',
      '2026-01-21T08:30:00Z', { ehDecisao: true }),
    m('m004', 'proj-001', 1, 'user-gregory', 'Gregory',
      'Escopo: Pátio Norte, Linha 3, vagões GDE-45000 a GDE-45050.',
      '2026-01-22T07:00:00Z', { ehDecisao: true }),
    m('m005', 'proj-001', 2, 'user-gregory', 'Gregory',
      'Fase 2 começou. Carlos, preciso que você meça o tempo de destravamento por turno. João, fotografa o estado das sapatas.',
      '2026-01-28T07:30:00Z'),
    m('m006', 'proj-001', 2, 'user-carlos', 'Carlos',
      'Medi turno A: média 12 segundos. Padrão é 8. Tá bem fora.',
      '2026-01-28T14:00:00Z'),
    m('m007', 'proj-001', 2, 'user-joao', 'João',
      'Sapata do vagão GDE-45012, olha o estado dessa peça.',
      '2026-01-29T09:00:00Z', {
        tipo: 'imagem',
        anexos: [{
          id: 'anx-001', nome: 'sapata-gde45012.jpg', tipo: 'imagem',
          tamanho: 2_400_000, url: '/mock/sapata-gde45012.jpg', thumbUrl: '/mock/sapata-gde45012-thumb.jpg',
        }],
      }),
    m('m008', 'proj-001', 2, 'user-gregory', 'Gregory',
      'Boa, João. Vou vincular como evidência de campo.',
      '2026-01-29T09:05:00Z', { respostaA: 'm007' }),
    m('m009', 'proj-001', 2, 'user-ana', 'Ana',
      'Fiz a estratificação. 80% das falhas concentram no turno B, vagões que passaram por manutenção na oficina externa.',
      '2026-02-01T10:00:00Z', { ehDecisao: true }),
    m('m010', 'proj-001', 2, 'user-gregory', 'Gregory',
      'Foco priorizado: vagões com manutenção externa, turno B.',
      '2026-02-02T08:00:00Z', { ehDecisao: true }),
    m('m011', 'proj-001', 3, 'user-gregory', 'Gregory',
      'Meta proposta: reduzir de 7 para 2 falhas/mês até 15 de março.',
      '2026-02-05T08:00:00Z', { ehDecisao: true }),
    m('m012', 'proj-001', 3, 'user-marcos', 'Marcos',
      'Meta aprovada. 2 falhas/mês é realista com as ações certas.',
      '2026-02-06T10:00:00Z', { ehDecisao: true }),
    m('m013', 'proj-001', 4, 'user-gregory', 'Gregory',
      'Pessoal, montei o Ishikawa ontem. Causas principais: material da sapata (fornecedor externo), procedimento de ajuste (turno B não segue padrão), e desgaste acelerado (excesso de frenagem no trecho curva km 8).',
      '2026-02-12T08:00:00Z'),
    m('m014', 'proj-001', 4, 'user-gregory', 'Gregory',
      'Carlos, preciso da medição de espessura da sapata nova vs usada. Isso comprova a causa do material.',
      '2026-02-14T07:30:00Z'),
    m('m015', 'proj-001', 4, 'user-carlos', 'Carlos',
      'Vou medir amanhã no turno B, aí já vejo o procedimento deles também.',
      '2026-02-14T08:00:00Z'),
    {
      id: 'm016', projetoId: 'proj-001', fase: 4,
      autorId: 'sistema', autorNome: 'Sistema MCO',
      texto: 'Faltam 4 requisitos para concluir esta fase: 5 Porquês, Evidência de Campo, Reunião de Validação, Aprovação do Facilitador.',
      tipo: 'sistema', anexos: [], criadaEm: '2026-02-15T00:00:00Z', ehDecisao: false,
    },
    m('m017', 'proj-001', 4, 'user-gregory', 'Gregory',
      'Carlos, a medição ficou pra quando? Marcos não vai aprovar sem evidência de campo.',
      '2026-02-18T07:00:00Z'),
  ];
}

// ============================
// PERSISTÊNCIA localStorage
// ============================

function loadDb(): MensagemProjeto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[MCO] Erro ao carregar conversas locais:', e);
  }
  const seed = criarSeedMensagens();
  persist(seed);
  return seed;
}

function persist(data: MensagemProjeto[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[MCO] Erro ao salvar conversas locais:', e);
  }
}

export function resetConversaDb(): void {
  const seed = criarSeedMensagens();
  mensagensDb.length = 0;
  mensagensDb.push(...seed);
  persist(mensagensDb);
  console.log('[MCO] Banco de conversas resetado.');
}

let mensagensDb: MensagemProjeto[] = loadDb();

// ============================
// OPERAÇÕES
// ============================

function delay(ms = 150): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 100));
}

export const mockConversaDb = {
  async listarMensagens(projetoId: string): Promise<MensagemProjeto[]> {
    await delay();
    return mensagensDb
      .filter((m) => m.projetoId === projetoId)
      .sort((a, b) => new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime());
  },

  async enviarMensagem(
    projetoId: string, autorId: string, autorNome: string,
    faseAtual: number, texto: string, anexos: Anexo[] = [], respostaA?: string,
  ): Promise<MensagemProjeto> {
    await delay(200);
    const nova: MensagemProjeto = {
      id: `m${String(mensagensDb.length + 1).padStart(3, '0')}`,
      projetoId, fase: faseAtual, autorId, autorNome, texto,
      tipo: anexos.length > 0 && anexos[0].tipo === 'imagem' ? 'imagem' : 'texto',
      anexos, criadaEm: new Date().toISOString(), ehDecisao: false, respostaA,
    };
    mensagensDb = [...mensagensDb, nova];
    persist(mensagensDb);
    return nova;
  },

  async marcarDecisao(mensagemId: string): Promise<MensagemProjeto> {
    await delay();
    const msg = mensagensDb.find((m) => m.id === mensagemId);
    if (!msg) throw new Error('Mensagem não encontrada');
    msg.ehDecisao = !msg.ehDecisao;
    persist(mensagensDb);
    return { ...msg };
  },

  async vincularRequisito(mensagemId: string, requisitoId: string): Promise<MensagemProjeto> {
    await delay();
    const msg = mensagensDb.find((m) => m.id === mensagemId);
    if (!msg) throw new Error('Mensagem não encontrada');
    msg.requisitoVinculado = requisitoId;
    persist(mensagensDb);
    return { ...msg };
  },

  async getDecisoes(projetoId: string): Promise<MensagemProjeto[]> {
    await delay();
    return mensagensDb
      .filter((m) => m.projetoId === projetoId && m.ehDecisao)
      .sort((a, b) => new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime());
  },

  async uploadFoto(nome: string): Promise<Anexo> {
    await delay(400);
    return {
      id: `anx-${Date.now()}`, nome, tipo: 'imagem',
      tamanho: Math.floor(Math.random() * 3_000_000) + 500_000,
      url: `/mock/${nome}`, thumbUrl: `/mock/${nome}`,
    };
  },
};
