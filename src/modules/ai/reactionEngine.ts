/**
 * REACTION ENGINE — facilitador digital de CCQ.
 *
 * 4 níveis de inteligência:
 *
 * NÍVEL 1 — REAÇÃO
 *   requisito cumprido → elogio · fase avançada → orientação
 *
 * NÍVEL 2 — ESTAGNAÇÃO
 *   atividade sem progresso · conversa sem evidência ·
 *   trabalho individual · fase 4 longa
 *
 * NÍVEL 3 — PERFIL COMPORTAMENTAL
 *   SAUDAVEL · DESORGANIZADO · PASSIVO · TRAVADO · INDIVIDUAL
 *   Cada perfil muda o tom da intervenção.
 *
 * NÍVEL 4 — CONSCIÊNCIA DE CONTEXTO (novo)
 *   A IA NUNCA interrompe conversa humana ativa.
 *   Toda intervenção é agendada, não enviada.
 *   O scheduler só entrega em janela de silêncio (>2min).
 *   Se chat ativo → reagenda +2min.
 *   Se líder acabou de cobrar → IA espera.
 *
 *   Resultado: usuários percebem a IA como alguém que
 *   OUVE, não alguém que INTERROMPE.
 *
 * Puro TypeScript. Sem IA generativa. Sem servidor.
 */

import { subscribeDomainEvents } from '@modules/core/domainEvents';
import type { DomainEvent } from '@modules/core/domainEvents';
import { mockConversaDb } from '@shared/api/mock-conversa';
import { mockProjetosDb } from '@shared/api/mock-projetos';
import { calcularStatusProjeto, FASE_LABELS, TOTAL_FASES } from '@shared/engine';

// ════════════════════════════════════
// PERFIL COMPORTAMENTAL
// ════════════════════════════════════

export type ProjectBehaviorProfile =
  | 'SAUDAVEL'
  | 'DESORGANIZADO'
  | 'PASSIVO'
  | 'TRAVADO'
  | 'INDIVIDUAL';

export function evaluateBehavior(mem: ProjectMemory): ProjectBehaviorProfile {
  const now = Date.now();
  const daysSinceEvent = (now - mem.lastEventAt) / (24 * 3600_000);
  const daysSinceProgress = (now - mem.lastProgressAt) / (24 * 3600_000);
  const daysInPhase = (now - mem.phaseStartAt) / (24 * 3600_000);

  if (mem.participantsInPhase.size <= 1 && mem.messageCountInPhase >= 3 && daysInPhase > 2)
    return 'INDIVIDUAL';
  if (mem.messageCountInPhase >= TALK_THRESHOLD && mem.completedInPhase < TALK_MIN_COMPLETED)
    return 'DESORGANIZADO';
  if (daysSinceEvent >= 3)
    return 'PASSIVO';
  if (daysInPhase > STAGNATION_DAYS && daysSinceProgress > STAGNATION_DAYS && mem.messageCountInPhase > 0 && mem.pendingCount > 0)
    return 'TRAVADO';
  return 'SAUDAVEL';
}

// ════════════════════════════════════
// INTERVENÇÃO AGENDADA (nível 4)
// ════════════════════════════════════

interface ScheduledIntervention {
  text: string;
  scheduledFor: number;
  reason: string;
  /** Quantas vezes foi reagendada por chat ativo */
  defers: number;
}

const SILENCE_WINDOW_MS = 2 * 60_000;   // 2 min de silêncio para poder falar
const MAX_DEFERS = 10;                    // máx reagendamentos (≈20min)
// IMMEDIATE_EVENTS kept for reference: requirement_completed, phase_advanced
// These event types bypass the silence window (handled via `immediate` param in scheduleIntervention).

// ════════════════════════════════════
// MENSAGENS POR PERFIL
// ════════════════════════════════════

const PROFILE_EMOJI: Record<ProjectBehaviorProfile, string> = {
  SAUDAVEL: '✅', DESORGANIZADO: '🔧', PASSIVO: '⏰', TRAVADO: '🔒', INDIVIDUAL: '👥',
};

