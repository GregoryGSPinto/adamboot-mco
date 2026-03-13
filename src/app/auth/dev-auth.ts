/**
 * Autenticação local para desenvolvimento apenas.
 *
 * ⚠️  AVISO DE SEGURANÇA:
 * Este modo deve ser usado APENAS em ambiente de desenvolvimento local.
 * NUNCA ative VITE_DEV_AUTH=true em produção.
 *
 * Credenciais são configuradas via variáveis de ambiente:
 *   VITE_DEV_AUTH_EMAIL
 *   VITE_DEV_AUTH_PASSWORD
 *
 * Em produção → Azure AD via MSAL (obrigatório).
 */

// Validate environment - block if trying to use dev auth in production
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
const devAuthEnabled = import.meta.env.VITE_DEV_AUTH === 'true';

if (isProduction && devAuthEnabled) {
  throw new Error(
    'SECURITY ERROR: VITE_DEV_AUTH cannot be true in production. ' +
      'Authentication bypass is not allowed in production environments.'
  );
}

// Get credentials from environment variables (only for development)
const DEV_EMAIL = import.meta.env.VITE_DEV_AUTH_EMAIL || '';
const DEV_PASSWORD = import.meta.env.VITE_DEV_AUTH_PASSWORD || '';

// Validate that credentials are configured when dev auth is enabled
if (devAuthEnabled && (!DEV_EMAIL || !DEV_PASSWORD)) {
  console.warn(
    '[dev-auth] Dev auth is enabled but credentials are not configured. ' +
      'Set VITE_DEV_AUTH_EMAIL and VITE_DEV_AUTH_PASSWORD environment variables.'
  );
}

export const DEV_CREDENTIALS = {
  email: DEV_EMAIL,
  password: DEV_PASSWORD,
} as const;

export const devUser = {
  id: 'demo-user-001',
  name: 'Usuario Demo',
  email: DEV_EMAIL || 'demo@mco.vale.com',
  roles: ['lider', 'membro'],
} as const;

/**
 * Dev auth is active ONLY when explicitly enabled AND in development mode.
 * Set VITE_DEV_AUTH=true in .env.local for development only.
 */
export const isDevAuth = !isProduction && devAuthEnabled;

// ── Session (in-memory, resets on refresh) ──

let _authenticated = false;

export function devLogin(email: string, password: string): { success: boolean; error?: string } {
  // Additional safety check
  if (isProduction) {
    return { success: false, error: 'Dev auth not available in production' };
  }

  if (!DEV_EMAIL || !DEV_PASSWORD) {
    return { success: false, error: 'Dev auth credentials not configured' };
  }

  if (email.toLowerCase() !== DEV_EMAIL.toLowerCase()) {
    return { success: false, error: 'E-mail não encontrado' };
  }
  if (password !== DEV_PASSWORD) {
    return { success: false, error: 'Senha incorreta' };
  }
  _authenticated = true;
  sessionStorage.setItem('mco-session', '1');
  return { success: true };
}

export function devLogout(): void {
  _authenticated = false;
  sessionStorage.removeItem('mco-session');
}

export function isDevAuthenticated(): boolean {
  // Never allow dev auth in production
  if (isProduction) return false;

  if (_authenticated) return true;
  // Persist across page refreshes within tab
  if (sessionStorage.getItem('mco-session') === '1') {
    _authenticated = true;
    return true;
  }
  return false;
}
