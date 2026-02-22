/**
 * MÓDULO REUNIÃO — Modo reunião do CCQ.
 *
 * Checklist:
 *   [x] Ativar modo reunião
 *   [x] Registrar decisões
 *   [x] Criar tarefas rápidas
 *   [x] Alterar fase coletiva
 *   [x] Registrar presença
 *   [x] Gerar ata automática
 *
 * Quando o líder ativa "Modo Reunião", o sistema:
 *   1. Registra data/hora de início
 *   2. Marca presentes (checklist de membros)
 *   3. Todas as mensagens do chat ficam vinculadas à reunião
 *   4. Decisões marcadas viram itens da ata
 *   5. Tarefas criadas ficam rastreadas
 *   6. Ao finalizar, gera ata automática
 */

import { auditLog } from '@modules/audit';

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export interface ReuniaoParticipante {
  userId: string;
  nome: string;
  papel: string;
  presente: boolean;
  horaEntrada?: string;
}

export interface ReuniaoDecisao {
  id: string;
  texto: string;
  mensagemId?: string; // vinculada à mensagem do chat
  timestamp: string;
}

export interface ReuniaoTarefa {
  id: string;
  descricao: string;
  responsavelId: string;
  responsavelNome: string;
  prazo: string;
  criadaEm: string;
}

export type ReuniaoStatus = 'ativa' | 'finalizada' | 'cancelada';

export interface Reuniao {
  id: string;
  projectId: string;
  projectName: string;
  faseNoInicio: number;
  faseNoFim?: number;
  status: ReuniaoStatus;
  inicio: string;
  fim?: string;
  participantes: ReuniaoParticipante[];
  decisoes: ReuniaoDecisao[];
  tarefas: ReuniaoTarefa[];
  observacoes: string;
}

export interface AtaGerada {
  reuniaoId: string;
  projectName: string;
  data: string;
  duracao: string;
  presentes: string[];
  ausentes: string[];
  fase: string;
  decisoes: string[];
  tarefas: { descricao: string; responsavel: string; prazo: string }[];
  observacoes: string;
  textoCompleto: string;
}

// ════════════════════════════════════
// STORE (in-memory mock)
// ════════════════════════════════════

const _reunioes: Map<string, Reuniao> = new Map();
let _counter = 0;

function genId(): string {
  _counter++;
  return `reuniao-${Date.now()}-${_counter}`;
}

// ════════════════════════════════════
// API
// ════════════════════════════════════

/**
 * Buscar reunião ativa de um projeto.
 */
export function getReuniaoAtiva(projectId: string): Reuniao | null {
  for (const r of _reunioes.values()) {
    if (r.projectId === projectId && r.status === 'ativa') return r;
  }
  return null;
}

/**
 * Listar reuniões de um projeto.
 */
export function getReunioesDosProjeto(projectId: string): Reuniao[] {
  return [..._reunioes.values()]
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => b.inicio.localeCompare(a.inicio));
}

/**
 * Iniciar modo reunião.
 */
export function iniciarReuniao(params: {
  projectId: string;
  projectName: string;
  faseAtual: number;
  membros: { id: string; nome: string; papel: string }[];
  userId: string;
  userName: string;
}): Reuniao {
  // Não permite 2 reuniões ativas no mesmo projeto
  const ativa = getReuniaoAtiva(params.projectId);
  if (ativa) return ativa;

  const reuniao: Reuniao = {
    id: genId(),
    projectId: params.projectId,
    projectName: params.projectName,
    faseNoInicio: params.faseAtual,
    status: 'ativa',
    inicio: new Date().toISOString(),
    participantes: params.membros.map((m) => ({
      userId: m.id,
      nome: m.nome,
      papel: m.papel,
      presente: false,
    })),
    decisoes: [],
    tarefas: [],
    observacoes: '',
  };

  _reunioes.set(reuniao.id, reuniao);

  auditLog({
    userId: params.userId,
    userName: params.userName,
    action: 'reuniao_iniciada',
    projectId: params.projectId,
    projectName: params.projectName,
    description: `Reunião iniciada — Fase ${params.faseAtual}`,
  });

  return reuniao;
}

/**
 * Marcar presença.
 */
export function marcarPresenca(
  reuniaoId: string,
  userId: string,
  presente: boolean,
): void {
  const r = _reunioes.get(reuniaoId);
  if (!r || r.status !== 'ativa') return;

  const p = r.participantes.find((x) => x.userId === userId);
  if (p) {
    p.presente = presente;
    if (presente && !p.horaEntrada) {
      p.horaEntrada = new Date().toISOString();
    }
  }
}

/**
 * Registrar decisão durante reunião.
 */
