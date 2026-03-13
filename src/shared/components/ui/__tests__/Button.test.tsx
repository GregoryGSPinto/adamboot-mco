import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('deve renderizar com texto', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando disabled é true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('deve renderizar variant primary por padrão', () => {
    const { container } = render(<Button>Primary</Button>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve renderizar variant secondary', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve renderizar variant danger', () => {
    const { container } = render(<Button variant="danger">Danger</Button>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve renderizar size small', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve renderizar size large', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve mostrar loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByText('Loading')).toBeDisabled();
    // Should have spinner element
    expect(document.querySelector('span')).toBeInTheDocument();
  });
});
