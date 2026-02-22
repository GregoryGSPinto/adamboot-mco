import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: 'var(--border-default)', fontFamily: 'var(--font-mono)' }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Página não encontrada.</p>
      <Link to="/" style={{ color: 'var(--vale-teal-light)' }}>Voltar para o início</Link>
    </div>
  );
}
