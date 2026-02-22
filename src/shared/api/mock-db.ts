import type {
  EventoDto,
  CicloDto,
  CriarEventoDto,
  CriarCicloDto,
  FaseCiclo,
  EvidenciaDto,
} from '@shared/dto';

/**
 * Mock DB — simula backend MCO com dados reais de ferrovia.
 * Ativado automaticamente quando VITE_DEV_AUTH=true.
 *
 * Dados baseados em cenários reais de CCQ ferroviário:
 *   - Inspeção de freios
 *   - Desgaste de trilhos
 *   - Quase-acidentes em pátio
 *   - Desvio em procedimento de manutenção
 */

// ============================
// EVENTOS (Ocorrências)
// ============================

let eventosDb: EventoDto[] = [
  {
    id: 'evt-001',
    data: '2026-02-15T08:30:00.000Z',
    local: 'Pátio Norte — Linha 3, Desvio T-12',
    descricao: 'Freio manual do vagão GDE-45012 não destravou completamente durante inspeção pré-partida. Trem aguardou 22min para troca do vagão.',
    tipo: 'INCIDENTE',
    severidade: 'ALTA',
    usuarioId: 'dev-user-001',
    evidenciaIds: ['evi-001'],
    cicloMelhoriaId: 'ciclo-001',
    criadoEm: '2026-02-15T08:35:00.000Z',
    atualizadoEm: '2026-02-15T08:35:00.000Z',
  },
  {
    id: 'evt-002',
    data: '2026-02-16T14:10:00.000Z',
    local: 'Oficina Central — Box 7',
    descricao: 'Mecânico detectou desgaste anormal na sapata de freio do truque dianteiro. Componente com 40% da vida útil restante mas apresentando trincas laterais.',
    tipo: 'DESVIO',
    severidade: 'MEDIA',
    usuarioId: 'dev-user-001',
    evidenciaIds: ['evi-002'],
    cicloMelhoriaId: null,
    criadoEm: '2026-02-16T14:15:00.000Z',
    atualizadoEm: '2026-02-16T14:15:00.000Z',
  },
  {
    id: 'evt-003',
    data: '2026-02-17T06:45:00.000Z',
    local: 'Pátio Sul — Via Principal, km 12.3',
    descricao: 'Manobrador quase foi atingido por vagão em movimento. Sinalização sonora da locomotiva falhou. Operador viu o vagão a 15m e saiu a tempo.',
    tipo: 'QUASE_ACIDENTE',
    severidade: 'CRITICA',
    usuarioId: 'user-002',
    evidenciaIds: [],
    cicloMelhoriaId: 'ciclo-002',
    criadoEm: '2026-02-17T06:50:00.000Z',
    atualizadoEm: '2026-02-17T06:50:00.000Z',
  },
  {
    id: 'evt-004',
    data: '2026-02-18T10:00:00.000Z',
    local: 'Terminal de Carga — Balança Rodoferroviária',
    descricao: 'Procedimento de pesagem foi realizado sem travamento dos calços. Vagão deslocou 30cm durante pesagem. Sem danos.',
    tipo: 'DESVIO',
    severidade: 'MEDIA',
    usuarioId: 'user-003',
    evidenciaIds: [],
    cicloMelhoriaId: null,
    criadoEm: '2026-02-18T10:05:00.000Z',
    atualizadoEm: '2026-02-18T10:05:00.000Z',
  },
  {
    id: 'evt-005',
    data: '2026-02-19T07:15:00.000Z',
    local: 'Via Permanente — Trecho Curva km 8.7',
    descricao: 'Auditoria identificou 3 dormentes consecutivos com fixação comprometida no trecho curvo. Região de alta velocidade (60km/h). Necessita troca urgente.',
    tipo: 'AUDITORIA',
    severidade: 'ALTA',
    usuarioId: 'user-004',
    evidenciaIds: ['evi-003'],
    cicloMelhoriaId: null,
    criadoEm: '2026-02-19T07:20:00.000Z',
    atualizadoEm: '2026-02-19T07:20:00.000Z',
  },
];

// ============================
// CICLOS DE MELHORIA (MASP/A3)
// ============================

const FASES_LISTA: FaseCiclo[] = [
  'REGISTRO', 'CLASSIFICACAO', 'INVESTIGACAO', 'CAUSA_RAIZ',
  'CONTRAMEDIDA', 'ACAO_CORRETIVA', 'VERIFICACAO', 'PADRONIZACAO',
];

