/**
 * DNA DO MASP — Requisitos obrigatórios por fase.
 *
 * Cada item representa uma obrigação verificável.
 * O sistema só avança a fase quando TODOS os obrigatórios = cumpridos.
 *
 * Baseado em:
 *   - Metodologia MASP/A3 (JUSE)
 *   - Prática real de consultoria CCQ industrial
 *   - Critérios de reprovação mais comuns em bancas avaliadoras
 *
 * tipoValidacao:
 *   texto     → campo texto preenchido
 *   numero    → valor numérico registrado
 *   arquivo   → upload de evidência (foto, doc, planilha)
 *   aprovacao → aprovação explícita de um papel (líder/facilitador)
 *   lista     → lista de itens (ex: ações 5W2H)
 *   reuniao   → registro de reunião com participantes
 *
 * responsavelTipo:
 *   lider       → só o líder pode cumprir
 *   membro      → qualquer membro designado
 *   facilitador → padrinho/supervisor externo
 *   grupo       → requer reunião coletiva
 */

export type TipoValidacao = 'texto' | 'numero' | 'arquivo' | 'aprovacao' | 'lista' | 'reuniao';
export type ResponsavelTipo = 'lider' | 'membro' | 'facilitador' | 'grupo';

export interface RequisitoFase {
  id: string;
  fase: number;
  codigo: string;
  descricao: string;
  descricaoCurta: string;
  tipoValidacao: TipoValidacao;
  obrigatorio: boolean;
  responsavelTipo: ResponsavelTipo;
  dicaIA: string; // texto que a IA usa para cobrar
}

/**
 * ═══════════════════════════════════════════
 * FASE 1 — CLARIFICAR O PROBLEMA
 * ═══════════════════════════════════════════
 * Provar que o problema existe com fatos.
 * Consultoria reprova: causa no lugar de problema,
 * sem número, escopo vago.
 */
const FASE_1: RequisitoFase[] = [
  {
    id: 'F1_DESCRICAO_FACTUAL',
    fase: 1,
    codigo: 'DESCRICAO_FACTUAL',
    descricao: 'Descrição factual do problema (sem opinião, sem causa)',
    descricaoCurta: 'Descrever o problema',
    tipoValidacao: 'texto',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'A descrição do problema precisa ser factual. Diga O QUE acontece, não POR QUE acontece.',
  },
  {
    id: 'F1_INDICADOR_NUMERICO',
    fase: 1,
    codigo: 'INDICADOR_NUMERICO',
    descricao: 'Indicador numérico que comprova o problema (frequência, custo, tempo)',
    descricaoCurta: 'Registrar indicador numérico',
    tipoValidacao: 'numero',
    obrigatorio: true,
    responsavelTipo: 'membro',
    dicaIA: 'Sem número, sem problema. Quantas vezes aconteceu? Quanto custou? Quanto tempo perdido?',
  },
  {
    id: 'F1_ESCOPO',
    fase: 1,
    codigo: 'ESCOPO',
    descricao: 'Delimitação de escopo (equipamento, linha, período)',
    descricaoCurta: 'Delimitar escopo',
    tipoValidacao: 'texto',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Defina exatamente ONDE e QUANDO o problema ocorre. Qual equipamento? Qual linha? Qual período?',
  },
  {
    id: 'F1_COMPOSICAO_GRUPO',
    fase: 1,
    codigo: 'COMPOSICAO_GRUPO',
    descricao: 'Registro dos membros do grupo e líder',
    descricaoCurta: 'Registrar composição do grupo',
    tipoValidacao: 'lista',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Registre todos os membros do grupo CCQ com seus papéis.',
  },
];

/**
 * ═══════════════════════════════════════════
 * FASE 2 — DESDOBRAR O PROBLEMA
 * ═══════════════════════════════════════════
 * Quebrar o genérico em específico. Estratificar.
 * É onde o grupo mais trava — precisa ir ao campo medir.
 */
