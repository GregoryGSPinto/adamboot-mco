/**
 * Autenticação local para demonstração.
 *
 * Credenciais fixas para acesso ao sistema:
 *   email: ccq@arttrens.com
 *   senha: art123
 *
 * Em produção → Azure AD via MSAL.
 */

export const DEV_CREDENTIALS = {
  email: 'ccq@arttrens.com',
  password: 'art123',
};

export const devUser = {
  id: 'arttrens-001',
  name: 'GVS ArtTrens',
  email: 'ccq@arttrens.com',
  roles: ['lider', 'membro'],
};

export const isDevAuth = import.meta.env.VITE_DEV_AUTH === 'true';

// ── Session (in-memory, resets on refresh) ──

let _authenticated = false;

export function devLogin(email: string, password: string): { success: boolean; error?: string } {
  if (email.toLowerCase() !== DEV_CREDENTIALS.email) {
    return { success: false, error: 'E-mail não encontrado' };
  }
  if (password !== DEV_CREDENTIALS.password) {
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
  if (_authenticated) return true;
  // Persist across page refreshes within tab
  if (sessionStorage.getItem('mco-session') === '1') {
    _authenticated = true;
    return true;
  }
  return false;
}
