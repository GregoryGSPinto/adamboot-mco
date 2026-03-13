import type React from 'react';
import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@app/auth';
import { useAppStore } from '@shared/hooks/use-app-store';

interface Props {
  children: ReactNode;
}

const NAV_ITEMS = [
  {
    path: '/missao',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4',
  },
  {
    path: '/projeto',
    label: 'Projetos',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    path: '/chat',
    label: 'Conversa',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  {
    path: '/minhas-missoes',
    label: 'Tarefas',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    path: '/apresentacao',
    label: 'Indicadores',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    path: '/notas',
    label: 'Notas',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
  {
    path: '/library',
    label: 'Biblioteca',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    path: '/acervo',
    label: 'Acervo',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  },
  {
    path: '/auditoria',
    label: 'Auditoria',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    path: '/admin',
    label: 'Admin',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  },
  {
    path: '/perfil',
    label: 'Perfil',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

export function AppLayout({ children }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme, notifications, dismissNotification } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/projeto')
      return location.pathname === '/projeto' || location.pathname.startsWith('/projeto/');
    return location.pathname === path;
  };

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close menu on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={headerInner}>
          {/* Left: hamburger (mobile) + logo + nav tabs (desktop) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAuthenticated && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={hamburgerBtn}
                data-hamburger
                aria-label="Menu"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 7.75zm0 5A.75.75 0 011.75 12h12.5a.75.75 0 010 1.5H1.75a.75.75 0 01-.75-.75z" />
                </svg>
              </button>
            )}
            <Link to="/" style={logoStyle}>
              MCO
            </Link>

            {/* Desktop header tabs — top 4 nav items */}
            {isAuthenticated && (
              <nav style={headerNav} data-header-nav>
                {NAV_ITEMS.slice(0, 4).map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      style={{
                        ...headerTabStyle,
                        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                        borderBottomColor: active ? 'var(--accent-green)' : 'transparent',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right: theme toggle + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={toggleTheme}
              style={themeToggleBtn}
              aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 12a4 4 0 100-8 4 4 0 000 8zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 13zM16 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0116 8zM3 8a.75.75 0 01-.75.75H.75a.75.75 0 010-1.5h1.5A.75.75 0 013 8z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M9.598 1.591a.75.75 0 01.785-.175 7 7 0 11-8.967 8.967.75.75 0 01.961-.96 5.5 5.5 0 007.046-7.046.75.75 0 01.175-.786z" />
                </svg>
              )}
            </button>
            {isAuthenticated && user && (
              <Link to="/perfil" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    ...avatarStyle,
                    borderColor:
                      location.pathname === '/perfil' ? 'var(--accent-green)' : 'transparent',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar (desktop) */}
        {isAuthenticated && (
          <aside style={sidebarStyle} data-sidebar>
            <nav style={{ padding: '12px 8px' }}>
              {NAV_ITEMS.map(item => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      ...sidebarItemStyle,
                      background: active ? 'var(--hover-bg)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <NavIcon d={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main content */}
        <main style={mainStyle}>{children}</main>
      </div>

      {/* Mobile overlay + drawer */}
      {menuOpen && (
        <>
          <div
            style={overlayStyle}
            onClick={() => setMenuOpen(false)}
            role="presentation"
            aria-hidden="true"
          />
          <div style={mobileDrawerStyle}>
            <div style={drawerHeaderStyle}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} style={closeBtn} aria-label="Close menu">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                </svg>
              </button>
            </div>
            <nav>
              {NAV_ITEMS.map(item => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      ...drawerItemStyle,
                      background: active ? 'var(--hover-bg)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <NavIcon d={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* Toasts */}
      <div style={toastContainerStyle}>
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              ...toastStyle,
              borderLeftColor:
                n.type === 'success'
                  ? 'var(--accent-green)'
                  : n.type === 'error'
                    ? 'var(--accent-red)'
                    : n.type === 'warning'
                      ? 'var(--accent-yellow)'
                      : 'var(--accent-blue)',
            }}
            onClick={() => dismissNotification(n.id)}
          >
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

const headerStyle: React.CSSProperties = {
  height: 48,
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-secondary)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const headerInner: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100%',
  padding: '0 16px',
  maxWidth: 1440,
  margin: '0 auto',
  width: '100%',
};

const logoStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
};

const headerNav: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  marginLeft: '16px',
};

const headerTabStyle: React.CSSProperties = {
  padding: '14px 12px',
  fontSize: '14px',
  textDecoration: 'none',
  borderBottom: '2px solid',
  transition: 'color 0.1s',
  whiteSpace: 'nowrap',
};

const hamburgerBtn: React.CSSProperties = {
  display: 'none', // shown via media query below
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  padding: '4px',
  borderRadius: '6px',
};

const themeToggleBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-secondary)',
  transition: 'background 0.1s',
};

const avatarStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'var(--btn-primary-bg)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '13px',
  border: '2px solid',
  transition: 'border-color 0.1s',
};

const sidebarStyle: React.CSSProperties = {
  width: 240,
  borderRight: '1px solid var(--border)',
  background: 'var(--bg-primary)',
  flexShrink: 0,
  overflowY: 'auto',
  height: 'calc(100vh - 48px)',
  position: 'sticky',
  top: 48,
};

const sidebarItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '14px',
  textDecoration: 'none',
  transition: 'background 0.1s',
  marginBottom: '1px',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: '24px',
  maxWidth: 1200,
  width: '100%',
  margin: '0 auto',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'var(--bg-overlay)',
  zIndex: 500,
};

const mobileDrawerStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  width: 280,
  maxWidth: '80vw',
  background: 'var(--bg-primary)',
  borderRight: '1px solid var(--border)',
  zIndex: 501,
  overflowY: 'auto',
};

const drawerHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderBottom: '1px solid var(--border)',
};

const closeBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const drawerItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  fontSize: '14px',
  textDecoration: 'none',
  transition: 'background 0.1s',
};

const toastContainerStyle: React.CSSProperties = {
  position: 'fixed',
  top: '56px',
  right: '16px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const toastStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderLeft: '3px solid',
  borderRadius: '6px',
  fontSize: '14px',
  boxShadow: 'var(--shadow-md)',
  cursor: 'pointer',
  maxWidth: 360,
  animation: 'toast-slide-in 0.2s ease',
  color: 'var(--text-primary)',
};
