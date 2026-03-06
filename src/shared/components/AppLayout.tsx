import type React from 'react';
import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@app/auth';
import { useAppStore } from '@shared/hooks/use-app-store';
import { SyncIndicator } from './SyncIndicator';

interface Props { children: ReactNode }

// ════════════════════════════════════
// NAV CONFIG
// ════════════════════════════════════

// Desktop: first 4 visible, rest in "Mais ▼"
// Mobile: first 3 in bottom bar, 4th = Menu (drawer with all)
const PRIMARY_NAV = [
  { path: '/missao',        label: 'Dashboard',     icon: '◎' },
  { path: '/projeto',       label: 'Processos',     icon: '📋' },
  { path: '/apresentacao',  label: 'Indicadores',   icon: '📊' },
  { path: '/notas',         label: 'Notas',         icon: '📝' },
];

const OVERFLOW_NAV = [
  { path: '/chat',            label: 'Conversa',      icon: '💬' },
  { path: '/minhas-missoes',  label: 'Minhas Tarefas', icon: '✅' },
  { path: '/library',         label: 'Documentos',    icon: '📚' },
  { path: '/acervo',          label: 'Acervo',        icon: '🗄' },
  { path: '/auditoria',       label: 'Auditoria',     icon: '🔍' },
  { path: '/admin',           label: 'Admin',         icon: '⚙' },
  { path: '/perfil',          label: 'Perfil',        icon: '👤' },
];

const ALL_NAV = [...PRIMARY_NAV, ...OVERFLOW_NAV];

// Mobile bottom bar: first 3 + Menu
const MOBILE_BAR = PRIMARY_NAV.slice(0, 3);

/**
 * AppLayout — shell responsivo do MCO.
 *
 * Desktop: [LOGO MCO] ─── 4 nav + Mais ▼ ─── avatar
 * Mobile:  header slim + bottom nav (3 + Menu)
 */