export function registrarDecisao(
  reuniaoId: string,
  texto: string,
  mensagemId?: string,
): ReuniaoDecisao {
  const r = _reunioes.get(reuniaoId);
  if (!r) throw new Error('Reunião não encontrada');

  const decisao: ReuniaoDecisao = {
    id: `dec-${Date.now()}-${r.decisoes.length}`,
    texto,
    mensagemId,
    timestamp: new Date().toISOString(),
  };

  r.decisoes.push(decisao);
  return decisao;
}

/**
 * Criar tarefa rápida durante reunião.
 */
export function criarTarefaRapida(
  reuniaoId: string,
  params: {
    descricao: string;
    responsavelId: string;
    responsavelNome: string;
    prazo: string;
  },
): ReuniaoTarefa {
  const r = _reunioes.get(reuniaoId);
  if (!r) throw new Error('Reunião não encontrada');

  const tarefa: ReuniaoTarefa = {
    id: `task-${Date.now()}-${r.tarefas.length}`,
    ...params,
    criadaEm: new Date().toISOString(),
  };

  r.tarefas.push(tarefa);
  return tarefa;
}

/**
 * Finalizar reunião e gerar ata.
 */
export function finalizarReuniao(
  reuniaoId: string,
  params: {
    faseNoFim: number;
    observacoes: string;
    userId: string;
    userName: string;
  },
): AtaGerada {
  const r = _reunioes.get(reuniaoId);
  if (!r) throw new Error('Reunião não encontrada');

  r.status = 'finalizada';
  r.fim = new Date().toISOString();
  r.faseNoFim = params.faseNoFim;
  r.observacoes = params.observacoes;

  auditLog({
    userId: params.userId,
    userName: params.userName,
    action: 'reuniao_finalizada',
    projectId: r.projectId,
    projectName: r.projectName,
    description: `Reunião finalizada — ${r.decisoes.length} decisões, ${r.tarefas.length} tarefas`,
    after: {
      decisoes: r.decisoes.length,
      tarefas: r.tarefas.length,
      presentes: r.participantes.filter((p) => p.presente).length,
    },
  });

  return gerarAta(r);
}

/**
 * Gerar ata automática da reunião.
 */
export function gerarAta(reuniao: Reuniao): AtaGerada {
  const presentes = reuniao.participantes.filter((p) => p.presente).map((p) => p.nome);
  const ausentes = reuniao.participantes.filter((p) => !p.presente).map((p) => p.nome);

  const inicio = new Date(reuniao.inicio);
  const fim = reuniao.fim ? new Date(reuniao.fim) : new Date();
  const duracaoMin = Math.round((fim.getTime() - inicio.getTime()) / 60_000);
  const duracao = duracaoMin < 60
    ? `${duracaoMin} minutos`
    : `${Math.floor(duracaoMin / 60)}h${duracaoMin % 60 > 0 ? ` ${duracaoMin % 60}min` : ''}`;

  const tarefas = reuniao.tarefas.map((t) => ({
    descricao: t.descricao,
    responsavel: t.responsavelNome,
    prazo: t.prazo,
  }));

  const decisoes = reuniao.decisoes.map((d) => d.texto);

  // Montar texto da ata
  const linhas: string[] = [
    `ATA DE REUNIÃO — ${reuniao.projectName}`,
    `Data: ${inicio.toLocaleDateString('pt-BR')} · Duração: ${duracao}`,
    `Fase: ${reuniao.faseNoInicio}${reuniao.faseNoFim && reuniao.faseNoFim !== reuniao.faseNoInicio ? ` → ${reuniao.faseNoFim}` : ''}`,
    '',
    `PRESENTES: ${presentes.join(', ') || 'Nenhum registrado'}`,
    ...(ausentes.length > 0 ? [`AUSENTES: ${ausentes.join(', ')}`] : []),
    '',
  ];

  if (decisoes.length > 0) {
    linhas.push('DECISÕES:');
    decisoes.forEach((d, i) => linhas.push(`  ${i + 1}. ${d}`));
    linhas.push('');
  }

  if (tarefas.length > 0) {
    linhas.push('TAREFAS GERADAS:');
    tarefas.forEach((t, i) =>
      linhas.push(`  ${i + 1}. ${t.descricao} → ${t.responsavel} (prazo: ${t.prazo})`),
    );
    linhas.push('');
  }

  if (reuniao.observacoes) {
    linhas.push(`OBSERVAÇÕES: ${reuniao.observacoes}`);
  }

  return {
    reuniaoId: reuniao.id,
    projectName: reuniao.projectName,
    data: inicio.toLocaleDateString('pt-BR'),
    duracao,
    presentes,
    ausentes,
    fase: `${reuniao.faseNoInicio}`,
    decisoes,
    tarefas,
    observacoes: reuniao.observacoes,
    textoCompleto: linhas.join('\n'),
  };
}
