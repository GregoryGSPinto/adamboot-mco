import type React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * NOTAS OPERACIONAIS — editor tipo Notion.
 *
 * Persistencia: localStorage (mco-notas-db).
 * Formatacao: contentEditable com execCommand.
 * Exportar: HTML → PDF via window.print().
 */

const STORAGE_KEY = 'mco-notas-db';

interface Nota {
  id: string;
  titulo: string;
  conteudo: string;
  criadaEm: string;
  atualizadaEm: string;
}

function loadNotas(): Nota[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* seed */
  }
  return [];
}
function saveNotas(notas: Nota[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notas));
}

export function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>(loadNotas);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sideOpen, setSideOpen] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const activeNota = notas.find(n => n.id === activeId) ?? null;

  // Auto-save on content change (debounce 500ms)
  const handleInput = useCallback(() => {
    if (!activeNota || !editorRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const updated = notas.map(n =>
        n.id === activeId
          ? {
              ...n,
              conteudo: editorRef.current?.innerHTML ?? '',
              atualizadaEm: new Date().toISOString(),
            }
          : n
      );
      setNotas(updated);
      saveNotas(updated);
    }, 500);
  }, [activeId, activeNota, notas]);

  // Load content into editor when switching notes
  useEffect(() => {
    if (editorRef.current && activeNota) {
      editorRef.current.innerHTML = activeNota.conteudo;
    }
  }, [activeId]);

  const criarNota = useCallback(() => {
    const nova: Nota = {
      id: `nota-${Date.now()}`,
      titulo: 'Nova nota',
      conteudo: '<p>Comece a escrever...</p>',
      criadaEm: new Date().toISOString(),
      atualizadaEm: new Date().toISOString(),
    };
    const updated = [nova, ...notas];
    setNotas(updated);
    saveNotas(updated);
    setActiveId(nova.id);
    setSideOpen(false);
  }, [notas]);

  const excluirNota = useCallback(
    (id: string) => {
      if (!confirm('Excluir esta nota?')) return;
      const updated = notas.filter(n => n.id !== id);
      setNotas(updated);
      saveNotas(updated);
      if (activeId === id) setActiveId(null);
    },
    [notas, activeId]
  );

  const renomearNota = useCallback(
    (id: string, titulo: string) => {
      const updated = notas.map(n =>
        n.id === id ? { ...n, titulo, atualizadaEm: new Date().toISOString() } : n
      );
      setNotas(updated);
      saveNotas(updated);
    },
    [notas]
  );

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const exportarPDF = useCallback(() => {
    if (!activeNota || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${activeNota.titulo}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; line-height: 1.6; font-size: 14px; }
        h1, h2, h3 { margin: 1em 0 0.5em; } img { max-width: 100%; height: auto; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <h1>${activeNota.titulo}</h1>${html}
    </body></html>`);
    win.document.close();
    setTimeout(() => {
      win.print();
    }, 300);
  }, [activeNota]);

  const inserirImagem = useCallback(() => {
    const url = prompt('URL da imagem:');
    if (url) exec('insertImage', url);
  }, []);

  return (
    <div className="fade-in" style={container}>
      {/* SIDEBAR */}
      <div
        className="notas-sidebar"
        style={{ ...sidebar, display: sideOpen || !activeId ? 'flex' : undefined }}
      >
        <div style={sideHeader}>
          <h2 style={sideTitle}>Notas</h2>
          <button onClick={criarNota} style={newBtn}>
            + Nova
          </button>
        </div>

        {notas.length === 0 ? (
          <p style={emptyText}>Nenhuma nota. Crie a primeira.</p>
        ) : (
          <div style={noteList}>
            {notas.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  setActiveId(n.id);
                  setSideOpen(false);
                }}
                style={{
                  ...noteItem,
                  background: activeId === n.id ? 'var(--hover-bg)' : 'transparent',
                  borderColor: activeId === n.id ? 'var(--accent-blue)' : 'var(--border)',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {n.titulo}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      excluirNota(n.id);
                    }}
                    style={delNoteBtn}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1 1l6 6M7 1l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(n.atualizadaEm).toLocaleDateString('pt-BR')}{' '}
                  {new Date(n.atualizadaEm).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDITOR */}
      {activeNota ? (
        <div style={editorArea}>
          {/* Title */}
          <div style={editorHeader}>
            <button onClick={() => setSideOpen(true)} style={backBtn} className="notas-back-mobile">
              Back
            </button>
            <input
              value={activeNota.titulo}
              onChange={e => renomearNota(activeNota.id, e.target.value)}
              style={titleInput}
              className="login-input"
            />
            <button onClick={exportarPDF} style={pdfBtn} title="Exportar PDF">
              PDF
            </button>
          </div>

          {/* Toolbar */}
          <div style={toolbar}>
            <button onClick={() => exec('bold')} style={tbBtn} title="Negrito">
              <b>B</b>
            </button>
            <button onClick={() => exec('italic')} style={tbBtn} title="Italico">
              <i>I</i>
            </button>
            <button onClick={() => exec('underline')} style={tbBtn} title="Sublinhado">
              <u>U</u>
            </button>
            <span style={tbSep} />
            <button onClick={() => exec('formatBlock', 'h2')} style={tbBtn} title="Titulo">
              H2
            </button>
            <button onClick={() => exec('formatBlock', 'h3')} style={tbBtn} title="Subtitulo">
              H3
            </button>
            <button onClick={() => exec('formatBlock', 'p')} style={tbBtn} title="Paragrafo">
              P
            </button>
            <span style={tbSep} />
            <button onClick={() => exec('insertUnorderedList')} style={tbBtn} title="Lista">
              UL
            </button>
            <button onClick={() => exec('insertOrderedList')} style={tbBtn} title="Lista numerada">
              OL
            </button>
            <span style={tbSep} />
            <button onClick={inserirImagem} style={tbBtn} title="Inserir imagem">
              IMG
            </button>
          </div>

          {/* Content */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            style={editorContent}
            className="notas-editor"
          />

          <div style={editorFooter}>
            Salvo automaticamente -- {new Date(activeNota.atualizadaEm).toLocaleTimeString('pt-BR')}
          </div>
        </div>
      ) : (
        <div style={emptyEditor}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Selecione ou crie uma nota</p>
        </div>
      )}

      <style>{responsiveCSS}</style>
    </div>
  );
}

const responsiveCSS = `
  .notas-editor { outline: none; min-height: 300px; line-height: 1.7; }
  .notas-editor h2 { font-size: 20px; font-weight: 700; margin: 1em 0 0.5em; }
  .notas-editor h3 { font-size: 16px; font-weight: 600; margin: 0.75em 0 0.375em; }
  .notas-editor p { margin: 0 0 0.5em; }
  .notas-editor ul, .notas-editor ol { padding-left: 1.5rem; margin: 0.5em 0; }
  .notas-editor img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }
  .notas-back-mobile { display: none; }
  @media (max-width: 768px) {
    .notas-sidebar { position: absolute; inset: 0; z-index: 10; background: var(--bg-primary); }
    .notas-back-mobile { display: block !important; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// STYLES
const container: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  minHeight: 'calc(100vh - 180px)',
  position: 'relative',
};
const sidebar: React.CSSProperties = {
  width: 260,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid var(--border)',
  paddingRight: 16,
};
const sideHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
};
const sideTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  margin: 0,
  color: 'var(--text-primary)',
};
const newBtn: React.CSSProperties = {
  padding: '4px 12px',
  fontSize: 12,
  fontWeight: 600,
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  background: 'var(--bg-secondary)',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: 'inherit',
};
const emptyText: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-muted)',
  fontStyle: 'italic',
};
const noteList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  overflowY: 'auto',
  flex: 1,
};
const noteItem: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid',
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'all 0.15s',
};
const delNoteBtn: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 4,
  border: '1px solid var(--accent-red)',
  background: 'transparent',
  color: 'var(--accent-red)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
const editorArea: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
};
const editorHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
};
const backBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: 'inherit',
  flexShrink: 0,
};
const titleInput: React.CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  outline: 'none',
};
const pdfBtn: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  background: 'var(--bg-secondary)',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};
const toolbar: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: 6,
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  marginBottom: 8,
  flexWrap: 'wrap',
};
const tbBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontFamily: 'inherit',
};
const tbSep: React.CSSProperties = {
  width: 1,
  height: 20,
  background: 'var(--border)',
  margin: '0 4px',
};
const editorContent: React.CSSProperties = {
  flex: 1,
  padding: 16,
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 14,
  color: 'var(--text-primary)',
  overflowY: 'auto',
};
const editorFooter: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-muted)',
  marginTop: 8,
  textAlign: 'right',
};
const emptyEditor: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};
