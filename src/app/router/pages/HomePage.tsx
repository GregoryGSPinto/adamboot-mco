import type React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@app/auth';
import { isDevAuth } from '@app/auth';
import { Navigate } from 'react-router-dom';

/**
 * LOGIN — GitHub-minimal flat design.
 * Centered card, system font stack, CSS custom properties only.
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
    setErrorCount(c => c + 1);
  }, [email, password, login]);

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit]
  );

  if (isAuthenticated) return <Navigate to="/missao" replace />;

  return (
    <div style={page}>
      <div style={shake ? { ...card, animation: 'login-shake 0.4s ease' } : card}>
        {/* Title */}
        <div style={titleRow}>
          <span style={titleText}>MCO</span>
        </div>
        <p style={subtitleText}>Motor de Conducao Operacional</p>

        <div style={spacer} />

        {/* Error */}
        {loginError && (
          <div style={errorBox}>
            <span>{loginError}</span>
          </div>
        )}

        {/* Email */}
        <div style={field}>
          <label htmlFor="login-email" style={label}>
            E-mail
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKey}
            placeholder="demo@mco.vale.com"
            autoComplete="email"
            autoFocus
            style={input}
          />
        </div>

        {/* Senha */}
        <div style={field}>
          <label htmlFor="login-password" style={label}>
            Senha
          </label>
          <div style={{ position: 'relative' as const }}>
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={onKey}
              placeholder="******"
              autoComplete="current-password"
              style={input}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={eyeBtn}
              type="button"
              tabIndex={-1}
              aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                {showPw ? (
                  <path d="M8 2C4.5 2 1.7 4.1.3 7.5a.5.5 0 000 .5C1.7 11.4 4.5 14 8 14s6.3-2.6 7.7-6a.5.5 0 000-.5C14.3 4.1 11.5 2 8 2zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6a2 2 0 100 4 2 2 0 000-4z" />
                ) : (
                  <path d="M.7 1.3a.5.5 0 01.7 0l14 14a.5.5 0 01-.7.7l-3-3A8.5 8.5 0 018 14C4.5 14 1.7 11.4.3 8a.5.5 0 010-.5A8.3 8.3 0 013.5 4.2L1.4 2a.5.5 0 010-.7zM5 8a3 3 0 003.9 2.8l-1-1A2 2 0 016.2 8L5 8zm3-6c3.5 0 6.3 2.6 7.7 6a.5.5 0 010 .5 9 9 0 01-1.8 2.4l-1.5-1.5A4 4 0 008 4a4 4 0 00-1 .1L5.6 2.8A8 8 0 018 2z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Entrar */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          style={{
            ...submitBtn,
            opacity: loading || !email || !password ? 0.5 : 1,
            cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
          }}
          aria-label="Entrar"
        >
          {loading ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{ animation: 'spin 0.6s linear infinite' }}
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="28"
                strokeDashoffset="8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            'Entrar'
          )}
        </button>

        {/* Dev mode hint */}
        {isDevAuth && (
          <p style={devHint}>Modo desenvolvimento. Use as credenciais configuradas em .env.local</p>
        )}
      </div>
    </div>
  );
}

// ── Styles ──

const page: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'var(--bg-secondary)',
  padding: 16,
  fontFamily: 'var(--font-family)',
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 360,
  padding: '32px 24px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
};

const titleRow: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: 4,
};

const titleText: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-family)',
};

const subtitleText: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  textAlign: 'center',
  margin: 0,
};

const spacer: React.CSSProperties = {
  height: 24,
};

const errorBox: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--accent-red-subtle)',
  borderLeft: '3px solid var(--accent-red)',
  borderRadius: 6,
  color: 'var(--accent-red)',
  fontSize: 14,
  marginBottom: 16,
};

const field: React.CSSProperties = {
  marginBottom: 16,
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 4,
  fontFamily: 'var(--font-family)',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '6px 12px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 14,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-family)',
  lineHeight: '20px',
  outline: 'none',
};

const eyeBtn: React.CSSProperties = {
  position: 'absolute',
  right: 8,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: 4,
  display: 'flex',
  alignItems: 'center',
};

const submitBtn: React.CSSProperties = {
  width: '100%',
  height: 36,
  marginTop: 4,
  background: 'var(--btn-primary-bg)',
  color: 'var(--btn-primary-text)',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--font-family)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const devHint: React.CSSProperties = {
  textAlign: 'center',
  fontSize: 12,
  color: 'var(--text-muted)',
  marginTop: 16,
};
