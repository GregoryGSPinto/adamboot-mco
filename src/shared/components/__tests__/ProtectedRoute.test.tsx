import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock('@app/auth', () => ({
  useAuth: () => mockUseAuth(),
  devUser: { roles: ['lider', 'membro'] },
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar loading quando está verificando autenticação', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Verificando autenticacao...')).toBeInTheDocument();
  });

  it('deve renderizar children quando autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User' },
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('deve bloquear acesso quando usuário não tem role necessária', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User' },
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRoles={['admin']}>
          <div data-testid="protected-content">Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(
      screen.getByText('Acesso restrito. Voce nao tem permissao para acessar esta pagina.')
    ).toBeInTheDocument();
  });

  it('deve permitir acesso quando usuário tem role necessária', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User' },
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRoles={['lider']}>
          <div data-testid="protected-content">Lider Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