const PROGRESS_MESSAGES: Record<ProjectBehaviorProfile, string[]> = {
  SAUDAVEL: [
    'Bom trabalho. Mais um requisito cumprido, continuem assim.',
    'Progresso consistente. A equipe está no caminho certo.',
    'Requisito atendido. Vocês estão mantendo o ritmo.',
  ],
  DESORGANIZADO: [
    'Bom — agora mantenham esse foco. Menos discussão, mais evidência.',
    'Requisito cumprido. Sigam essa direção: objetivo → evidência → próximo.',
    'Isso sim é progresso. Repitam: campo, dado, registro.',
  ],
  PASSIVO: [
    'Boa! O projeto voltou a andar. Não deixem parar de novo.',
    'Requisito cumprido. Aproveitem o embalo e ataquem o próximo.',
    'O projeto estava parado e agora tem progresso. Mantenham.',
  ],
  TRAVADO: [
    'Finalmente destravou. Revisem se os outros bloqueios seguem a mesma lógica.',
    'Requisito cumprido. Isso pode indicar que a abordagem mudou — bom sinal.',
    'Progresso depois de estagnação. Verifiquem se a causa raiz está correta.',
  ],
  INDIVIDUAL: [
    'Requisito cumprido. Agora distribuam: o próximo tem que ser de outra pessoa.',
    'Progresso, mas lembrem: CCQ é coletivo. Quem mais pode contribuir?',
    'Bom. Mas o trabalho não pode ser de uma pessoa só.',
  ],
};

const STAGNATION_MESSAGES: Record<ProjectBehaviorProfile, {
  noProgress: string[];  talkOnly: string[];  solo: string[];  phase4: string[];
}> = {
  SAUDAVEL:      { noProgress: [], talkOnly: [], solo: [], phase4: [] },
  DESORGANIZADO: {
    noProgress: [
      'Vocês estão discutindo sem método. Parem, releiam o checklist, e façam uma coisa por vez.',
      'A equipe tem energia, mas está dispersa. Definam: quem faz o quê até quando.',
    ],
    talkOnly: [
      'Muita conversa, pouca entrega. O método MASP exige evidência, não opinião. Voltem ao campo.',
      'O chat está cheio e o checklist está vazio. Invertam essa prioridade.',
    ],
    solo: [],
    phase4: ['A análise está se perdendo. Refaçam o Ishikawa com dados, não suposições.'],
  },
  PASSIVO: {
    noProgress: [
      'O projeto parou. Líder, convoque o grupo e redistribua tarefas.',
      'Sem progresso há dias. Existe bloqueio que não está registrado? Falem.',
    ],
    talkOnly: [], solo: [],
    phase4: ['A fase de Causa Raiz parou. Sem análise não há solução. Retomem.'],
  },
  TRAVADO: {
    noProgress: [
      'O grupo está tentando mas não avança. O problema pode ser de abordagem: revisem a análise.',
      'Travados há vários dias. Peçam ajuda do facilitador — não é fraqueza, é método.',
    ],
    talkOnly: ['Tem atividade mas sem resultado. Vocês podem estar atacando o efeito, não a causa.'],
    solo: [],
    phase4: [
      'Causa raiz provavelmente incorreta. Voltem ao Gemba, observem o processo, refaçam os 5 Porquês.',
      'A fase de Causa Raiz está travada. Isso normalmente significa que a causa verdadeira não foi encontrada.',
    ],
  },
  INDIVIDUAL: {
    noProgress: ['O projeto está estagnado e só uma pessoa está tentando. Isso não funciona. Líder, redistribua.'],
    talkOnly: [],
    solo: [
      'O projeto não é individual. CCQ exige participação da equipe. Distribuam responsabilidades agora.',
      'Apenas 1 pessoa executando. O trabalho precisa ser dividido — envolvam o grupo.',
    ],
    phase4: ['Uma pessoa sozinha não faz boa análise de causa raiz. Tragam perspectivas diferentes.'],
  },
};

