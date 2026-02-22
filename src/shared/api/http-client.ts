import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { PublicClientApplication } from '@azure/msal-browser';
import { apiScopes } from '@app/auth/msal-config';
import { ApiError, ConcurrencyConflictError } from '@shared/errors';

/**
 * Cliente HTTP corporativo com interceptors:
 *
 *   REQUEST:
 *     - Injeta Bearer token via MSAL (silent → popup fallback)
 *
 *   RESPONSE (erro):
 *     - 401 → redireciona para login
 *     - 409 → lança ConcurrencyConflictError (retry semântico no hook)
 *     - 422 → lança ApiError com dados de validação
 *     - 5xx → lança ApiError genérico
 *
 * Instância criada pelo MsalProvider e injetada via React Context.
 */

let msalInstance: PublicClientApplication | null = null;

/** Chamado uma vez no AppProviders para dar acesso ao MSAL */
export function setMsalInstance(instance: PublicClientApplication): void {
  msalInstance = instance;
}

const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ============================
// REQUEST INTERCEPTOR
// ============================

httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!msalInstance) return config;

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) return config;

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...apiScopes,
        account: accounts[0],
      });
      config.headers.Authorization = `Bearer ${response.accessToken}`;
    } catch {
      // Token expirado e silent falhou — será tratado pelo 401 interceptor
      console.warn('[HTTP] Silent token acquisition failed');
    }

    return config;
  },
);

// ============================
// RESPONSE INTERCEPTOR
// ============================

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Record<string, unknown>>) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data ?? {};

    // 401 — Token inválido/expirado → força login
    if (status === 401) {
      if (msalInstance) {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          try {
            await msalInstance.acquireTokenPopup(apiScopes);
            // Retry request original com novo token
            return httpClient.request(error.config!);
          } catch {
            // Popup falhou — redirecionar para login
            await msalInstance.loginPopup(apiScopes);
          }
        }
      }
      return Promise.reject(
        new ApiError('Sessão expirada. Faça login novamente.', 401, 'UNAUTHORIZED'),
      );
    }

    // 409 — Conflito de concorrência (optimistic locking)
    if (status === 409) {
      return Promise.reject(new ConcurrencyConflictError(data));
    }

    // 422 — Erro de validação de domínio
    if (status === 422) {
      return Promise.reject(
        new ApiError(
          (data.message as string) ?? 'Erro de validação',
          422,
          data.code as string,
          data,
        ),
      );
    }

    // Outros erros
    return Promise.reject(
      new ApiError(
        (data.message as string) ?? error.message ?? 'Erro inesperado',
        status,
        data.code as string,
        data,
      ),
    );
  },
);

export { httpClient };