const FASE_2: RequisitoFase[] = [
  {
    id: 'F2_ESTRATIFICACAO',
    fase: 2,
    codigo: 'ESTRATIFICACAO',
    descricao: 'Estratificação por tipo/local/turno/equipamento',
    descricaoCurta: 'Estratificar dados',
    tipoValidacao: 'arquivo',
    obrigatorio: true,
    responsavelTipo: 'membro',
    dicaIA: 'Estratifique os dados: por turno, por local, por tipo de falha. Onde o problema se concentra?',
  },
  {
    id: 'F2_DADOS_CAMPO',
    fase: 2,
    codigo: 'DADOS_CAMPO',
    descricao: 'Dados coletados em campo (não estimativa)',
    descricaoCurta: 'Coletar dados em campo',
    tipoValidacao: 'arquivo',
    obrigatorio: true,
    responsavelTipo: 'membro',
    dicaIA: 'Os dados precisam vir do campo real, não de estimativa. Vá medir.',
  },
  {
    id: 'F2_GRAFICO_CONCENTRACAO',
    fase: 2,
    codigo: 'GRAFICO_CONCENTRACAO',
    descricao: 'Gráfico ou tabela mostrando concentração do problema',
    descricaoCurta: 'Montar gráfico/tabela',
    tipoValidacao: 'arquivo',
    obrigatorio: true,
    responsavelTipo: 'membro',
    dicaIA: 'Monte um Pareto ou tabela que mostre onde o problema mais se concentra.',
  },
  {
    id: 'F2_FOCO_PRIORIZADO',
    fase: 2,
    codigo: 'FOCO_PRIORIZADO',
    descricao: 'Definição do foco priorizado para ataque',
    descricaoCurta: 'Definir foco prioritário',
    tipoValidacao: 'texto',
    obrigatorio: true,
    responsavelTipo: 'grupo',
    dicaIA: 'Qual o "pedaço" do problema que será atacado primeiro? O grupo precisa decidir junto.',
  },
  {
    id: 'F2_REUNIAO_DESDOBRAMENTO',
    fase: 2,
    codigo: 'REUNIAO_DESDOBRAMENTO',
    descricao: 'Reunião do grupo para discutir estratificação',
    descricaoCurta: 'Reunião de desdobramento',
    tipoValidacao: 'reuniao',
    obrigatorio: true,
    responsavelTipo: 'grupo',
    dicaIA: 'O grupo precisa se reunir para discutir os dados coletados e definir o foco.',
  },
];

/**
 * ═══════════════════════════════════════════
 * FASE 3 — DEFINIR META
 * ═══════════════════════════════════════════
 * Alvo numérico. Consultoria reprova:
 * meta sem número, sem prazo, ou impossível.
 */
const FASE_3: RequisitoFase[] = [
  {
    id: 'F3_META_NUMERICA',
    fase: 3,
    codigo: 'META_NUMERICA',
    descricao: 'Meta numérica específica (ex: reduzir de 7 para 2 falhas/mês)',
    descricaoCurta: 'Definir meta numérica',
    tipoValidacao: 'numero',
    obrigatorio: true,
    responsavelTipo: 'grupo',
    dicaIA: 'A meta precisa ter número. "Reduzir de X para Y." Sem número = reprovação.',
  },
  {
    id: 'F3_PRAZO_META',
    fase: 3,
    codigo: 'PRAZO_META',
    descricao: 'Prazo para atingir a meta',
    descricaoCurta: 'Definir prazo da meta',
    tipoValidacao: 'texto',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Até quando vocês pretendem atingir essa meta? Defina uma data.',
  },
  {
    id: 'F3_JUSTIFICATIVA_META',
    fase: 3,
    codigo: 'JUSTIFICATIVA_META',
    descricao: 'Justificativa do valor escolhido para a meta',
    descricaoCurta: 'Justificar valor da meta',
    tipoValidacao: 'texto',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Por que essa meta e não outra? Explique como chegou nesse número.',
  },
  {
    id: 'F3_APROVACAO_FACILITADOR',
    fase: 3,
    codigo: 'APROVACAO_FACILITADOR_META',
    descricao: 'Aprovação do facilitador/padrinho na meta',
    descricaoCurta: 'Facilitador aprovar meta',
    tipoValidacao: 'aprovacao',
    obrigatorio: true,
    responsavelTipo: 'facilitador',
    dicaIA: 'O facilitador precisa aprovar a meta antes de seguir.',
  },
];

/**
 * ═══════════════════════════════════════════
 * FASE 4 — ANALISAR CAUSA RAIZ
 * ═══════════════════════════════════════════
 * Fase mais técnica e mais demorada.
 * Onde mais projetos morrem.
 * Consultoria pede: "se essa for a causa, como você prova?"
 */