let ciclosDb: CicloDto[] = [
  {
    id: 'ciclo-001',
    titulo: 'Falha recorrente em freio manual — vagões série GDE',
    descricao: 'Investigar causa raiz de falhas nos freios manuais dos vagões GDE que vêm causando atrasos no Pátio Norte. 3 ocorrências nos últimos 30 dias.',
    responsavelId: 'dev-user-001',
    eventoOrigemId: 'evt-001',
    faseAtual: 'CAUSA_RAIZ',
    faseNumero: 4,
    status: 'ATIVO',
    eventoIds: ['evt-001'],
    investigacaoId: 'inv-001',
    acaoIds: [],
    evidenciaIds: ['evi-001'],
    conhecimentoId: null,
    historicoFases: [
      { faseDe: 'REGISTRO', fasePara: 'REGISTRO', data: '2026-02-15T09:00:00Z', usuarioId: 'dev-user-001', observacao: 'Ciclo criado' },
      { faseDe: 'REGISTRO', fasePara: 'CLASSIFICACAO', data: '2026-02-15T10:00:00Z', usuarioId: 'dev-user-001', observacao: 'Classificado como incidente operacional' },
      { faseDe: 'CLASSIFICACAO', fasePara: 'INVESTIGACAO', data: '2026-02-15T14:00:00Z', usuarioId: 'dev-user-001', observacao: 'Equipe definida' },
      { faseDe: 'INVESTIGACAO', fasePara: 'CAUSA_RAIZ', data: '2026-02-16T09:00:00Z', usuarioId: 'dev-user-001', observacao: 'Evidências coletadas, iniciando 5 Porquês' },
    ],
    criadoEm: '2026-02-15T09:00:00.000Z',
    atualizadoEm: '2026-02-16T09:00:00.000Z',
  },
  {
    id: 'ciclo-002',
    titulo: 'Falha na sinalização sonora de locomotiva em manobra',
    descricao: 'Quase-acidente grave no Pátio Sul. Buzina da locomotiva SD-70 não soou durante manobra. Risco direto à vida do manobrador.',
    responsavelId: 'dev-user-001',
    eventoOrigemId: 'evt-003',
    faseAtual: 'INVESTIGACAO',
    faseNumero: 3,
    status: 'ATIVO',
    eventoIds: ['evt-003'],
    investigacaoId: null,
    acaoIds: [],
    evidenciaIds: [],
    conhecimentoId: null,
    historicoFases: [
      { faseDe: 'REGISTRO', fasePara: 'REGISTRO', data: '2026-02-17T07:00:00Z', usuarioId: 'dev-user-001', observacao: 'Ciclo criado — prioridade máxima' },
      { faseDe: 'REGISTRO', fasePara: 'CLASSIFICACAO', data: '2026-02-17T08:00:00Z', usuarioId: 'dev-user-001', observacao: 'Quase-acidente crítico' },
      { faseDe: 'CLASSIFICACAO', fasePara: 'INVESTIGACAO', data: '2026-02-17T10:00:00Z', usuarioId: 'dev-user-001', observacao: 'Iniciando investigação' },
    ],
    criadoEm: '2026-02-17T07:00:00.000Z',
    atualizadoEm: '2026-02-17T10:00:00.000Z',
  },
];

// ============================
// EVIDÊNCIAS
// ============================

const evidenciasDb: EvidenciaDto[] = [
  {
    id: 'evi-001',
    nomeOriginal: 'freio-manual-gde45012.jpg',
    mimeType: 'image/jpeg',
    tamanhoBytes: 2_450_000,
    eventoId: 'evt-001',
    caminho: '/uploads/evi-001.jpg',
    criadoEm: '2026-02-15T08:36:00.000Z',
  },
  {
    id: 'evi-002',
    nomeOriginal: 'sapata-desgaste-trinca.jpg',
    mimeType: 'image/jpeg',
    tamanhoBytes: 1_800_000,
    eventoId: 'evt-002',
    caminho: '/uploads/evi-002.jpg',
    criadoEm: '2026-02-16T14:20:00.000Z',
  },
  {
    id: 'evi-003',
    nomeOriginal: 'dormentes-fixacao-comprometida.jpg',
    mimeType: 'image/jpeg',
    tamanhoBytes: 3_100_000,
    eventoId: 'evt-005',
    caminho: '/uploads/evi-003.jpg',
    criadoEm: '2026-02-19T07:25:00.000Z',
  },
];

