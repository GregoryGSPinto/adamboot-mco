import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '80px 16px' }}>
      <h1 style={{ fontSize: 48, margin: 0, color: 'var(--text-muted)', fontWeight: 700 }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 16 }}>
        Page not found
      </p>
      <Link to="/" style={{ color: 'var(--accent-blue)', fontSize: 14, textDecoration: 'none' }}>
        Go home
      </Link>
    </div>
  );
}
