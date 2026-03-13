import { ReactNode, useEffect, useCallback, useRef } from 'react';
import { radii, fontSizes, fontWeights, zIndex } from '@shared/design/tokens';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 480 }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
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
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.modal,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg-overlay)',
        }}
      />
      {/* Content */}
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          position: 'relative',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: radii.md,
          width: '90vw',
          maxWidth: width,
          maxHeight: '85vh',
          overflow: 'auto',
          padding: 16,
          outline: 'none',
        }}
      >
        {title && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: fontSizes.base,
                fontWeight: fontWeights.semibold,
                color: 'var(--text-primary)',
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.md,
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: fontSizes.sm,
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
