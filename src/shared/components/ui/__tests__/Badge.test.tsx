import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('deve renderizar texto', () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('deve renderizar variant default', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve renderizar variant success', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve renderizar variant warning', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve renderizar variant danger', () => {
    const { container } = render(<Badge variant="danger">Error</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve renderizar variant info', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve renderizar variant teal', () => {
    const { container } = render(<Badge variant="teal">Teal</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