const INACTIVITY_MESSAGES: Record<ProjectBehaviorProfile, string[]> = {
  SAUDAVEL:      ['Sem atividade recente. Verifiquem se há algo pendente no checklist.'],
  DESORGANIZADO: ['O projeto esfriou depois de muita agitação. Quando voltar, foquem no checklist, não no chat.'],
  PASSIVO: [
    'O projeto está parado há 3 dias. Líder, convoque uma reunião rápida.',
    'Sem atividade há 72h. O prazo de apresentação não espera.',
    'Projeto parado. Se existe bloqueio, registrem. Silêncio não resolve nada.',
  ],
  TRAVADO:    ['Parados depois de travar. Peçam apoio do facilitador para desbloquear.'],
  INDIVIDUAL: ['O projeto parou e a única pessoa que trabalhava nele também. Distribuam antes de retomar.'],
};

// ════════════════════════════════════
// MEMÓRIA POR PROJETO
// ════════════════════════════════════

interface ProjectMemory {
  // ── Temporal ──
  lastEventAt: number;
  lastProgressAt: number;
  phaseStartAt: number;

  // ── Contexto humano (nível 4) ──
  lastHumanMessageAt: number;        // última ação humana no chat
  pendingInterventions: ScheduledIntervention[];  // fila de intervenções

  // ── Estado ──
  lastPhase: number;
  pendingCount: number;
  previousPendingCount: number;

  // ── Atividade na fase ──
  messageCountInPhase: number;
  completedInPhase: number;
  participantsInPhase: Set<string>;

  // ── Durações por fase ──
  phaseDurations: Map<number, number>;

  // ── Perfil ──
  currentProfile: ProjectBehaviorProfile;

  // ── Anti-spam ──
  cooldowns: Map<string, number>;
}

const memory = new Map<string, ProjectMemory>();

function getMemory(projectId: string): ProjectMemory {
  if (!memory.has(projectId)) {
    const now = Date.now();
    memory.set(projectId, {
      lastEventAt: now,
      lastProgressAt: now,
      phaseStartAt: now,
      lastHumanMessageAt: 0,
      pendingInterventions: [],
      lastPhase: 0,
      pendingCount: 0,
      previousPendingCount: -1,
      messageCountInPhase: 0,
      completedInPhase: 0,
      participantsInPhase: new Set(),
      phaseDurations: new Map(),
      currentProfile: 'SAUDAVEL',
      cooldowns: new Map(),
    });
  }
  return memory.get(projectId)!;
}

// ════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════

const AUTOR_ID = 'ia-mco';
const AUTOR_NOME = '🤖 Coordenador MCO';

const COOLDOWNS: Record<string, number> = {
  requirement_completed:  10_000,
  phase_advanced:         10_000,
  inactivity:             4 * 3600_000,
  deadline:               8 * 3600_000,
  stagnation_no_progress: 24 * 3600_000,
  stagnation_talk_only:   24 * 3600_000,
  stagnation_solo:        24 * 3600_000,
  stagnation_phase4:      48 * 3600_000,
};

const INACTIVITY_MS = 72 * 3600_000;
const DEADLINE_WARNING_DAYS = 7;
const STAGNATION_DAYS = 5;
const TALK_THRESHOLD = 15;
const TALK_MIN_COMPLETED = 2;
const PHASE4_EXTRA_FACTOR = 1.5;
const CHECK_INTERVAL = 60_000;

const PHASE_MESSAGES: Record<number, string> = {
  2: '2º Passo — Desdobrar. Estratifiquem com Pareto: onde, quando, quanto. Não avancem sem priorizar.',
  3: '3º Passo — Meta SMART. Formato: "Reduzir [X] de [valor] para [valor] até [data]". Sem número, sem meta.',
  4: '4º Passo — Causa Raiz. Usem 5 Porquês + Ishikawa. PROIBIDO: "falta de atenção", "erro humano". A causa precisa ser sistêmica.',
  5: '5º Passo — Contramedidas. Cada ação precisa atacar diretamente a causa raiz. "Retreinar" é ação fraca.',
  6: '6º Passo — Plano de Ação. Responsável + prazo para cada contramedida. Sem "a equipe vai resolver".',
  7: '7º Passo — Verificar. Antes vs. Depois com DADOS. Meta atingida? Se não, voltem ao Passo 4.',
  8: '8º Passo — Padronizar e Replicar. Documentem o novo padrão. Onde mais pode ser aplicado?',
};