const FASE_4: RequisitoFase[] = [
  {
    id: 'F4_ISHIKAWA',
    fase: 4,
    codigo: 'ISHIKAWA',
    descricao: 'Diagrama de Ishikawa (espinha de peixe) preenchido',
    descricaoCurta: 'Preencher Ishikawa',
    tipoValidacao: 'arquivo',
    obrigatorio: true,
    responsavelTipo: 'grupo',
    dicaIA: 'Montem o diagrama de espinha de peixe com as possíveis causas em cada categoria.',
  },
  {
    id: 'F4_CINCO_PORQUES',
    fase: 4,
    codigo: 'CINCO_PORQUES',
    descricao: 'Aplicação dos 5 Porquês na causa mais provável',
    descricaoCurta: 'Aplicar 5 Porquês',
    tipoValidacao: 'texto',
    obrigatorio: true,
    responsavelTipo: 'grupo',
    dicaIA: 'Apliquem os 5 Porquês na causa mais provável do Ishikawa até chegar na raiz.',
  },
  {
    id: 'F4_EVIDENCIA_CAMPO',
    fase: 4,
    codigo: 'EVIDENCIA_CAMPO_CAUSA',
    descricao: 'Evidência de campo que comprova a causa raiz',
    descricaoCurta: 'Coletar evidência de campo',
    tipoValidacao: 'arquivo',
    obrigatorio: true,
    responsavelTipo: 'membro',
    dicaIA: 'A causa raiz precisa de prova. Foto, medição, registro. "Se essa for a causa, como você prova?"',
  },
  {
    id: 'F4_REUNIAO_VALIDACAO',
    fase: 4,
    codigo: 'REUNIAO_VALIDACAO_CAUSA',
    descricao: 'Reunião do grupo para validar causa raiz',
    descricaoCurta: 'Reunião de validação',
    tipoValidacao: 'reuniao',
    obrigatorio: true,
    responsavelTipo: 'grupo',
    dicaIA: 'O grupo inteiro precisa concordar que essa é a causa raiz. Registrem a reunião.',
  },
  {
    id: 'F4_APROVACAO_FACILITADOR',
    fase: 4,
    codigo: 'APROVACAO_FACILITADOR_CAUSA',
    descricao: 'Aprovação do facilitador na causa raiz',
    descricaoCurta: 'Facilitador aprovar causa raiz',
    tipoValidacao: 'aprovacao',
    obrigatorio: true,
    responsavelTipo: 'facilitador',
    dicaIA: 'O facilitador precisa validar a causa raiz antes de montar o plano de ação.',
  },
];

/**
 * ═══════════════════════════════════════════
 * FASE 5 — PLANO DE AÇÃO (5W2H)
 * ═══════════════════════════════════════════
 * Ações executáveis. Consultoria reprova:
 * "melhorar o processo" como ação.
 * Cada ação: 1 pessoa, 1 data.
 */
const FASE_5: RequisitoFase[] = [
  {
    id: 'F5_LISTA_ACOES',
    fase: 5,
    codigo: 'LISTA_ACOES_5W2H',
    descricao: 'Lista de ações no formato 5W2H (O quê, Quem, Quando, Onde, Por quê, Como, Quanto)',
    descricaoCurta: 'Montar plano de ação',
    tipoValidacao: 'lista',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Cada ação precisa de: O quê? Quem? Quando? Uma pessoa, uma data, uma entrega.',
  },
  {
    id: 'F5_RESPONSAVEL_INDIVIDUAL',
    fase: 5,
    codigo: 'RESPONSAVEL_INDIVIDUAL',
    descricao: 'Cada ação com responsável individual (não "o grupo")',
    descricaoCurta: 'Atribuir responsáveis',
    tipoValidacao: 'lista',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Cada ação precisa ter UM dono. "O grupo" não é dono. Quem vai fazer?',
  },
  {
    id: 'F5_DATA_CONCLUSAO',
    fase: 5,
    codigo: 'DATA_CONCLUSAO_ACOES',
    descricao: 'Cada ação com data de conclusão prevista',
    descricaoCurta: 'Definir datas das ações',
    tipoValidacao: 'lista',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Toda ação precisa de prazo. Quando vai estar feita?',
  },
  {
    id: 'F5_APROVACAO_FACILITADOR',
    fase: 5,
    codigo: 'APROVACAO_FACILITADOR_PLANO',
    descricao: 'Aprovação do facilitador no plano de ação',
    descricaoCurta: 'Facilitador aprovar plano',
    tipoValidacao: 'aprovacao',
    obrigatorio: true,
    responsavelTipo: 'facilitador',
    dicaIA: 'O facilitador precisa aprovar o plano antes de iniciar a execução.',
  },
];

