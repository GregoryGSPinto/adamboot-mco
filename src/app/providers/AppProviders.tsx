import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';

interface Props {
  children: ReactNode;
}

/**
 * Composição de providers na ordem correta:
 *   1. BrowserRouter (navegação)
 *   2. AuthProvider (MSAL — necessário ANTES de queries autenticadas)
 *   3. QueryProvider (TanStack Query — usa token do auth)
 */
export function AppProviders({ children }: Props) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryProvider>
          {children}
        </QueryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