// ════════════════════════════════════
// SCHEDULER — consciência de contexto
// ════════════════════════════════════
//
// O facilitador humano nunca interrompe uma reunião ativa.
// Ele espera uma pausa. Então fala.
// O scheduler replica esse comportamento.

/**
 * Verifica se a IA pode falar agora.
 * Regra: silêncio > 2 min desde última ação humana.
 */
function canSpeakNow(mem: ProjectMemory): boolean {
  if (mem.lastHumanMessageAt === 0) return true; // nunca houve msg humana
  return Date.now() - mem.lastHumanMessageAt > SILENCE_WINDOW_MS;
}

/**
 * Agenda uma intervenção. Não envia imediatamente.
 *
 * Se a intervenção é resposta direta a ação do humano
 * (requirement_completed, phase_advanced) → delay curto (5s).
 * Senão → delay baseado no silêncio necessário.
 */
function scheduleIntervention(
  projectId: string,
  text: string,
  reason: string,
  immediate = false,
): void {
  const mem = getMemory(projectId);
  const delay = immediate ? 5_000 : SILENCE_WINDOW_MS;

  mem.pendingInterventions.push({
    text,
    scheduledFor: Date.now() + delay,
    reason,
    defers: 0,
  });
}

/**
 * Processa fila de intervenções pendentes.
 * Chamado a cada tick do timer.
 *
 * Se pode falar → entrega a mais antiga.
 * Se chat ativo → reagenda +2min (até MAX_DEFERS).
 * Se excedeu MAX_DEFERS → entrega mesmo assim (a mensagem é importante).
 */
async function deliverPendingInterventions(projectId: string, mem: ProjectMemory): Promise<void> {
  if (mem.pendingInterventions.length === 0) return;

  const now = Date.now();
  const ready: ScheduledIntervention[] = [];
  const kept: ScheduledIntervention[] = [];

  for (const intervention of mem.pendingInterventions) {
    if (intervention.scheduledFor <= now) {
      ready.push(intervention);
    } else {
      kept.push(intervention);
    }
  }

  // Nada pronto ainda
  if (ready.length === 0) {
    return;
  }

  // Chat ativo? Reagendar tudo que estava pronto.
  if (!canSpeakNow(mem)) {
    for (const intervention of ready) {
      if (intervention.defers < MAX_DEFERS) {
        intervention.scheduledFor = now + SILENCE_WINDOW_MS;
        intervention.defers += 1;
        kept.push(intervention);
      } else {
        // Excedeu espera máxima — entrega forçada
        await injectMessage(projectId, intervention.text);
      }
    }
    mem.pendingInterventions = kept;
    return;
  }

  // Silêncio confirmado — entregar (mais antiga primeiro)
  // Entregar apenas 1 por ciclo para não floodar
  const oldest = ready.shift()!;
  await injectMessage(projectId, oldest.text);

  // Devolver o resto para a fila
  mem.pendingInterventions = [...ready, ...kept];
}

// ════════════════════════════════════
// CORE: REAÇÕES A EVENTOS
// ════════════════════════════════════

async function react(event: DomainEvent): Promise<void> {
  const mem = getMemory(event.projectId);
  mem.lastEventAt = event.timestamp;

  // Rastrear presença humana
  const isHumanAction = event.actorId && event.actorId !== AUTOR_ID;
  if (isHumanAction) {
    mem.lastHumanMessageAt = event.timestamp;
  }

  // Recalcular perfil
  mem.currentProfile = evaluateBehavior(mem);

  switch (event.type) {
    case 'requirement_completed':
      await onRequirementCompleted(event, mem);
      break;
    case 'phase_advanced':
      await onPhaseAdvanced(event, mem);
      break;
    case 'decision_recorded':
    case 'message_linked':
    case 'evidence_added':
      onActivityTracked(event, mem);
      break;
    case 'nudge_sent':
      // Nudge do líder = ação humana recente → atualizar timestamp
      mem.lastHumanMessageAt = event.timestamp;
      break;
    default:
      break;
  }
}

// ── Requisito cumprido ──

