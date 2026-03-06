/**
 * Store editável para Apresentação CCQ.
 * Persistência: localStorage.
 */

const STORAGE_KEY = 'mco-apresentacao-db';

export interface ApresentacaoData {
  // Hero
  titulo: string;
  subtitulo: string;
  area: string;
  consultora: string;
  apoio: string;
  evento: string;
  // Problema
  problemas: { titulo: string; desc: string }[];
  impacto: { valor: string; label: string }[];
  // Timeline
  timeline: { data: string; label: string; status: 'done' | 'current' | 'future' }[];
  // Método (8 fases)
  fases: { n: number; label: string; desc: string }[];
  // Sistema/Soluções
  solucoes: { titulo: string; desc: string }[];
  // Evidências
  evidencias: string[];
  // Resultados
  resultados: { valor: string; label: string; cor: string }[];
  // Footer
  fraseFinal: string;
  footerEvento: string;
}

/** Seed data de exemplo — nome do grupo e dados sao ficticios para demo. */
function criarSeed(): ApresentacaoData {
  return {
    titulo: 'ArtTrens', // seed data: nome do grupo de exemplo
    subtitulo: 'ENCONTRO DE MELHORIA CONTÍNUA · CCQ',
    area: 'Ferrovia EFVM',
    consultora: 'Julia',
    apoio: 'Eliane',
    evento: 'Ipatinga Mar/2026',
    problemas: [
      { titulo: 'WhatsApp', desc: 'Evidências perdidas em grupos pessoais' },
      { titulo: 'Fotos avulsas', desc: 'Sem vínculo com fase ou requisito' },
      { titulo: 'Planilhas', desc: 'Versões conflitantes, sem rastreio' },
      { titulo: 'Memória do líder', desc: 'Conhecimento que se perde na troca' },
    ],
    impacto: [
      { valor: '64%', label: 'projetos incompletos' },
      { valor: '0%', label: 'rastreabilidade' },
      { valor: '∞', label: 'retrabalho' },
    ],
    timeline: [
      { data: '15/08', label: 'Início MCO', status: 'done' },
      { data: '20/10', label: 'Motor de Fases', status: 'done' },
      { data: '15/12', label: 'Chat + Evidências', status: 'done' },
      { data: '01/02', label: 'IA Comportamental', status: 'done' },
      { data: '09/03', label: 'Entrega Apresentação', status: 'current' },
      { data: '12/03/2026', label: 'Evento Ipatinga', status: 'future' },
    ],
    fases: [
      { n: 1, label: 'Identificação', desc: 'Definir o problema com dados' },
      { n: 2, label: 'Observação', desc: 'Estratificar e priorizar' },
      { n: 3, label: 'Análise', desc: 'Meta numérica com prazo' },
      { n: 4, label: 'Causa Raiz', desc: 'Ishikawa + 5 Porquês' },
      { n: 5, label: 'Plano de Ação', desc: '5W2H com responsáveis' },
      { n: 6, label: 'Execução', desc: 'Acompanhar e registrar' },
      { n: 7, label: 'Verificação', desc: 'Comparar resultado vs meta' },
      { n: 8, label: 'Padronização', desc: 'Garantir que não volta' },
    ],
    solucoes: [
      { titulo: 'Guia automático', desc: 'O sistema diz o que fazer em cada fase' },
      { titulo: 'Evidência por fase', desc: 'Cada foto e documento vinculado ao requisito' },
      { titulo: 'Cobrança inteligente', desc: 'IA cobra quem está atrasado, no momento certo' },
      { titulo: 'Decisões registradas', desc: 'Toda decisão fica marcada e rastreável' },
      { titulo: 'Facilitador digital', desc: 'Detecta padrões de estagnação e intervém' },
      { titulo: 'Histórico auditável', desc: 'Tudo documentado automaticamente' },
    ],
    evidencias: [
      'Registro de QA', 'ART planejada', 'Confecção da garra', 'Kaizen',
      'Padronização', 'Treinamento', 'OJT', 'Fotos da máquina', 'Tempo medido', 'Ishikawa',
    ],
    resultados: [
      { valor: '100%', label: 'rastreabilidade', cor: '#69be28' },
      { valor: '0', label: 'reprovações', cor: '#69be28' },
      { valor: '-70%', label: 'retrabalho', cor: '#009e99' },
      { valor: '∞', label: 'histórico', cor: '#8b5cf6' },
    ],
    fraseFinal: 'O sistema não gerencia tarefas. Ele gerencia disciplina de melhoria contínua.',
    footerEvento: 'Evento Ipatinga · 12 de Março de 2026',
  };
}

export function loadApresentacao(): ApresentacaoData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seed = criarSeed();
  saveApresentacao(seed);
  return seed;
}

export function saveApresentacao(data: ApresentacaoData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetApresentacao(): ApresentacaoData {
  const seed = criarSeed();
  saveApresentacao(seed);
  return seed;
}