export function AppLayout({ children }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme, notifications, dismissNotification } = useAppStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/projeto') return location.pathname === '/projeto' || location.pathname.startsWith('/projeto/');
    return location.pathname === path;
  };

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false); setMoreOpen(false); }, [location.pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Background Watermark */}
      <div style={globalWatermark} />

      {/* Brand bar */}
      <div style={brandBar} />

      {/* ═══ HEADER ═══ */}
      <header className="frost mco-header" style={headerStyle}>
        {/* Left: [LOGO] MCO */}
        <Link to="/" style={logoLink}>
          <span style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--vale-teal)', letterSpacing: '-0.03em' }}>MCO</span>
        </Link>

        {/* Center: Desktop nav (4 visible + Mais ▼) */}
        {isAuthenticated && (
          <nav className="desktop-nav" style={desktopNav}>
            {PRIMARY_NAV.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} style={{
                  ...navLink, color: active ? 'var(--vale-teal-light)' : 'var(--text-muted)',
                  borderBottomColor: active ? 'var(--vale-teal)' : 'transparent',
                  background: active ? 'var(--glow-teal)' : 'transparent',
                }}>
                  <span style={{ fontSize: '0.75rem' }}>{item.icon}</span> {item.label}
                </Link>
              );
            })}

            {/* Mais ▼ dropdown */}
            <div ref={moreRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                style={{
                  ...navLink, cursor: 'pointer', border: 'none', borderBottom: '2px solid transparent',
                  fontFamily: 'var(--font-body)',
                  color: OVERFLOW_NAV.some((n) => isActive(n.path)) ? 'var(--vale-teal-light)' : 'var(--text-muted)',
                  background: OVERFLOW_NAV.some((n) => isActive(n.path)) ? 'var(--glow-teal)' : 'transparent',
                }}
              >
                Mais ▾
              </button>
              {moreOpen && (
                <div style={dropdownMenu}>
                  {OVERFLOW_NAV.map((item) => (
                    <Link key={item.path} to={item.path} style={{
                      ...dropdownItem,
                      color: isActive(item.path) ? 'var(--vale-teal-light)' : 'var(--text-primary)',
                      background: isActive(item.path) ? 'var(--glow-teal)' : 'transparent',
                    }}>
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        )}

        {/* Right: sync indicator + theme toggle + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SyncIndicator />
          <button onClick={toggleTheme} className="theme-toggle"
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
            <div className="theme-toggle-knob">{theme === 'dark' ? '🌙' : '☀'}</div>
          </button>
          {isAuthenticated && user && (
            <Link to="/perfil" style={{ textDecoration: 'none' }}>
              <div style={{
                ...avatarStyle,
                borderColor: location.pathname === '/perfil' ? 'var(--vale-teal)' : 'transparent',
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* ═══ MAIN ═══ */}
      <main style={mainStyle}>{children}</main>

      {/* ═══ FOOTER (desktop only) ═══ */}
      <footer className="hide-mobile" style={footerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={statusDot} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-muted)' }}>
            MCO v1.0 · CCQ Ferrovia · Vale S.A.
          </span>
        </div>
      </footer>

      {/* ═══ MOBILE BOTTOM NAV (3 + Menu) ═══ */}
      {isAuthenticated && (
        <nav className="mobile-bottom-nav">
          {MOBILE_BAR.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} className={active ? 'nav-active' : ''}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {active && <div className="nav-dot" />}
              </Link>
            );
          })}
          {/* 4th button = Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className={menuOpen ? 'nav-active' : ''}
            style={menuBtnStyle}
          >
            <span className="nav-icon">☰</span>
            <span>Menu</span>
          </button>
        </nav>
      )}

      {/* ═══ MOBILE MENU DRAWER ═══ */}
      {menuOpen && (
        <>
          <div style={drawerOverlay} onClick={() => setMenuOpen(false)} />
          <div className="mobile-drawer" style={drawerStyle}>
            <div style={drawerHeader}>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} style={drawerClose}>✕</button>
            </div>
            {ALL_NAV.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} style={{
                  ...drawerItem,
                  color: active ? 'var(--vale-teal-light)' : 'var(--text-primary)',
                  background: active ? 'var(--glow-teal)' : 'transparent',
                  borderLeftColor: active ? 'var(--vale-teal)' : 'transparent',
                }}>
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  <span style={{ fontWeight: active ? 700 : 500 }}>{item.label}</span>
                </Link>
              );
            })}
            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.75rem 0' }} />
            <Link to="/perfil" style={{
              ...drawerItem,
              color: isActive('/perfil') ? 'var(--vale-teal-light)' : 'var(--text-primary)',
              background: isActive('/perfil') ? 'var(--glow-teal)' : 'transparent',
              borderLeftColor: isActive('/perfil') ? 'var(--vale-teal)' : 'transparent',
            }}>
              <span style={{ fontSize: '1rem' }}>⚙</span>
              <span>Perfil</span>
            </Link>
          </div>
        </>
      )}

      {/* ═══ TOASTS ═══ */}
      <div style={toastContainer}>
        {notifications.map((n) => (
          <div key={n.id} className={`toast toast-${n.type === 'warning' ? 'info' : n.type}`}
            onClick={() => dismissNotification(n.id)} style={{ cursor: 'pointer' }}>
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const globalWatermark: React.CSSProperties = {
  position: 'fixed', inset: 0,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center', backgroundSize: 'cover',
  opacity: 0.06, pointerEvents: 'none', zIndex: 0,
};
const brandBar: React.CSSProperties = {
  height: 3,
  background: 'linear-gradient(90deg, var(--vale-teal) 0%, var(--vale-green) 25%, var(--vale-cyan) 50%, var(--vale-gold) 75%, var(--vale-gray) 100%)',
};
const headerStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border-subtle)', padding: '0 1.5rem',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  height: 60, position: 'sticky', top: 0, zIndex: 100, isolation: 'isolate',
};
const logoLink: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  textDecoration: 'none', flexShrink: 0,
};
const desktopNav: React.CSSProperties = {
  display: 'flex', gap: '2px', position: 'absolute',
  left: '50%', transform: 'translateX(-50%)', alignItems: 'center',
};
const navLink: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.375rem',
  padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-sm)',
  fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none',
  borderBottom: '2px solid', transition: 'all 0.15s', whiteSpace: 'nowrap',
};
const dropdownMenu: React.CSSProperties = {
  position: 'absolute', top: '100%', right: 0, marginTop: '0.375rem',
  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
  borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  padding: '0.375rem', minWidth: 180, zIndex: 200,
};
const dropdownItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.625rem',
  padding: '0.625rem 0.875rem', borderRadius: 8,
  fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none',
  transition: 'background 0.15s',
};
const avatarStyle: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', background: 'var(--vale-teal)',
  color: 'var(--text-on-brand)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem',
  flexShrink: 0, cursor: 'pointer', border: '2px solid',
  transition: 'border-color 0.15s',
};
const mainStyle: React.CSSProperties = {
  flex: 1, padding: '1.5rem', maxWidth: 1120, width: '100%',
  margin: '0 auto', position: 'relative', zIndex: 1,
};
const footerStyle: React.CSSProperties = {
  padding: '0.625rem 1.5rem', borderTop: '1px solid var(--border-subtle)',
  display: 'flex', justifyContent: 'center',
};
const statusDot: React.CSSProperties = {
  width: 6, height: 6, borderRadius: '50%',
  background: 'var(--vale-green)', boxShadow: '0 0 6px var(--vale-green)',
};
const menuBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '0.125rem', fontSize: '0.5625rem', fontWeight: 500,
  color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
  padding: '0.25rem 0.5rem', WebkitTapHighlightColor: 'transparent',
};
const drawerOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  zIndex: 500, backdropFilter: 'blur(4px)',
};
const drawerStyle: React.CSSProperties = {
  position: 'fixed', right: 0, top: 0, bottom: 0,
  width: 280, maxWidth: '80vw', background: 'var(--bg-surface)',
  borderLeft: '1px solid var(--border-subtle)',
  zIndex: 501, padding: '1rem', overflowY: 'auto',
  boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
};
const drawerHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '1rem', paddingBottom: '0.75rem',
  borderBottom: '1px solid var(--border-subtle)',
};
const drawerClose: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-default)',
  background: 'var(--bg-input)', color: 'var(--text-muted)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '0.875rem',
};
const drawerItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.75rem 1rem', borderRadius: 8, textDecoration: 'none',
  fontSize: '0.9375rem', borderLeft: '3px solid', transition: 'all 0.15s',
  marginBottom: '0.125rem',
};
const toastContainer: React.CSSProperties = {
  position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000,
  display: 'flex', flexDirection: 'column', gap: '0.5rem',
};