async function onRequirementCompleted(
  event: DomainEvent,
  mem: ProjectMemory,
): Promise<void> {
  mem.completedInPhase += 1;
  mem.lastProgressAt = Date.now();
  if (event.actorId) mem.participantsInPhase.add(event.actorId);
  mem.currentProfile = evaluateBehavior(mem);

  if (!canReact(mem, 'requirement_completed')) return;

  const msgs = PROGRESS_MESSAGES[mem.currentProfile];
  const emoji = PROFILE_EMOJI[mem.currentProfile];

  // ✦ Resposta direta → immediate = true (delay curto de 5s)
  scheduleIntervention(
    event.projectId,
    `${emoji} ${pick(msgs)}`,
    'requirement_completed',
    true,
  );
  markCooldown(mem, 'requirement_completed');

  // Verificar liberação da fase
  try {
    const projeto = await mockProjetosDb.buscarProjeto(event.projectId);
    const status = calcularStatusProjeto(projeto);
    const newPending = status.bloqueio.pendentes.length;
    mem.pendingCount = newPending;

    if (status.bloqueio.podeSeguir) {
      scheduleIntervention(
        event.projectId,
        `✅ Todos os requisitos da Fase ${status.projeto.faseAtual} cumpridos. A fase pode avançar.`,
        'phase_unlocked',
        true,
      );
    } else if (newPending <= 2) {
      scheduleIntervention(
        event.projectId,
        `Faltam apenas ${newPending} requisito${newPending > 1 ? 's' : ''} para liberar a fase.`,
        'near_completion',
        true,
      );
    }
  } catch { /* */ }
}

// ── Fase avançou ──

async function onPhaseAdvanced(
  event: DomainEvent,
  mem: ProjectMemory,
): Promise<void> {
  const now = Date.now();

  if (mem.lastPhase > 0 && mem.phaseStartAt > 0) {
    const durationDays = (now - mem.phaseStartAt) / (24 * 3600_000);
    mem.phaseDurations.set(mem.lastPhase, durationDays);
  }

  // Reset
  mem.phaseStartAt = now;
  mem.lastProgressAt = now;
  mem.messageCountInPhase = 0;
  mem.completedInPhase = 0;
  mem.participantsInPhase.clear();
  mem.previousPendingCount = -1;
  mem.currentProfile = 'SAUDAVEL';

  // Limpar intervenções antigas (fase mudou, contexto mudou)
  mem.pendingInterventions = [];

  if (!canReact(mem, 'phase_advanced')) return;

  try {
    const projeto = await mockProjetosDb.buscarProjeto(event.projectId);
    const novaFase = projeto.faseAtual;
    const label = FASE_LABELS[novaFase] ?? `Fase ${novaFase}`;
    mem.lastPhase = novaFase;
    mem.pendingCount = 0;

    const orientacao = PHASE_MESSAGES[novaFase] ?? 'Revisem o checklist para os novos requisitos.';

    // ✦ Resposta direta → immediate
    scheduleIntervention(
      event.projectId,
      `🎯 Fase avançada para ${novaFase} — ${label}.\n${orientacao}`,
      'phase_advanced',
      true,
    );
    markCooldown(mem, 'phase_advanced');
  } catch {
    scheduleIntervention(event.projectId, '🎯 Fase avançada. Revisem o checklist.', 'phase_advanced', true);
    markCooldown(mem, 'phase_advanced');
  }
}

// ── Atividade rastreada ──

function onActivityTracked(event: DomainEvent, mem: ProjectMemory): void {
  mem.messageCountInPhase += 1;
  if (event.actorId) mem.participantsInPhase.add(event.actorId);
}

// ════════════════════════════════════
// TIMER PERIÓDICO
// ════════════════════════════════════

let timerHandle: ReturnType<typeof setInterval> | null = null;

async function runPeriodicChecks(): Promise<void> {
  for (const [projectId, mem] of memory.entries()) {
    try {
      mem.currentProfile = evaluateBehavior(mem);

      // Primeiro: entregar intervenções agendadas (se janela aberta)
      await deliverPendingInterventions(projectId, mem);

      // Depois: gerar novas intervenções (que entram na fila)
      checkInactivity(projectId, mem);
      checkDeadline(projectId, mem);
      await checkStagnation(projectId, mem);
    } catch {
      memory.delete(projectId);
    }
  }

  // Cleanup inactive projects (>30 days without events)
  const CLEANUP_THRESHOLD = 30 * 24 * 3600_000;
  for (const [projectId, mem] of memory.entries()) {
    if (Date.now() - mem.lastEventAt > CLEANUP_THRESHOLD) {
      memory.delete(projectId);
    }
  }
}

