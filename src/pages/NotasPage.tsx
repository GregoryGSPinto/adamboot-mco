import type React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 📝 NOTAS OPERACIONAIS — editor tipo Notion.
 *
 * Persistência: localStorage (mco-notas-db).
 * Formatação: contentEditable com execCommand.
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
  } catch { /* seed */ }
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

  const activeNota = notas.find((n) => n.id === activeId) ?? null;

  // Auto-save on content change (debounce 500ms)
  const handleInput = useCallback(() => {
    if (!activeNota || !editorRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const updated = notas.map((n) =>
        n.id === activeId
          ? { ...n, conteudo: editorRef.current?.innerHTML ?? '', atualizadaEm: new Date().toISOString() }
          : n,
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

  const excluirNota = useCallback((id: string) => {
    if (!confirm('Excluir esta nota?')) return;
    const updated = notas.filter((n) => n.id !== id);
    setNotas(updated);
    saveNotas(updated);
    if (activeId === id) setActiveId(null);
  }, [notas, activeId]);

  const renomearNota = useCallback((id: string, titulo: string) => {
    const updated = notas.map((n) => n.id === id ? { ...n, titulo, atualizadaEm: new Date().toISOString() } : n);
    setNotas(updated);
    saveNotas(updated);
  }, [notas]);

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
        body { font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; line-height: 1.6; font-size: 14px; }
        h1, h2, h3 { margin: 1em 0 0.5em; } img { max-width: 100%; height: auto; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <h1>${activeNota.titulo}</h1>${html}
    </body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  }, [activeNota]);

  const inserirImagem = useCallback(() => {
    const url = prompt('URL da imagem:');
    if (url) exec('insertImage', url);
  }, []);

  return (
    <div className="fade-in" style={container}>
      {/* ═══ SIDEBAR ═══ */}
      <div className="notas-sidebar" style={{ ...sidebar, display: sideOpen || !activeId ? 'flex' : undefined }}>
        <div style={sideHeader}>
          <h2 style={sideTitle}>Notas</h2>
          <button onClick={criarNota} style={newBtn}>+ Nova</button>
        </div>

        {notas.length === 0 ? (
          <p style={emptyText}>Nenhuma nota. Crie a primeira.</p>
        ) : (
          <div style={noteList}>
            {notas.map((n) => (
              <div
                key={n.id}
                onClick={() => { setActiveId(n.id); setSideOpen(false); }}
                style={{
                  ...noteItem,
                  background: activeId === n.id ? 'var(--glow-teal)' : 'transparent',
                  borderColor: activeId === n.id ? 'var(--vale-teal)' : 'var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.titulo}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); excluirNota(n.id); }} style={delNoteBtn}>✕</button>
                </div>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                  {new Date(n.atualizadaEm).toLocaleDateString('pt-BR')} {new Date(n.atualizadaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ EDITOR ═══ */}
      {activeNota ? (
        <div style={editorArea}>
          {/* Title */}
          <div style={editorHeader}>
            <button onClick={() => setSideOpen(true)} style={backBtn} className="notas-back-mobile">← Notas</button>
            <input
              value={activeNota.titulo}
              onChange={(e) => renomearNota(activeNota.id, e.target.value)}
              style={titleInput}
              className="login-input"
            />
            <button onClick={exportarPDF} style={pdfBtn} title="Exportar PDF">📄 PDF</button>
          </div>

          {/* Toolbar */}
          <div style={toolbar}>
            <button onClick={() => exec('bold')} style={tbBtn} title="Negrito"><b>B</b></button>
            <button onClick={() => exec('italic')} style={tbBtn} title="Itálico"><i>I</i></button>
            <button onClick={() => exec('underline')} style={tbBtn} title="Sublinhado"><u>U</u></button>
            <span style={tbSep} />
            <button onClick={() => exec('formatBlock', 'h2')} style={tbBtn} title="Título">H2</button>
            <button onClick={() => exec('formatBlock', 'h3')} style={tbBtn} title="Subtítulo">H3</button>
            <button onClick={() => exec('formatBlock', 'p')} style={tbBtn} title="Parágrafo">¶</button>
            <span style={tbSep} />
            <button onClick={() => exec('insertUnorderedList')} style={tbBtn} title="Lista">• —</button>
            <button onClick={() => exec('insertOrderedList')} style={tbBtn} title="Lista numerada">1.</button>
            <span style={tbSep} />
            <button onClick={inserirImagem} style={tbBtn} title="Inserir imagem">🖼</button>
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
            Salvo automaticamente · {new Date(activeNota.atualizadaEm).toLocaleTimeString('pt-BR')}
          </div>
        </div>
      ) : (
        <div style={emptyEditor}>
          <span style={{ fontSize: '3rem', opacity: 0.2 }}>📝</span>
          <p style={{ color: 'var(--text-muted)' }}>Selecione ou crie uma nota</p>
        </div>
      )}

      <style>{responsiveCSS}</style>
    </div>
  );
}

const responsiveCSS = `
  .notas-editor { outline: none; min-height: 300px; line-height: 1.7; }
  .notas-editor h2 { font-size: 1.25rem; font-weight: 700; margin: 1em 0 0.5em; }
  .notas-editor h3 { font-size: 1rem; font-weight: 600; margin: 0.75em 0 0.375em; }
  .notas-editor p { margin: 0 0 0.5em; }
  .notas-editor ul, .notas-editor ol { padding-left: 1.5rem; margin: 0.5em 0; }
  .notas-editor img { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }
  .notas-back-mobile { display: none; }
  @media (max-width: 768px) {
    .notas-sidebar { position: absolute; inset: 0; z-index: 10; background: var(--bg-surface); }
    .notas-back-mobile { display: block !important; }
  }
`;

// ══ STYLES ══
const container: React.CSSProperties = { display: 'flex', gap: '1rem', minHeight: 'calc(100vh - 180px)', position: 'relative' };
const sidebar: React.CSSProperties = { width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', paddingRight: '1rem' };
const sideHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' };
const sideTitle: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, margin: 0 };
const newBtn: React.CSSProperties = { padding: '0.3rem 0.75rem', fontSize: '0.6875rem', fontWeight: 700, border: '1px solid var(--vale-teal)', color: 'var(--vale-teal-light)', background: 'var(--glow-teal)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)' };
const emptyText: React.CSSProperties = { fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' };
const noteList: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', flex: 1 };
const noteItem: React.CSSProperties = { padding: '0.5rem 0.625rem', border: '1px solid', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' };
const delNoteBtn: React.CSSProperties = { width: 20, height: 20, borderRadius: 4, border: '1px solid var(--sev-critica)', background: 'transparent', color: 'var(--sev-critica)', cursor: 'pointer', fontSize: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const editorArea: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 };
const editorHeader: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' };
const backBtn: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'var(--font-body)', flexShrink: 0 };
const titleInput: React.CSSProperties = { flex: 1, padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none' };
const pdfBtn: React.CSSProperties = { padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--vale-gold)', color: 'var(--vale-gold)', background: 'var(--glow-gold)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0 };
const toolbar: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, marginBottom: '0.5rem', flexWrap: 'wrap' };
const tbBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-body)' };
const tbSep: React.CSSProperties = { width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 0.25rem' };
const editorContent: React.CSSProperties = { flex: 1, padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: '0.9375rem', color: 'var(--text-primary)', overflowY: 'auto' };
const editorFooter: React.CSSProperties = { fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' };
const emptyEditor: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
