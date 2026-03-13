import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { radii, fontSizes, fontWeights, zIndex } from '@shared/design/tokens';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let _counter = 0;
const MAX_VISIBLE = 5;
const AUTO_DISMISS_MS = 5000;

const borderColors: Record<ToastType, string> = {
  success: 'var(--accent-green)',
  error: 'var(--accent-red)',
  warning: 'var(--accent-yellow)',
  info: 'var(--accent-blue)',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++_counter;
    setToasts(prev => {
      const next = [...prev, { id, type, message }];
      return next.slice(-MAX_VISIBLE);
    });
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: zIndex.toast,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              padding: '12px 16px',
              borderRadius: radii.md,
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.medium,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${borderColors[t.type]}`,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              maxWidth: 360,
              animation: 'toast-slide-in 0.2s ease',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
