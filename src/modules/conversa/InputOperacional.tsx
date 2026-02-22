import type React from 'react';
import { useState, useRef, useCallback } from 'react';
import type { Anexo, MensagemProjeto } from '@shared/api/mock-conversa';

interface Props {
  onEnviar: (texto: string, anexos: Anexo[]) => void;
  onUploadFoto: (nome: string) => Promise<Anexo>;
  isPending: boolean;
  /** Mensagem sendo respondida */
  replyTo?: MensagemProjeto | null;
  onCancelReply?: () => void;
}

/**
 * InputOperacional — câmera com conversa ao redor.
 *
 * Princípios:
 *   - 📷 é o botão principal (80% do uso = foto)
 *   - Texto é legenda, não obrigatório
 *   - Foto sem texto = permitido e incentivado
 *   - Máximo 2 toques para enviar foto
 *   - Capture="environment" = câmera traseira direto
 *   - Accept="image/*" = galeria como fallback
 */
export function InputOperacional({
  onEnviar,
  onUploadFoto,
  isPending,
  replyTo,
  onCancelReply,
}: Props) {
  const [texto, setTexto] = useState('');
  const [fotoPreview, setFotoPreview] = useState<Anexo | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputCameraRef = useRef<HTMLInputElement>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement>(null);
  const fileInputDocsRef = useRef<HTMLInputElement>(null);

  const handleFotoSelecionada = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const anexo = await onUploadFoto(file.name);
      setFotoPreview(anexo);
      // Focar no texto para legenda opcional
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {
      // silently fail — production would show toast
    } finally {
      setUploading(false);
    }
  }, [onUploadFoto]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFotoSelecionada(file);
    e.target.value = ''; // reset para permitir mesmo arquivo
  }, [handleFotoSelecionada]);

  const handleEnviar = useCallback(() => {
    const trimmed = texto.trim();
    if (!trimmed && !fotoPreview) return;

    onEnviar(trimmed, fotoPreview ? [fotoPreview] : []);
    setTexto('');
    setFotoPreview(null);
    onCancelReply?.();
    inputRef.current?.focus();
  }, [texto, fotoPreview, onEnviar, onCancelReply]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  }, [handleEnviar]);

  const handleRemoveFoto = useCallback(() => {
    setFotoPreview(null);
    inputRef.current?.focus();
  }, []);

  const hasContent = texto.trim().length > 0 || fotoPreview;

  return (
    <div style={wrapperStyle}>
      {/* Reply preview bar */}
      {replyTo && (
        <div style={replyBarStyle}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--vale-cyan)' }}>
              Respondendo a {replyTo.autorNome}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {replyTo.texto?.slice(0, 60) ?? '📷 Foto'}
            </div>
          </div>
          <button
            onClick={onCancelReply}
            style={replyCloseBtn}
            aria-label="Cancelar resposta"
          >
            ✕
          </button>
        </div>
      )}

      {/* Foto preview */}
      {fotoPreview && (
        <div style={fotoPreviewBar}>
          <div style={fotoPreviewThumb}>
            <span style={{ fontSize: '1.25rem' }}>📷</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{fotoPreview.nome}</span>
          </div>
          <button onClick={handleRemoveFoto} style={fotoRemoveBtn} aria-label="Remover foto">
            ✕
          </button>
        </div>
      )}

      {/* Uploading indicator */}
      {uploading && (
        <div style={uploadingBar}>
          <div style={uploadingDot} />
          <span>Processando foto...</span>
        </div>
      )}

      {/* Main input row */}
      <div style={inputRow}>
        {/* 📷 Botão câmera — protagonista */}
        <button
          onClick={() => fileInputCameraRef.current?.click()}
          style={cameraBtnStyle}
          disabled={uploading}
          aria-label="Tirar foto"
          title="Tirar foto"
        >
          <span style={{ fontSize: '1.375rem', lineHeight: 1 }}>📷</span>
        </button>

        {/* Hidden file inputs */}
        <input
          ref={fileInputCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input
          ref={fileInputGalleryRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input
          ref={fileInputDocsRef}
          type="file"
          accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Clip — galeria/arquivos (secundário) */}
        <button
          onClick={() => fileInputGalleryRef.current?.click()}
          style={clipBtnStyle}
          disabled={uploading}
          aria-label="Galeria"
          title="Galeria de fotos"
        >
          🖼
        </button>

        {/* Texto */}
        <div style={textWrapperStyle}>
          <textarea
            ref={inputRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={fotoPreview ? 'Legenda (opcional)...' : 'Mensagem curta...'}
            rows={1}
            style={textAreaStyle}
            disabled={isPending}
          />
        </div>

        {/* Enviar */}
        <button
          onClick={handleEnviar}
          disabled={!hasContent || isPending || uploading}
          style={{
            ...sendBtnStyle,
            opacity: hasContent ? 1 : 0.3,
            background: hasContent ? 'var(--vale-teal)' : 'var(--bg-input)',
          }}
          aria-label="Enviar"
        >
          <span style={{ fontSize: '1.125rem', lineHeight: 1 }}>➤</span>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const wrapperStyle: React.CSSProperties = {
  borderTop: '1px solid var(--border-subtle)',
  background: 'var(--bg-surface)',
};

const replyBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.875rem',
  background: 'var(--bg-elevated)',
  borderLeft: '3px solid var(--vale-teal)',
  margin: '0.5rem 0.75rem 0',
  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
};

const replyCloseBtn: React.CSSProperties = {
  width: 24, height: 24,
  borderRadius: '50%',
  border: 'none',
  background: 'var(--bg-input)',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const fotoPreviewBar: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.875rem',
  margin: '0.5rem 0.75rem 0',
  background: 'var(--glow-green)',
  border: '1px solid rgba(105,190,40,0.2)',
  borderRadius: 'var(--radius-sm)',
};

const fotoPreviewThumb: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flex: 1,
  color: 'var(--vale-green)',
};

const fotoRemoveBtn: React.CSSProperties = {
  ...replyCloseBtn,
};

const uploadingBar: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.375rem 0.875rem',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
};

const uploadingDot: React.CSSProperties = {
  width: 8, height: 8,
  borderRadius: '50%',
  background: 'var(--vale-cyan)',
  animation: 'pulse-step 1s ease-in-out infinite',
};

const inputRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '0.375rem',
  padding: '0.625rem 0.75rem',
};

const cameraBtnStyle: React.CSSProperties = {
  width: 48, height: 48,
  borderRadius: 'var(--radius-md)',
  border: '2px solid var(--vale-teal)',
  background: 'var(--glow-teal)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all var(--duration-fast)',
};

const clipBtnStyle: React.CSSProperties = {
  width: 36, height: 36,
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-default)',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: '1rem',
  transition: 'all var(--duration-fast)',
};

const textWrapperStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const textAreaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 40,
  maxHeight: 100,
  padding: '0.5rem 0.75rem',
  background: 'var(--bg-input)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  lineHeight: 1.4,
  resize: 'none',
  outline: 'none',
  transition: 'border-color var(--duration-fast)',
  overflow: 'hidden',
};

const sendBtnStyle: React.CSSProperties = {
  width: 44, height: 44,
  borderRadius: '50%',
  border: 'none',
  color: 'var(--text-on-brand)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all var(--duration-normal) var(--ease-out)',
  boxShadow: 'var(--shadow-sm)',
};
