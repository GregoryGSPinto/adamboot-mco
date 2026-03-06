import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { radii, fontSizes, fontWeights, shadows, zIndex } from '@shared/design/tokens';

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

const typeStyles: Record<ToastType, React.CSSProperties> = {
  success: { background: '#0c1917', borderLeft: '3px solid #69be28', color: '#69be28' },
  error:   { background: '#1a0c0c', borderLeft: '3px solid #ef4444', color: '#ef4444' },
  warning: { background: '#1a1708', borderLeft: '3px solid #edb111', color: '#edb111' },
  info:    { background: '#0c161a', borderLeft: '3px solid #00b0ca', color: '#00b0ca' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++_counter;
    setToasts((prev) => {
      const next = [...prev, { id, type, message }];
      return next.slice(-MAX_VISIBLE);
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div style={{
        position: 'fixed', top: '1rem', right: '1rem',
        zIndex: zIndex.toast, display: 'flex', flexDirection: 'column', gap: '0.5rem',
        pointerEvents: 'none',
      }}>
        {toasts.map((t, i) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: radii.md,
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.medium,
              boxShadow: shadows.lg,
              cursor: 'pointer',
              pointerEvents: 'auto',
              maxWidth: 360,
              animation: 'toast-slide-in 0.25s ease',
              transform: `translateY(${i * 2}px)`,
              ...typeStyles[t.type],
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