// ============================
// OPERAÇÕES CRUD
// ============================

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 200));
}

export const mockDb = {
  // -- EVENTOS --
  async listarEventos(params?: Record<string, unknown>) {
    await delay();
    const page = Number(params?.page ?? 1);
    const limit = Number(params?.limit ?? 20);
    const start = (page - 1) * limit;
    const sorted = [...eventosDb].sort(
      (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
    );
    return { data: sorted.slice(start, start + limit), total: eventosDb.length, page, limit };
  },

  async buscarEvento(id: string) {
    await delay();
    const evt = eventosDb.find((e) => e.id === id);
    if (!evt) throw new Error(`Evento ${id} não encontrado`);
    return evt;
  },

  async criarEvento(dto: CriarEventoDto): Promise<EventoDto> {
    await delay(500);
    const novo: EventoDto = {
      id: `evt-${String(eventosDb.length + 1).padStart(3, '0')}`,
      ...dto,
      usuarioId: 'dev-user-001',
      evidenciaIds: [],
      cicloMelhoriaId: null,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    eventosDb = [novo, ...eventosDb];
    return novo;
  },

  // -- CICLOS --
  async listarCiclos(params?: Record<string, unknown>) {
    await delay();
    const page = Number(params?.page ?? 1);
    const limit = Number(params?.limit ?? 20);
    const start = (page - 1) * limit;
    return { data: ciclosDb.slice(start, start + limit), total: ciclosDb.length, page, limit };
  },

  async buscarCiclo(id: string) {
    await delay();
    const ciclo = ciclosDb.find((c) => c.id === id);
    if (!ciclo) throw new Error(`Ciclo ${id} não encontrado`);
    return ciclo;
  },

  async avancarFase(cicloId: string, observacao?: string): Promise<CicloDto> {
    await delay(500);
    const ciclo = ciclosDb.find((c) => c.id === cicloId);
    if (!ciclo) throw new Error(`Ciclo ${cicloId} não encontrado`);

    const idx = FASES_LISTA.indexOf(ciclo.faseAtual);
    if (idx >= FASES_LISTA.length - 1) throw new Error('Ciclo já está na última fase');

    const faseDe = ciclo.faseAtual;
    const fasePara = FASES_LISTA[idx + 1];

    ciclo.faseAtual = fasePara;
    ciclo.faseNumero = idx + 2;
    ciclo.historicoFases.push({
      faseDe,
      fasePara,
      data: new Date().toISOString(),
      usuarioId: 'dev-user-001',
      observacao: observacao ?? `Avançado para ${fasePara}`,
    });
    ciclo.atualizadoEm = new Date().toISOString();

    if (fasePara === 'PADRONIZACAO') {
      ciclo.status = 'CONCLUIDO';
    }

    return { ...ciclo };
  },

  // -- EVIDÊNCIAS --
  async listarEvidencias(params?: Record<string, unknown>) {
    await delay();
    let result = evidenciasDb;
    if (params?.eventoId) {
      result = result.filter((e) => e.eventoId === params.eventoId);
    }
    return { data: result, total: result.length, page: 1, limit: 50 };
  },

  // -- STATS --
  async getStats() {
    await delay(200);
    return {
      totalEventos: eventosDb.length,
      eventosSemCiclo: eventosDb.filter((e) => !e.cicloMelhoriaId).length,
      ciclosAtivos: ciclosDb.filter((c) => c.status === 'ATIVO').length,
      ciclosConcluidos: ciclosDb.filter((c) => c.status === 'CONCLUIDO').length,
      porSeveridade: {
        CRITICA: eventosDb.filter((e) => e.severidade === 'CRITICA').length,
        ALTA: eventosDb.filter((e) => e.severidade === 'ALTA').length,
        MEDIA: eventosDb.filter((e) => e.severidade === 'MEDIA').length,
        BAIXA: eventosDb.filter((e) => e.severidade === 'BAIXA').length,
      },
      porTipo: {
        INCIDENTE: eventosDb.filter((e) => e.tipo === 'INCIDENTE').length,
        QUASE_ACIDENTE: eventosDb.filter((e) => e.tipo === 'QUASE_ACIDENTE').length,
        DESVIO: eventosDb.filter((e) => e.tipo === 'DESVIO').length,
        OBSERVACAO: eventosDb.filter((e) => e.tipo === 'OBSERVACAO').length,
        AUDITORIA: eventosDb.filter((e) => e.tipo === 'AUDITORIA').length,
      },
    };
  },
};
