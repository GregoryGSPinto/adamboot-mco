import type React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@app/auth';
import { Navigate } from 'react-router-dom';

/**
 * LOGIN — minimalista.
 * Apenas logo MCO + campos de acesso.
 * Respeita tema global (dark/light).
 */
export function HomePage() {
  const { isAuthenticated, login, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Shake on error
  useEffect(() => {
    if (errorCount > 0) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [errorCount]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setShake(false);
    await login(email, password);
    setLoading(false);
    // Increment errorCount to re-trigger shake on repeated failures.
    // On success, isAuthenticated flips and <Navigate> renders immediately.
    setErrorCount((c) => c + 1);
  }, [email, password, login]);

  const onKey = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSubmit(); }, [handleSubmit]);

  if (isAuthenticated) return <Navigate to="/missao" replace />;

  return (
    <div style={page}>
      <style>{css}</style>
      <div className={`login-card ${shake ? 'login-shake' : ''}`} style={card}>
        {/* Logo */}
        <div style={logoRow}>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--vale-teal)' }}>MCO</span>
        </div>

        {/* Error */}
        {loginError && (
          <div style={errorBox}>
            <span style={{ fontSize: '0.8rem' }}>✕</span>
            <span>{loginError}</span>
          </div>
        )}

        {/* Email */}
        <div style={field}>
          <label htmlFor="login-email" style={label}>E-mail</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey}
            placeholder="demo@mco.vale.com" autoComplete="email" autoFocus style={input} className="login-input" />
        </div>

        {/* Senha */}
        <div style={field}>
          <label htmlFor="login-password" style={label}>Senha</label>
          <div style={{ position: 'relative' }}>
            <input id="login-password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKey} placeholder="••••••" autoComplete="current-password" style={input} className="login-input" />
            <button onClick={() => setShowPw(!showPw)} style={eyeBtn} type="button" tabIndex={-1}
              aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}>
              {showPw ? '◉' : '◎'}
            </button>
          </div>
        </div>

        {/* Entrar */}
        <button onClick={handleSubmit} disabled={loading || !email || !password} className="login-btn" style={submitBtn} aria-label="Entrar">
          {loading ? <span className="login-spinner" /> : 'Entrar'}
        </button>

        <p style={footer}>MCO · Melhoria Continua Operacional · Vale S.A.</p>
      </div>
    </div>
  );
}

const css = `
  @keyframes login-fade { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes login-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
  @keyframes login-spin { to { transform:rotate(360deg) } }
  .login-card { animation: login-fade 0.5s ease-out; }
  .login-shake { animation: login-shake 0.4s ease !important; }
  .login-spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.2); border-top-color:white; border-radius:50%; animation:login-spin 0.6s linear infinite; }
  .login-btn { transition: all 0.15s !important; }
  .login-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,158,153,0.25)!important; }
  .login-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .login-input { transition: border-color 0.2s, box-shadow 0.2s; }
  .login-input:focus { border-color: var(--vale-teal) !important; box-shadow: 0 0 0 3px rgba(0,158,153,0.12) !important; outline:none; }
  .login-input::placeholder { color: var(--text-muted); }
`;

const page: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  minHeight: '100vh', background: 'var(--bg-root)', padding: '1rem',
};
const card: React.CSSProperties = {
  width: '100%', maxWidth: 360, padding: '2.5rem 2rem',
  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
  borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
};
const logoRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '0.625rem', marginBottom: '2rem',
};
const errorBox: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.625rem 0.875rem', background: 'var(--glow-red)',
  border: '1px solid var(--sev-critica)', borderRadius: 10,
  color: 'var(--sev-critica)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '1rem',
};
const field: React.CSSProperties = { marginBottom: '1rem' };
const label: React.CSSProperties = {
  display: 'block', fontSize: '0.6875rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--text-muted)', marginBottom: '0.25rem',
};
const input: React.CSSProperties = {
  width: '100%', padding: '0.75rem 0.875rem',
  background: 'var(--bg-input)', border: '1px solid var(--border-default)',
  borderRadius: 10, fontSize: '0.9375rem', color: 'var(--text-primary)',
  fontFamily: "'IBM Plex Sans', sans-serif",
};
const eyeBtn: React.CSSProperties = {
  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', fontSize: '1rem', padding: '0.25rem',
};
const submitBtn: React.CSSProperties = {
  width: '100%', padding: '0.8125rem', marginTop: '0.5rem',
  background: 'var(--vale-teal)', color: 'white', border: 'none',
  borderRadius: 10, fontSize: '0.9375rem', fontWeight: 700,
  cursor: 'pointer', fontFamily: "'IBM Plex Sans', sans-serif",
  display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 46,
};
const footer: React.CSSProperties = {
  textAlign: 'center', fontSize: '0.5625rem', color: 'var(--text-muted)',
  marginTop: '1.5rem', letterSpacing: '0.02em',
};