// ── Inatividade ──

function checkInactivity(projectId: string, mem: ProjectMemory): void {
  const elapsed = Date.now() - mem.lastEventAt;
  if (elapsed < INACTIVITY_MS) return;
  if (!canReact(mem, 'inactivity')) return;

  const msgs = INACTIVITY_MESSAGES[mem.currentProfile];
  if (msgs.length === 0) return;

  const emoji = PROFILE_EMOJI[mem.currentProfile];
  scheduleIntervention(projectId, `${emoji} ${pick(msgs)}`, 'inactivity');
  markCooldown(mem, 'inactivity');
}

// ── Prazo ──

function checkDeadline(projectId: string, mem: ProjectMemory): void {
  if (!canReact(mem, 'deadline')) return;

  // Deadline check needs project data — schedule async check
  mockProjetosDb.buscarProjeto(projectId).then((projeto) => {
    const status = calcularStatusProjeto(projeto);
    if (status.diasRestantes < 0 || status.diasRestantes > DEADLINE_WARNING_DAYS) return;

    const fasesRestantes = TOTAL_FASES - status.projeto.faseAtual;
    let msg: string;

    if (status.diasRestantes <= 3) {
      msg = `🚨 URGENTE: ${status.diasRestantes}d para apresentação e ${fasesRestantes} fase${fasesRestantes > 1 ? 's' : ''} restante${fasesRestantes > 1 ? 's' : ''}. Modo emergência.`;
    } else if (mem.currentProfile === 'PASSIVO') {
      msg = `🚨 ${status.diasRestantes}d para apresentação e o projeto está parado. Mobilizem agora.`;
    } else if (mem.currentProfile === 'DESORGANIZADO') {
      msg = `🚨 ${status.diasRestantes}d para apresentação. Parem de dispersar e foquem só no que é obrigatório.`;
    } else {
      msg = `🚨 Menos de ${DEADLINE_WARNING_DAYS} dias para apresentação. Foquem no essencial. (${status.diasRestantes}d restantes)`;
    }

    scheduleIntervention(projectId, msg, 'deadline');
    markCooldown(mem, 'deadline');
  }).catch(() => { /* projeto removido */ });
}

// ════════════════════════════════════
// ESTAGNAÇÃO
// ════════════════════════════════════

