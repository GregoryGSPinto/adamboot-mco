/**
 * REGISTRO RÁPIDO — Botão flutuante de ação rápida.
 *
 * Checklist:
 *   [x] Botão registrar rápido na tela inicial (17)
 *   [x] Abrir câmera em até 2 segundos (17)
 *   [x] Feedback visual imediato (17)
 *
 * FAB (Floating Action Button) que fica fixo no mobile.
 * 1 toque → abre câmera direto → foto vira evidência.
 */

import { useState, useRef } from 'react';

interface RegistroRapidoProps {
  onPhotoCapture: (file: File) => void;
  disabled?: boolean;
}

export function RegistroRapido({ onPhotoCapture, disabled }: RegistroRapidoProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Feedback imediato
    setFeedback('✅');
    onPhotoCapture(file);

    setTimeout(() => setFeedback(null), 1500);

    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        style={{ display: 'none' }}
      />

      <button
        onClick={handleClick}
        disabled={disabled}
        style={{
          ...fabStyle,
          opacity: disabled ? 0.5 : 1,
          transform: feedback ? 'scale(1.15)' : 'scale(1)',
        }}
        title="Registrar rápido (câmera)"
      >
        {feedback || '📷'}
      </button>
    </>
  );
}

// ── Styles ──

const fabStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '80px', // acima do bottom nav
  right: '16px',
  width: '56px',
  height: '56px',
  borderRadius: '28px',
  border: 'none',
  background: 'var(--vale-teal, #007e7a)',
  color: '#fff',
  fontSize: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0, 126, 122, 0.4)',
  transition: 'all 0.2s ease',
  zIndex: 50,
};
