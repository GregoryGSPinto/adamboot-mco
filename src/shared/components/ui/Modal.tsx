import { ReactNode, useEffect, useCallback, useRef } from 'react';
import { radii, shadows, zIndex } from '@shared/design/tokens';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 480 }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    // Focus trap: focus the content on open
    contentRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed', inset: 0, zIndex: zIndex.modal,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'modal-backdrop-in 0.2s ease',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />
      {/* Content */}
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: radii.xl,
          boxShadow: shadows.xl,
          width: '90vw',
          maxWidth: width,
          maxHeight: '85vh',
          overflow: 'auto',
          padding: '1.5rem',
          outline: 'none',
          animation: 'modal-scale-in 0.2s ease',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1rem', paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 32, height: 32, borderRadius: radii.md,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-input)', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.875rem',
              }}
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
