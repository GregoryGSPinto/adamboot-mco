import { ReactNode, useEffect, useState } from 'react';
import { MsalProvider as MsalReactProvider } from '@azure/msal-react';
import {
  PublicClientApplication,
  EventType,
  AuthenticationResult,
} from '@azure/msal-browser';
import { msalConfig } from '@app/auth/msal-config';
import { setMsalInstance } from '@shared/api/http-client';
import { isDevAuth } from '@app/auth/dev-auth';

interface Props {
  children: ReactNode;
}

/**
 * Em modo DEV: renderiza children direto (sem MSAL).
 * Em modo PROD: inicializa MSAL e wrapa com MsalProvider.
 */
export function AuthProvider({ children }: Props) {
  if (isDevAuth) {
    return <DevAuthProvider>{children}</DevAuthProvider>;
  }
  return <MsalAuthProvider>{children}</MsalAuthProvider>;
}

/** Dev — passa direto, sem provider externo */
function DevAuthProvider({ children }: Props) {
  useEffect(() => {
    console.log('[DEV] Auth bypassed — usando usuário fictício');
  }, []);
  return <>{children}</>;
}

/** Prod — MSAL v3 com initialize() obrigatório */
function MsalAuthProvider({ children }: Props) {
  const [msalInstance] = useState(() => new PublicClientApplication(msalConfig));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    msalInstance
      .initialize()
      .then(() => {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
        }

        msalInstance.addEventCallback((event) => {
          if (
            event.eventType === EventType.LOGIN_SUCCESS &&
            (event.payload as AuthenticationResult)?.account
          ) {
            msalInstance.setActiveAccount(
              (event.payload as AuthenticationResult).account,
            );
          }
        });

        setMsalInstance(msalInstance);
        setIsReady(true);
      })
      .catch((error) => {
        console.error('[MSAL] Initialization failed:', error);
        setIsReady(true);
      });
  }, [msalInstance]);

  if (!isReady) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Inicializando autenticação...
      </div>
    );
  }

  return (
    <MsalReactProvider instance={msalInstance}>
      {children}
    </MsalReactProvider>
  );
}
