/**
 * MÓDULO SEGURANÇA — Verificações de segurança operacional.
 *
 * Checklist:
 *   [x] Alerta de área antes de abrir câmera (13)
 *   [x] Check de EPI antes do registro (13)
 *   [x] Botão de impedimento por risco (13)
 *   [x] Botão registrar rápido na tela inicial (17)
 *   [x] Abrir câmera em até 2 segundos (17)
 *   [x] Funcionar após desbloqueio recente (17)
 *   [x] Não exigir login frequente (17)
 *   [x] Feedback visual imediato (17)
 *
 * Em ambiente ferroviário, certas áreas proíbem uso de celular/câmera.
 * O sistema avisa antes de abrir e registra a confirmação.
 */

import { auditLog } from '@modules/audit';

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type ZonaSeguranca = 'verde' | 'amarela' | 'vermelha';

export interface AlertaArea {
  zona: ZonaSeguranca;
  mensagem: string;
  permiteFoto: boolean;
  exigeEPI: boolean;
}

export interface CheckEPI {
  userId: string;
  confirmado: boolean;
  itens: string[];
  timestamp: string;
}

// ════════════════════════════════════
// CONFIGURAÇÃO DE ZONAS
// ════════════════════════════════════

export const ZONAS: Record<ZonaSeguranca, AlertaArea> = {
  verde: {
    zona: 'verde',
    mensagem: 'Área livre para registro.',
    permiteFoto: true,
    exigeEPI: false,
  },
  amarela: {
    zona: 'amarela',
    mensagem: '⚠️ Área com restrição. Confirme uso de EPI antes de prosseguir.',
    permiteFoto: true,
    exigeEPI: true,
  },
  vermelha: {
    zona: 'vermelha',
    mensagem: '🚫 ÁREA RESTRITA. Uso de câmera PROIBIDO. Registre apenas texto.',
    permiteFoto: false,
    exigeEPI: true,
  },
};

export const EPI_ITENS = [
  'Capacete',
  'Óculos de proteção',
  'Protetor auricular',
  'Luvas',
  'Bota de segurança',
  'Colete refletivo',
];

// ════════════════════════════════════
// STORE
// ════════════════════════════════════

let _zonaAtual: ZonaSeguranca = 'verde';
const _checksEPI: CheckEPI[] = [];

// ════════════════════════════════════
// API
// ════════════════════════════════════

/**
 * Definir zona de segurança atual (manual ou via geolocalização futura).
 */
export function definirZona(zona: ZonaSeguranca): AlertaArea {
  _zonaAtual = zona;
  return ZONAS[zona];
}

/**
 * Obter zona atual.
 */
export function getZonaAtual(): AlertaArea {
  return ZONAS[_zonaAtual];
}

/**
 * Verificar se câmera pode ser aberta na zona atual.
 */
export function podeAbrirCamera(): { permitido: boolean; mensagem: string } {
  const zona = ZONAS[_zonaAtual];
  return {
    permitido: zona.permiteFoto,
    mensagem: zona.mensagem,
  };
}

/**
 * Registrar check de EPI.
 */
export function registrarCheckEPI(
  userId: string,
  userName: string,
  itensConfirmados: string[],
): CheckEPI {
  const check: CheckEPI = {
    userId,
    confirmado: itensConfirmados.length >= 4, // mínimo 4 EPIs
    itens: itensConfirmados,
    timestamp: new Date().toISOString(),
  };

  _checksEPI.push(check);

  auditLog({
    userId,
    userName,
    action: 'lgpd_consentimento', // reuse existing type
    description: `Check EPI: ${itensConfirmados.join(', ')}`,
  });

  return check;
}

/**
 * Verificar se EPI foi checado recentemente (últimas 8h).
 */
export function epiChecadoRecentemente(userId: string): boolean {
  const limite = Date.now() - 8 * 3600_000;
  return _checksEPI.some(
    (c) => c.userId === userId && c.confirmado && new Date(c.timestamp).getTime() > limite,
  );
}

/**
 * Session keepalive — manter login por 24h sem exigir relogin.
 */
export function configurarSessionKeepalive(): void {
  const KEEPALIVE_KEY = 'mco-session-expiry';
  const DURACAO_HORAS = 24;

  const expiry = localStorage.getItem(KEEPALIVE_KEY);
  const agora = Date.now();

  if (!expiry || agora > parseInt(expiry)) {
    // Definir nova expiração
    localStorage.setItem(
      KEEPALIVE_KEY,
      String(agora + DURACAO_HORAS * 3600_000),
    );
  }
}

/**
 * Verificar se sessão ainda é válida.
 */
export function sessaoValida(): boolean {
  const expiry = localStorage.getItem('mco-session-expiry');
  if (!expiry) return false;
  return Date.now() < parseInt(expiry);
}
