/**
 * MÓDULO AUDIT — Rastro de auditoria do sistema.
 *
 * Checklist:
 *   [x] Registrar data/hora em todos eventos
 *   [x] Registrar autor e alterações
 *   [x] Histórico de auditoria
 *
 * Cada ação do sistema gera um AuditEntry.
 * Armazenado em memória (mock) → futuro: tabela audit_log no MySQL.
 */

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type AuditAction =
  | 'projeto_criado'
  | 'fase_avancada'
  | 'requisito_cumprido'
  | 'evidencia_anexada'
  | 'acao_criada'
  | 'acao_concluida'
  | 'acao_atualizada'
  | 'decisao_registrada'
  | 'mensagem_enviada'
  | 'reuniao_iniciada'
  | 'reuniao_finalizada'
  | 'presenca_registrada'
  | 'impedimento_registrado'
  | 'impedimento_resolvido'
  | 'cobranca_enviada'
  | 'cobranca_escalada'
  | 'responsavel_substituido'
  | 'prazo_alterado'
  | 'projeto_arquivado'
  | 'projeto_restaurado'
  | 'usuario_desativado'
  | 'usuario_transferido'
  | 'lgpd_consentimento'
  | 'lgpd_exportacao'
  | 'login'
  | 'logout';

export interface AuditEntry {
  id: string;
  timestamp: string;       // ISO 8601
  userId: string;
  userName: string;
  action: AuditAction;
  projectId?: string;
  projectName?: string;
  /** Dados anteriores (para diff) */
  before?: Record<string, unknown>;
  /** Dados novos */
  after?: Record<string, unknown>;
  /** Descrição legível */
  description: string;
  /** IP ou device (futuro) */
  metadata?: Record<string, string>;
}

export interface AuditFilter {
  projectId?: string;
  userId?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
}

// ════════════════════════════════════
// STORE (in-memory mock)
// ════════════════════════════════════

const _log: AuditEntry[] = [];
let _counter = 0;

function generateId(): string {
  _counter++;
  return `audit-${Date.now()}-${_counter}`;
}

/**
 * Registrar entrada no audit trail.
 * Chamar de qualquer mutation ou domain event handler.
 */
export function auditLog(
  entry: Omit<AuditEntry, 'id' | 'timestamp'>,
): AuditEntry {
  const full: AuditEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  _log.push(full);

  // Manter apenas últimos 10.000 registros em memória
  if (_log.length > 10_000) _log.splice(0, _log.length - 10_000);

  return full;
}

/**
 * Consultar log de auditoria com filtros.
 */
export function queryAuditLog(filter?: AuditFilter): AuditEntry[] {
  let results = [..._log];

  if (filter?.projectId) {
    results = results.filter((e) => e.projectId === filter.projectId);
  }
  if (filter?.userId) {
    results = results.filter((e) => e.userId === filter.userId);
  }
  if (filter?.action) {
    results = results.filter((e) => e.action === filter.action);
  }
  if (filter?.from) {
    results = results.filter((e) => e.timestamp >= filter.from!);
  }
  if (filter?.to) {
    results = results.filter((e) => e.timestamp <= filter.to!);
  }

  return results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Exportar log completo (para backup/compliance).
 */
export function exportAuditLog(): AuditEntry[] {
  return [..._log];
}

/**
 * Total de entradas.
 */
export function auditCount(): number {
  return _log.length;
}
