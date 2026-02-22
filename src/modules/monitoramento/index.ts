/**
 * MÓDULO MONITORAMENTO — Saúde do aplicativo.
 *
 * Checklist:
 *   [x] Registrar crash do aplicativo
 *   [x] Registrar falhas de sincronização
 *   [x] Medir tempo de upload de fotos
 *   [x] Detectar telas lentas
 *   [x] Avisar armazenamento cheio
 */

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type EventoSaudeType =
  | 'crash'
  | 'sync_error'
  | 'upload_slow'
  | 'screen_slow'
  | 'storage_warning'
  | 'storage_full'
  | 'network_error'
  | 'api_error';

export interface EventoSaude {
  id: string;
  tipo: EventoSaudeType;
  mensagem: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
}

export interface HealthStats {
  crashes: number;
  syncErrors: number;
  slowUploads: number;
  avgUploadMs: number;
  storageUsedPercent: number;
  uptime: number; // seconds since app started
}

// ════════════════════════════════════
// STORE
// ════════════════════════════════════

const _eventos: EventoSaude[] = [];
const _uploadTimes: number[] = [];
let _counter = 0;
const _startTime = Date.now();

const _listeners = new Set<(evento: EventoSaude) => void>();

// ════════════════════════════════════
// API
// ════════════════════════════════════

/**
 * Registrar evento de saúde.
 */
export function registrarEvento(
  tipo: EventoSaudeType,
  mensagem: string,
  metadata?: Record<string, string | number>,
): EventoSaude {
  _counter++;
  const evento: EventoSaude = {
    id: `health-${Date.now()}-${_counter}`,
    tipo,
    mensagem,
    timestamp: new Date().toISOString(),
    metadata,
  };

  _eventos.push(evento);
  if (_eventos.length > 1000) _eventos.splice(0, _eventos.length - 1000);

  _listeners.forEach((fn) => fn(evento));

  // Log no console para debug
  if (tipo === 'crash' || tipo === 'storage_full') {
    console.error(`[MCO Health] ${tipo}: ${mensagem}`, metadata);
  }

  return evento;
}

/**
 * Escutar eventos de saúde.
 */
export function subscribeHealth(listener: (evento: EventoSaude) => void): () => void {
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
}

/**
 * Medir tempo de upload de foto.
 */
export function medirUpload(startMs: number): number {
  const duration = Date.now() - startMs;
  _uploadTimes.push(duration);
  if (_uploadTimes.length > 100) _uploadTimes.splice(0, _uploadTimes.length - 100);

  if (duration > 10_000) {
    registrarEvento('upload_slow', `Upload demorou ${(duration / 1000).toFixed(1)}s`, {
      durationMs: duration,
    });
  }

  return duration;
}

/**
 * Medir tempo de renderização de tela.
 */
export function medirTela(nome: string, startMs: number): void {
  const duration = Date.now() - startMs;
  if (duration > 3000) {
    registrarEvento('screen_slow', `Tela "${nome}" demorou ${(duration / 1000).toFixed(1)}s`, {
      screen: nome,
      durationMs: duration,
    });
  }
}

/**
 * Verificar armazenamento disponível.
 */
export async function verificarStorage(): Promise<{
  usedMB: number;
  totalMB: number;
  percentUsed: number;
}> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = (estimate.usage ?? 0) / (1024 * 1024);
      const total = (estimate.quota ?? 0) / (1024 * 1024);
      const percent = total > 0 ? (used / total) * 100 : 0;

      if (percent > 90) {
        registrarEvento('storage_full', `Armazenamento ${percent.toFixed(0)}% cheio`, {
          usedMB: Math.round(used),
          totalMB: Math.round(total),
        });
      } else if (percent > 75) {
        registrarEvento('storage_warning', `Armazenamento ${percent.toFixed(0)}% usado`, {
          usedMB: Math.round(used),
          totalMB: Math.round(total),
        });
      }

      return { usedMB: Math.round(used), totalMB: Math.round(total), percentUsed: percent };
    }
  } catch { /* Storage API not available */ }

  return { usedMB: 0, totalMB: 0, percentUsed: 0 };
}

/**
 * Estatísticas gerais de saúde.
 */
export function getHealthStats(): HealthStats {
  const avgUpload = _uploadTimes.length > 0
    ? _uploadTimes.reduce((a, b) => a + b, 0) / _uploadTimes.length
    : 0;

  return {
    crashes: _eventos.filter((e) => e.tipo === 'crash').length,
    syncErrors: _eventos.filter((e) => e.tipo === 'sync_error').length,
    slowUploads: _eventos.filter((e) => e.tipo === 'upload_slow').length,
    avgUploadMs: Math.round(avgUpload),
    storageUsedPercent: 0,
    uptime: Math.round((Date.now() - _startTime) / 1000),
  };
}

/**
 * Todos os eventos (para tela de admin/debug).
 */
export function getEventosSaude(): EventoSaude[] {
  return [..._eventos].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Iniciar captura global de erros.
 */
export function initErrorCapture(): () => void {
  const handler = (event: ErrorEvent) => {
    registrarEvento('crash', event.message, {
      filename: event.filename ?? 'unknown',
      lineno: event.lineno ?? 0,
      colno: event.colno ?? 0,
    });
  };

  const rejectionHandler = (event: PromiseRejectionEvent) => {
    registrarEvento('crash', `Unhandled rejection: ${event.reason}`, {});
  };

  window.addEventListener('error', handler);
  window.addEventListener('unhandledrejection', rejectionHandler);

  return () => {
    window.removeEventListener('error', handler);
    window.removeEventListener('unhandledrejection', rejectionHandler);
  };
}
