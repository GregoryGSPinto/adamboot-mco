import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@shared/errors';

/**
 * Configuração global do TanStack Query.
 *
 * Políticas:
 *   - staleTime: 30s (dados "frescos" por 30s)
 *   - retry: 1x para erros genéricos, 0 para 4xx
 *   - refetchOnWindowFocus: ativo (atualiza ao voltar para aba)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          // Não retry para erros de cliente (4xx)
          if (error.statusCode >= 400 && error.statusCode < 500) return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      // Mutações não fazem retry automático — tratado pelo useApiMutation
      retry: false,
    },
  },
});

/** Acesso direto ao queryClient (para uso fora de componentes) */
export { queryClient };

interface Props {
  children: ReactNode;
}

export function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools removido — usar extensão do navegador se necessário */}
    </QueryClientProvider>
  );
}
