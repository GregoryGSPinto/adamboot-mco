import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('deve renderizar input', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('deve chamar onChange quando valor muda', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Test" />);

    const input = screen.getByPlaceholderText('Test');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('deve estar desabilitado quando disabled é true', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('deve mostrar label quando fornecida', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('deve mostrar erro quando error é fornecido', () => {
    render(<Input error="Campo obrigatório" placeholder="Test" />);
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('deve aplicar type corretamente', () => {
    render(<Input type="password" placeholder="Senha" />);
    expect(screen.getByPlaceholderText('Senha')).toHaveAttribute('type', 'password');
  });
});