/**
 * ═══════════════════════════════════════════
 * FASE 6 — EXECUTAR AÇÕES
 * ═══════════════════════════════════════════
 * Onde o líder mais sofre cobrando no WhatsApp.
 * A IA substitui isso.
 */
const FASE_6: RequisitoFase[] = [
  {
    id: 'F6_ACOES_CONCLUIDAS',
    fase: 6,
    codigo: 'ACOES_CONCLUIDAS',
    descricao: 'Todas as ações marcadas como concluídas com data real',
    descricaoCurta: 'Concluir todas as ações',
    tipoValidacao: 'lista',
    obrigatorio: true,
    responsavelTipo: 'membro',
    dicaIA: 'Cada ação precisa ser marcada como concluída com a data real de execução.',
  },
  {
    id: 'F6_EVIDENCIA_EXECUCAO',
    fase: 6,
    codigo: 'EVIDENCIA_EXECUCAO',
    descricao: 'Evidência de execução por ação (foto, documento)',
    descricaoCurta: 'Anexar evidência de execução',
    tipoValidacao: 'arquivo',
    obrigatorio: true,
    responsavelTipo: 'membro',
    dicaIA: 'Cada ação executada precisa de prova: foto, documento, registro.',
  },
  {
    id: 'F6_JUSTIFICATIVA_NAO_FEITAS',
    fase: 6,
    codigo: 'JUSTIFICATIVA_NAO_FEITAS',
    descricao: 'Justificativa para ações não concluídas ou atrasadas',
    descricaoCurta: 'Justificar ações pendentes',
    tipoValidacao: 'texto',
    obrigatorio: false,
    responsavelTipo: 'lider',
    dicaIA: 'Se alguma ação não foi feita, justifique o motivo.',
  },
  {
    id: 'F6_PERCENTUAL_EXECUCAO',
    fase: 6,
    codigo: 'PERCENTUAL_EXECUCAO',
    descricao: 'Percentual de execução geral do plano (mínimo 80%)',
    descricaoCurta: 'Verificar % de execução',
    tipoValidacao: 'numero',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Pelo menos 80% das ações precisam estar concluídas para avançar.',
  },
];

/**
 * ═══════════════════════════════════════════
 * FASE 7 — VERIFICAR RESULTADOS
 * ═══════════════════════════════════════════
 * Provar que funcionou com número.
 * Se não funcionou → volta para fase 4 (loop real).
 */
const FASE_7: RequisitoFase[] = [
  {
    id: 'F7_MEDICAO_POS',
    fase: 7,
    codigo: 'MEDICAO_POS',
    descricao: 'Medição do indicador após ações (mesmo indicador da Fase 1)',
    descricaoCurta: 'Medir resultado',
    tipoValidacao: 'numero',
    obrigatorio: true,
    responsavelTipo: 'membro',
    dicaIA: 'Meçam o MESMO indicador da Fase 1. Antes era X, agora é quanto?',
  },
  {
    id: 'F7_COMPARACAO_ANTES_DEPOIS',
    fase: 7,
    codigo: 'COMPARACAO_ANTES_DEPOIS',
    descricao: 'Gráfico comparativo antes x depois',
    descricaoCurta: 'Montar comparação antes/depois',
    tipoValidacao: 'arquivo',
    obrigatorio: true,
    responsavelTipo: 'membro',
    dicaIA: 'Monte um gráfico mostrando o indicador ANTES e DEPOIS das ações.',
  },
  {
    id: 'F7_ATINGIMENTO_META',
    fase: 7,
    codigo: 'ATINGIMENTO_META',
    descricao: 'Cálculo de atingimento da meta (% alcançado)',
    descricaoCurta: 'Calcular atingimento da meta',
    tipoValidacao: 'numero',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'A meta era atingir Y. Vocês chegaram em quanto? Qual o % de atingimento?',
  },
  {
    id: 'F7_EFEITOS_COLATERAIS',
    fase: 7,
    codigo: 'EFEITOS_COLATERAIS',
    descricao: 'Análise de efeitos colaterais (melhorou X e piorou Y?)',
    descricaoCurta: 'Analisar efeitos colaterais',
    tipoValidacao: 'texto',
    obrigatorio: false,
    responsavelTipo: 'lider',
    dicaIA: 'Melhorou uma coisa e piorou outra? Verifique efeitos colaterais.',
  },
];

