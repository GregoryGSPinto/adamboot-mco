import { Configuration, LogLevel } from '@azure/msal-browser';

/**
 * Configuração MSAL para Azure AD.
 * Todos os valores vêm de variáveis de ambiente — zero hardcode.
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: import.meta.env.VITE_MSAL_AUTHORITY,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (_level, message, containsPii) => {
        if (!containsPii) {
          console.debug('[MSAL]', message);
        }
      },
    },
  },
};

/** Scopes requisitados para a API backend */
export const apiScopes = {
  scopes: (import.meta.env.VITE_MSAL_SCOPES ?? '').split(',').filter(Boolean),
};

/** Scopes para login (profile básico) */
export const loginScopes = {
  scopes: ['openid', 'profile', 'email'],
};
