import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { loadApresentacao, saveApresentacao, resetApresentacao } from '@shared/api/mock-apresentacao';
import type { ApresentacaoData } from '@shared/api/mock-apresentacao';

/**
 * APRESENTAÇÃO CCQ — painel institucional editável.
 *
 * Modo visualização: layout institucional (somente leitura)
 * Modo edição: formulários inline para alterar tudo
 * Persistência: localStorage
 */
export function ApresentacaoProjetoPage() {
  const [data, setData] = useState<ApresentacaoData>(loadApresentacao);
  const [editMode, setEditMode] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);

  // Scroll reveal
  useEffect(() => {
    if (!revealRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('ap-visible'); }),
      { threshold: 0.1, rootMargin: '-40px' },
    );
    revealRef.current.querySelectorAll('.ap-reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [data]);

  const update = useCallback((patch: Partial<ApresentacaoData>) => {
    const next = { ...data, ...patch };
    setData(next);
    saveApresentacao(next);
  }, [data]);

  const handleReset = () => {
    if (confirm('Restaurar apresentação ao estado original?')) {
      const seed = resetApresentacao();
      setData(seed);
    }
  };

  const P = {
    bg: '#0a1a18', card: '#0f2220', border: '#1a3533',
    gold: '#edb111', teal: '#009e99', white: '#ffffff',
    muted: '#5a7a78', text: '#c0dad8',
  };

  // ── Editable field helper ──
  const E = ({ value, onChange, style, multiline }: {
    value: string; onChange: (v: string) => void; style?: React.CSSProperties; multiline?: boolean;
  }) => editMode ? (
    multiline ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} style={{ ...editInput, ...style, minHeight: 60, resize: 'vertical' }} />
    ) : (
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{ ...editInput, ...style }} />
    )
  ) : null;

  // In view mode, just show text. In edit mode, show text + input below.
  const T = ({ value, onChange, style, tag, multiline }: {
    value: string; onChange: (v: string) => void; style?: React.CSSProperties;
    tag?: 'h1' | 'h2' | 'p' | 'span'; multiline?: boolean;
  }) => {
    const Tag = tag ?? 'span';
    return (
      <>
        <Tag style={style}>{value}</Tag>
        {editMode && <E value={value} onChange={onChange} multiline={multiline} />}
      </>
    );
  };

  return (
    <div ref={revealRef} style={{ background: P.bg, color: P.text, minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif", position: 'relative' }}>
      <style>{apCSS}</style>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,158,153,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── EDIT TOGGLE ── */}
      <div style={editBar}>
        <button onClick={() => setEditMode(!editMode)} style={{ ...editToggleBtn, background: editMode ? P.gold : P.teal, color: editMode ? '#000' : '#fff' }}>
          {editMode ? '✓ Modo visualização' : '✏ Modo edição'}
        </button>
        {editMode && <button onClick={handleReset} style={resetBtn}>Restaurar original</button>}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 1.5rem 3rem', position: 'relative', zIndex: 1 }}>

        {/* ═══ ① HERO ═══ */}
        <section className="ap-reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-block', padding: '0.3rem 1.25rem', border: `1px solid ${P.gold}33`, borderRadius: 100, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', color: P.gold, marginBottom: '1.5rem' }}>
            <T value={data.subtitulo} onChange={(v) => update({ subtitulo: v })} />
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, margin: 0, color: P.white }}>
            <T value={data.titulo} onChange={(v) => update({ titulo: v })} tag="span" />
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            {[
              { l: 'Área', v: 'area' as const }, { l: 'Consultora', v: 'consultora' as const },
              { l: 'Apoio', v: 'apoio' as const }, { l: 'Evento', v: 'evento' as const },
            ].map(({ l, v }) => (
              <div key={v} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', color: P.muted, textTransform: 'uppercase' }}>{l}</div>
                <div style={{ fontSize: '0.875rem', color: P.text, marginTop: '0.125rem' }}>
                  <T value={data[v]} onChange={(val) => update({ [v]: val })} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ ② PROBLEMA ═══ */}
        <section className="ap-reveal" style={{ marginBottom: '4rem' }}>
          <h2 style={secTitle}>O Problema</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {data.problemas.map((p, i) => (
              <div key={i} style={{ padding: '1.25rem', background: P.card, border: `1px solid ${P.border}`, borderLeft: '3px solid #ef4444', borderRadius: 8 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: P.white, marginBottom: '0.5rem' }}>
                  {editMode ? <input value={p.titulo} onChange={(e) => { const ps = [...data.problemas]; ps[i] = { ...ps[i], titulo: e.target.value }; update({ problemas: ps }); }} style={editInput} /> : p.titulo}
                </div>
                <div style={{ fontSize: '0.8125rem', color: P.muted }}>
                  {editMode ? <input value={p.desc} onChange={(e) => { const ps = [...data.problemas]; ps[i] = { ...ps[i], desc: e.target.value }; update({ problemas: ps }); }} style={editInput} /> : p.desc}
                </div>
              </div>
            ))}
          </div>
          {/* Impact stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', padding: '1.5rem', background: `${P.card}cc`, borderRadius: 12, border: `1px solid ${P.border}` }}>
            {data.impacto.map((imp, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>
                  {editMode ? <input value={imp.valor} onChange={(e) => { const is = [...data.impacto]; is[i] = { ...is[i], valor: e.target.value }; update({ impacto: is }); }} style={{ ...editInput, fontSize: '1.5rem', width: 100, textAlign: 'center' }} /> : imp.valor}
                </div>
                <div style={{ fontSize: '0.75rem', color: P.muted, marginTop: '0.25rem' }}>
                  {editMode ? <input value={imp.label} onChange={(e) => { const is = [...data.impacto]; is[i] = { ...is[i], label: e.target.value }; update({ impacto: is }); }} style={editInput} /> : imp.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ ③ MÉTODO ═══ */}
        <section className="ap-reveal" style={{ marginBottom: '4rem' }}>
          <h2 style={secTitle}>O Método MASP</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {data.fases.map((f, i) => (
              <div key={i} style={{ padding: '1rem', background: P.card, border: `1px solid ${P.border}`, borderTop: `2px solid ${P.teal}`, borderRadius: 8 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: P.teal, fontFamily: 'var(--font-mono)' }}>{f.n}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: P.white, margin: '0.25rem 0' }}>
                  {editMode ? <input value={f.label} onChange={(e) => { const fs = [...data.fases]; fs[i] = { ...fs[i], label: e.target.value }; update({ fases: fs }); }} style={editInput} /> : f.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: P.muted }}>
                  {editMode ? <input value={f.desc} onChange={(e) => { const fs = [...data.fases]; fs[i] = { ...fs[i], desc: e.target.value }; update({ fases: fs }); }} style={editInput} /> : f.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ ④ SISTEMA ═══ */}
        <section className="ap-reveal" style={{ marginBottom: '4rem' }}>
          <h2 style={secTitle}>O Sistema MCO</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {data.solucoes.map((s, i) => (
              <div key={i} style={{ padding: '1.25rem', background: P.card, border: `1px solid ${P.border}`, borderTop: `2px solid ${P.teal}`, borderRadius: 8 }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: P.white, marginBottom: '0.375rem' }}>
                  {editMode ? <input value={s.titulo} onChange={(e) => { const ss = [...data.solucoes]; ss[i] = { ...ss[i], titulo: e.target.value }; update({ solucoes: ss }); }} style={editInput} /> : s.titulo}
                </div>
                <div style={{ fontSize: '0.8125rem', color: P.muted }}>
                  {editMode ? <input value={s.desc} onChange={(e) => { const ss = [...data.solucoes]; ss[i] = { ...ss[i], desc: e.target.value }; update({ solucoes: ss }); }} style={editInput} /> : s.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ ⑤ EVIDÊNCIAS ═══ */}
        <section className="ap-reveal" style={{ marginBottom: '4rem' }}>
          <h2 style={secTitle}>Evidências</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {data.evidencias.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', background: P.card, border: `1px solid ${P.border}`, borderRadius: 8 }}>
                <span style={{ color: '#69be28', fontWeight: 700 }}>✓</span>
                {editMode ? (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input value={ev} onChange={(e) => { const es = [...data.evidencias]; es[i] = e.target.value; update({ evidencias: es }); }} style={{ ...editInput, width: 140 }} />
                    <button onClick={() => { const es = data.evidencias.filter((_, j) => j !== i); update({ evidencias: es }); }} style={miniDel}>✕</button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: P.text }}>{ev}</span>
                )}
              </div>
            ))}
            {editMode && (
              <button onClick={() => update({ evidencias: [...data.evidencias, 'Nova evidência'] })} style={addItemBtn}>+ Adicionar</button>
            )}
          </div>
        </section>

        {/* ═══ ⑥ RESULTADOS ═══ */}
        <section className="ap-reveal" style={{ marginBottom: '4rem' }}>
          <h2 style={secTitle}>Resultado Esperado</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {data.resultados.map((r, i) => (
              <div key={i} style={{ padding: '1.5rem', background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: r.cor, lineHeight: 1 }}>
                  {editMode ? <input value={r.valor} onChange={(e) => { const rs = [...data.resultados]; rs[i] = { ...rs[i], valor: e.target.value }; update({ resultados: rs }); }} style={{ ...editInput, fontSize: '1.5rem', width: 100, textAlign: 'center' }} /> : r.valor}
                </div>
                <div style={{ fontSize: '0.75rem', color: P.muted, marginTop: '0.375rem' }}>
                  {editMode ? <input value={r.label} onChange={(e) => { const rs = [...data.resultados]; rs[i] = { ...rs[i], label: e.target.value }; update({ resultados: rs }); }} style={editInput} /> : r.label}
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div style={{ padding: '1.5rem 2rem', borderLeft: `3px solid ${P.gold}`, background: `${P.card}cc`, borderRadius: '0 12px 12px 0' }}>
            <p style={{ fontSize: '1.125rem', fontStyle: 'italic', color: P.gold, margin: 0, lineHeight: 1.6 }}>
              "{editMode ? <input value={data.fraseFinal} onChange={(e) => update({ fraseFinal: e.target.value })} style={{ ...editInput, width: '100%' }} /> : data.fraseFinal}"
            </p>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="ap-reveal" style={{ textAlign: 'center', padding: '2rem 0', borderTop: `1px solid ${P.border}` }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 900, color: P.teal, opacity: 0.4, marginBottom: '0.75rem' }}>MCO</div>
          <div style={{ fontSize: '0.6875rem', color: P.muted }}>Melhoria Continua Operacional · CCQ · Vale S.A.</div>
          <div style={{ fontSize: '0.75rem', color: P.gold, marginTop: '0.25rem' }}>
            {editMode ? <input value={data.footerEvento} onChange={(e) => update({ footerEvento: e.target.value })} style={{ ...editInput, textAlign: 'center' }} /> : data.footerEvento}
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── CSS ──
const apCSS = `
  .ap-reveal { opacity:0; transform:translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
  .ap-visible { opacity:1; transform:translateY(0); }
`;
const secTitle: React.CSSProperties = { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5a7a78', marginBottom: '1.5rem' };
const editBar: React.CSSProperties = { position: 'sticky', top: 0, zIndex: 50, display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '0.75rem 1.5rem', background: 'rgba(10,26,24,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a3533' };
const editToggleBtn: React.CSSProperties = { padding: '0.5rem 1rem', border: 'none', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' };
const resetBtn: React.CSSProperties = { padding: '0.5rem 0.75rem', border: '1px solid #ef4444', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)' };
const editInput: React.CSSProperties = { width: '100%', padding: '0.375rem 0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#ffffff', fontSize: '0.8125rem', fontFamily: 'var(--font-body)', outline: 'none', marginTop: '0.25rem' };
const miniDel: React.CSSProperties = { width: 24, height: 24, borderRadius: 4, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const addItemBtn: React.CSSProperties = { padding: '0.5rem 1rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-body)' };