/**
 * ═══════════════════════════════════════════
 * FASE 8 — PADRONIZAR
 * ═══════════════════════════════════════════
 * Fase mais ignorada. Grupo comemora na 7 e abandona a 8.
 * A IA precisa cobrar com a mesma intensidade.
 */
const FASE_8: RequisitoFase[] = [
  {
    id: 'F8_PADRAO_OPERACIONAL',
    fase: 8,
    codigo: 'PADRAO_OPERACIONAL',
    descricao: 'Padrão operacional atualizado ou criado (documento formal)',
    descricaoCurta: 'Criar/atualizar padrão',
    tipoValidacao: 'arquivo',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'O ganho precisa virar padrão. Atualize o documento operacional ou crie um novo.',
  },
  {
    id: 'F8_TREINAMENTO',
    fase: 8,
    codigo: 'TREINAMENTO',
    descricao: 'Treinamento registrado (quem, quando)',
    descricaoCurta: 'Registrar treinamento',
    tipoValidacao: 'reuniao',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Quem foi treinado no novo padrão? Registre nomes e data.',
  },
  {
    id: 'F8_ACOMPANHAMENTO',
    fase: 8,
    codigo: 'ACOMPANHAMENTO',
    descricao: 'Plano de acompanhamento (quem monitora, frequência)',
    descricaoCurta: 'Definir acompanhamento',
    tipoValidacao: 'texto',
    obrigatorio: true,
    responsavelTipo: 'lider',
    dicaIA: 'Quem vai monitorar o indicador daqui pra frente? Com que frequência?',
  },
  {
    id: 'F8_LICAO_APRENDIDA',
    fase: 8,
    codigo: 'LICAO_APRENDIDA',
    descricao: 'Lição aprendida registrada (conhecimento para outros grupos)',
    descricaoCurta: 'Registrar lição aprendida',
    tipoValidacao: 'texto',
    obrigatorio: true,
    responsavelTipo: 'grupo',
    dicaIA: 'O que o grupo aprendeu? Registre para que outros CCQs não repitam o mesmo caminho.',
  },
  {
    id: 'F8_APROVACAO_FINAL',
    fase: 8,
    codigo: 'APROVACAO_FINAL',
    descricao: 'Aprovação final do facilitador (projeto completo)',
    descricaoCurta: 'Facilitador fechar projeto',
    tipoValidacao: 'aprovacao',
    obrigatorio: true,
    responsavelTipo: 'facilitador',
    dicaIA: 'O facilitador precisa aprovar o fechamento do projeto.',
  },
];

// ============================
// CATÁLOGO COMPLETO
// ============================

export const REQUISITOS_MASP: RequisitoFase[] = [
  ...FASE_1,
  ...FASE_2,
  ...FASE_3,
  ...FASE_4,
  ...FASE_5,
  ...FASE_6,
  ...FASE_7,
  ...FASE_8,
];

/** Requisitos filtrados por fase */
export function requisitosDaFase(fase: number): RequisitoFase[] {
  return REQUISITOS_MASP.filter((r) => r.fase === fase);
}

/** Requisitos obrigatórios filtrados por fase */
export function requisitosObrigatorios(fase: number): RequisitoFase[] {
  return REQUISITOS_MASP.filter((r) => r.fase === fase && r.obrigatorio);
}

/** Labels das fases */
export const FASE_LABELS: Record<number, string> = {
  1: '1º Passo — Clarificar Problema',
  2: '2º Passo — Desdobrar Problema',
  3: '3º Passo — Definir Meta',
  4: '4º Passo — Causa Raiz',
  5: '5º Passo — Contramedidas',
  6: '6º Passo — Plano de Ação',
  7: '7º Passo — Verificar Resultado',
  8: '8º Passo — Padronizar e Replicar',
};

/** Alias curto para workspace tabs */
export const FASE_LABELS_CURTOS: Record<number, string> = {
  1: 'Problema',
  2: 'Desdobrar',
  3: 'Meta',
  4: 'Causa Raiz',
  5: 'Contramedidas',
  6: 'Plano Ação',
  7: 'Resultado',
  8: 'Padronizar',
};

/** Total: 8 fases, 37 requisitos, 32 obrigatórios */
export const TOTAL_FASES = 8;
export const TOTAL_REQUISITOS = REQUISITOS_MASP.length;
export const TOTAL_OBRIGATORIOS = REQUISITOS_MASP.filter((r) => r.obrigatorio).length;
