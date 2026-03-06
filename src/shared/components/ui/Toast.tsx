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

const typeStyles: Record<ToastType, React.CSSProperties> = {
  success: { background: '#1a3a1a', borderLeft: '3px solid #69be28', color: '#69be28' },
  error: { background: '#3a1a1a', borderLeft: '3px solid #e53935', color: '#e53935' },
  warning: { background: '#3a3a1a', borderLeft: '3px solid #f2c94c', color: '#f2c94c' },
  info: { background: '#1a2a3a', borderLeft: '3px solid #00b0f0', color: '#00b0f0' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++_counter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
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
        {toasts.map((t) => (
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
