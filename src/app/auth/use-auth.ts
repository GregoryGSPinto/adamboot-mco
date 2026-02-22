import { useMsal, useAccount } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useState, useCallback } from 'react';
import { loginScopes, apiScopes } from './msal-config';
import { devUser, isDevAuth, devLogin, devLogout, isDevAuthenticated } from './dev-auth';

/**
 * Hook de autenticação.
 *
 * DEV  → login com credenciais (ccq@arttrens.com / art123)
 * PROD → Azure AD via MSAL
 */
export function useAuth() {
  if (isDevAuth) {
    return useDevAuth();
  }
  return useMsalAuth();
}

/** Auth com credenciais para demonstração */
function useDevAuth() {
  const [authenticated, setAuthenticated] = useState(isDevAuthenticated());
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback(async (email?: string, password?: string) => {
    if (!email || !password) {
      setLoginError('Preencha e-mail e senha');
      return;
    }
    const result = devLogin(email, password);
    if (result.success) {
      setLoginError(null);
      setAuthenticated(true);
    } else {
      setLoginError(result.error ?? 'Credenciais inválidas');
    }
  }, []);

  const logout = useCallback(async () => {
    devLogout();
    setAuthenticated(false);
  }, []);

  return {
    isAuthenticated: authenticated,
    isLoading: false,
    account: null,
    user: authenticated
      ? { id: devUser.id, name: devUser.name, email: devUser.email }
      : null,
    login,
    logout,
    loginError,
    getAccessToken: async () => 'dev-token',
  };
}

/** Auth real via MSAL — Azure AD */
function useMsalAuth() {
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] ?? null);

  const isAuthenticated = accounts.length > 0;
  const isLoading = inProgress !== InteractionStatus.None;

  const login = useCallback(async () => {
    try {
      await instance.loginPopup(loginScopes);
    } catch (error) {
      console.error('[Auth] Login failed:', error);
    }
  }, [instance]);

  const logout = useCallback(async () => {
    try {
      await instance.logoutPopup({ postLogoutRedirectUri: '/' });
    } catch (error) {
      console.error('[Auth] Logout failed:', error);
    }
  }, [instance]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!account) return null;
    try {
      const response = await instance.acquireTokenSilent({ ...apiScopes, account });
      return response.accessToken;
    } catch {
      try {
        const response = await instance.acquireTokenPopup(apiScopes);
        return response.accessToken;
      } catch (error) {
        console.error('[Auth] Token acquisition failed:', error);
        return null;
      }
    }
  }, [instance, account]);

  return {
    isAuthenticated,
    isLoading,
    account,
    user: account
      ? { id: account.localAccountId, name: account.name ?? '', email: account.username ?? '' }
      : null,
    login,
    logout,
    loginError: null,
    getAccessToken,
  };
}

export type AuthUser = NonNullable<ReturnType<typeof useAuth>['user']>;
