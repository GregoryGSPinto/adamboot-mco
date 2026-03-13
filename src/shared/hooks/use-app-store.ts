import { create } from 'zustand';

/**
 * Store global MCO (Zustand).
 * Tema persiste em localStorage.
 * Dados do servidor → TanStack Query. Estado de UI → aqui.
 */

type Theme = 'dark' | 'light';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timeoutId?: number;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('mco-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mco-theme', theme);
}

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;

  notifications: Notification[];
  notify: (type: Notification['type'], message: string) => void;
  dismissNotification: (id: string) => void;

  tenantId: string;
  setTenantId: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  // Apply initial theme on store creation
  const initialTheme = getInitialTheme();
  if (typeof window !== 'undefined') {
    applyTheme(initialTheme);
  }

  return {
    theme: initialTheme,
    toggleTheme: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      set({ theme: next });
    },
    setTheme: t => {
      applyTheme(t);
      set({ theme: t });
    },

    sidebarOpen: true,
    toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

    notifications: [],
    notify: (type, message) => {
      const id = crypto.randomUUID();

      // Auto-dismiss after 4s
      const timeoutId = window.setTimeout(() => {
        set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
      }, 4000);

      set(s => ({
        notifications: [...s.notifications, { id, type, message, timeoutId }],
      }));
    },
    dismissNotification: id =>
      set(s => {
        const notification = s.notifications.find(n => n.id === id);
        if (notification?.timeoutId) {
          clearTimeout(notification.timeoutId);
        }
        return { notifications: s.notifications.filter(n => n.id !== id) };
      }),

    tenantId: 'vale-ferrovias',
    setTenantId: id => set({ tenantId: id }),
  };
});
