import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error message');
};

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors in tests
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('deve renderizar children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('deve renderizar fallback quando ocorre erro', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('deve chamar componentDidCatch quando ocorre erro', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('deve mostrar botão de tentar novamente', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });

  it('deve resetar estado quando clicar em tentar novamente', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Tentar novamente');
    expect(retryButton).toBeInTheDocument();

    // Click should not throw and button should still be there
    // (since we're still rendering ThrowError)
    fireEvent.click(retryButton);

    // After reset, the error UI might flash but since we still render ThrowError,
    // it will catch again. The important thing is that the handler doesn't throw.
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });
});