async function checkStagnation(projectId: string, mem: ProjectMemory): Promise<void> {
  if (mem.currentProfile === 'SAUDAVEL') return;

  const now = Date.now();
  const daysInPhase = (now - mem.phaseStartAt) / (24 * 3600_000);

  const projeto = await mockProjetosDb.buscarProjeto(projectId);
  const status = calcularStatusProjeto(projeto);
  const currentPending = status.bloqueio.pendentes.length;

  if (mem.previousPendingCount < 0) {
    mem.previousPendingCount = currentPending;
    mem.pendingCount = currentPending;
    return;
  }

  if (currentPending !== mem.previousPendingCount) {
    mem.lastProgressAt = now;
    mem.previousPendingCount = currentPending;
  }
  mem.pendingCount = currentPending;

  const profile = mem.currentProfile;
  const daysSinceProgress = (now - mem.lastProgressAt) / (24 * 3600_000);
  const stag = STAGNATION_MESSAGES[profile];

  // ── Atividade sem progresso ──
  if (
    daysInPhase > STAGNATION_DAYS && daysSinceProgress > STAGNATION_DAYS &&
    mem.messageCountInPhase > 0 && mem.pendingCount > 0 &&
    stag.noProgress.length > 0 && canReact(mem, 'stagnation_no_progress')
  ) {
    scheduleIntervention(projectId, `${PROFILE_EMOJI[profile]} ${pick(stag.noProgress)}`, 'stagnation_no_progress');
    markCooldown(mem, 'stagnation_no_progress');
  }

  // ── Muita conversa, pouca evidência ──
  if (
    mem.messageCountInPhase >= TALK_THRESHOLD && mem.completedInPhase < TALK_MIN_COMPLETED &&
    stag.talkOnly.length > 0 && canReact(mem, 'stagnation_talk_only')
  ) {
    scheduleIntervention(projectId, `${PROFILE_EMOJI[profile]} ${pick(stag.talkOnly)}`, 'stagnation_talk_only');
    markCooldown(mem, 'stagnation_talk_only');
  }

  // ── Projeto individual ──
  if (
    mem.participantsInPhase.size <= 1 && mem.messageCountInPhase >= 3 && daysInPhase > 2 &&
    stag.solo.length > 0 && canReact(mem, 'stagnation_solo')
  ) {
    scheduleIntervention(projectId, `${PROFILE_EMOJI[profile]} ${pick(stag.solo)}`, 'stagnation_solo');
    markCooldown(mem, 'stagnation_solo');
  }

  // ── Fase 4 longa ──
  if (mem.lastPhase === 4 && stag.phase4.length > 0 && canReact(mem, 'stagnation_phase4')) {
    const avgOther = getAverageOtherPhaseDuration(mem);
    const shouldWarn = (avgOther > 0 && daysInPhase > avgOther * PHASE4_EXTRA_FACTOR) || daysInPhase > 10;
    if (shouldWarn) {
      scheduleIntervention(projectId, `${PROFILE_EMOJI[profile]} ${pick(stag.phase4)}`, 'stagnation_phase4');
      markCooldown(mem, 'stagnation_phase4');
    }
  }
}

// ════════════════════════════════════
// HELPERS
// ════════════════════════════════════

function canReact(mem: ProjectMemory, type: string): boolean {
  const last = mem.cooldowns.get(type);
  if (!last) return true;
  return Date.now() - last > (COOLDOWNS[type] ?? 10_000);
}

function markCooldown(mem: ProjectMemory, type: string): void {
  mem.cooldowns.set(type, Date.now());
}

function getAverageOtherPhaseDuration(mem: ProjectMemory): number {
  const d: number[] = [];
  for (const [phase, days] of mem.phaseDurations.entries()) {
    if (phase !== 4) d.push(days);
  }
  return d.length === 0 ? 0 : d.reduce((a, b) => a + b, 0) / d.length;
}

function pick<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('pick() called on empty array');
  return arr[Math.floor(Math.random() * arr.length)];
}

async function injectMessage(projectId: string, text: string): Promise<void> {
  try {
    await mockConversaDb.enviarMensagem(projectId, AUTOR_ID, AUTOR_NOME, 0, text);
  } catch (err) {
    console.error('[ReactionEngine] Falha ao injetar mensagem:', err);
  }
}

// ════════════════════════════════════
// LIFECYCLE
// ════════════════════════════════════

let unsubscribe: (() => void) | null = null;

export function startReactionEngine(): void {
  if (unsubscribe) return;

  unsubscribe = subscribeDomainEvents((event) => {
    react(event).catch((err) => console.error('[ReactionEngine] Erro na reação:', err));
  });

  timerHandle = setInterval(() => {
    runPeriodicChecks().catch((err) => console.error('[ReactionEngine] Erro no timer:', err));
  }, CHECK_INTERVAL);

  console.log('[ReactionEngine] Nível 4 (consciência de contexto) ativo.');
}

export function stopReactionEngine(): void {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
  memory.clear();
}

export function registerProject(projectId: string, phase: number): void {
  const mem = getMemory(projectId);
  mem.lastPhase = phase;
  mem.lastEventAt = Date.now();
  if (mem.phaseStartAt === mem.lastEventAt) mem.phaseStartAt = Date.now();
}

export function getProjectProfile(projectId: string): ProjectBehaviorProfile {
  return memory.get(projectId)?.currentProfile ?? 'SAUDAVEL';
}

/**
 * Retorna intervenções pendentes (para debug/UI).
 */
export function getPendingInterventions(projectId: string): ScheduledIntervention[] {
  return memory.get(projectId)?.pendingInterventions ?? [];
}
