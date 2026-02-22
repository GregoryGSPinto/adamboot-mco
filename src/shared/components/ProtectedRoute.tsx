import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@app/auth';

interface Props {
  children: ReactNode;
}

/**
 * Wrapper que exige autenticação.
 * Se não autenticado → redireciona para login (/).
 */
export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verificando autenticação...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
