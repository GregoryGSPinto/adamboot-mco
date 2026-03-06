import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@app/auth';
import { devUser } from '@app/auth';
import type { Perfil } from '@modules/permissao';

interface Props {
  children: ReactNode;
  requiredRoles?: Perfil[];
}

/**
 * Wrapper que exige autenticacao.
 * Se nao autenticado -> redireciona para login (/).
 * Se roles definidas, verifica contra devUser.roles.
 */
export function ProtectedRoute({ children, requiredRoles }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verificando autenticacao...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = devUser.roles as string[];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Acesso restrito. Voce nao tem permissao para acessar esta pagina.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
