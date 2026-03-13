import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  loadApresentacao,
  saveApresentacao,
  resetApresentacao,
} from '@shared/api/mock-apresentacao';
import type { ApresentacaoData } from '@shared/api/mock-apresentacao';

/**
 * APRESENTACAO CCQ — painel institucional editavel.
 *
 * Modo visualizacao: layout institucional (somente leitura)
 * Modo edicao: formularios inline para alterar tudo
 * Persistencia: localStorage
 */
export function ApresentacaoProjetoPage() {
  const [data, setData] = useState<ApresentacaoData>(loadApresentacao);
  const [editMode, setEditMode] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);

  // Scroll reveal
  useEffect(() => {
    if (!revealRef.current) return;
    const obs = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('ap-visible');
        }),
      { threshold: 0.1, rootMargin: '-40px' }
    );
    revealRef.current.querySelectorAll('.ap-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [data]);

  const update = useCallback(
    (patch: Partial<ApresentacaoData>) => {
      const next = { ...data, ...patch };
      setData(next);
      saveApresentacao(next);
    },
    [data]
  );

  const handleReset = () => {
    if (confirm('Restaurar apresentacao ao estado original?')) {
      const seed = resetApresentacao();
      setData(seed);
    }
  };

  // Editable field helper
  const E = ({
    value,
    onChange,
    style,
    multiline,
  }: {
    value: string;
    onChange: (v: string) => void;
    style?: React.CSSProperties;
    multiline?: boolean;
  }) =>
    editMode ? (
      multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...editInput, ...style, minHeight: 60, resize: 'vertical' }}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...editInput, ...style }}
        />
      )
    ) : null;

  // In view mode, just show text. In edit mode, show text + input below.
  const T = ({
    value,
    onChange,
    style,
    tag,
    multiline,
  }: {
    value: string;
    onChange: (v: string) => void;
    style?: React.CSSProperties;
    tag?: 'h1' | 'h2' | 'p' | 'span';
    multiline?: boolean;
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
    <div
      ref={revealRef}
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <style>{apCSS}</style>

      {/* EDIT TOGGLE */}
      <div style={editBar}>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            ...editToggleBtn,
            background: editMode ? 'var(--accent-yellow)' : 'var(--btn-primary-bg)',
            color: '#fff',
          }}
        >
          {editMode ? 'Modo visualizacao' : 'Modo edicao'}
        </button>
        {editMode && (
          <button onClick={handleReset} style={resetBtn}>
            Restaurar original
          </button>
        )}
      </div>

      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '48px 24px 40px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* HERO */}
        <section className="ap-reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 16px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            <T value={data.subtitulo} onChange={v => update({ subtitulo: v })} />
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1,
              margin: 0,
              color: 'var(--text-primary)',
            }}
          >
            <T value={data.titulo} onChange={v => update({ titulo: v })} tag="span" />
          </h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 32,
              flexWrap: 'wrap',
              marginTop: 24,
            }}
          >
            {[
              { l: 'Area', v: 'area' as const },
              { l: 'Consultora', v: 'consultora' as const },
              { l: 'Apoio', v: 'apoio' as const },
              { l: 'Evento', v: 'evento' as const },
            ].map(({ l, v }) => (
              <div key={v} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {l}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                  <T value={data[v]} onChange={val => update({ [v]: val })} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROBLEMA */}
        <section className="ap-reveal" style={{ marginBottom: 48 }}>
          <h2 style={secTitle}>O Problema</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {data.problemas.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--accent-red)',
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                  }}
                >
                  {editMode ? (
                    <input
                      value={p.titulo}
                      onChange={e => {
                        const ps = [...data.problemas];
                        ps[i] = { ...ps[i], titulo: e.target.value };
                        update({ problemas: ps });
                      }}
                      style={editInput}
                    />
                  ) : (
                    p.titulo
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {editMode ? (
                    <input
                      value={p.desc}
                      onChange={e => {
                        const ps = [...data.problemas];
                        ps[i] = { ...ps[i], desc: e.target.value };
                        update({ problemas: ps });
                      }}
                      style={editInput}
                    />
                  ) : (
                    p.desc
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Impact stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 40,
              flexWrap: 'wrap',
              padding: 20,
              background: 'var(--bg-secondary)',
              borderRadius: 6,
              border: '1px solid var(--border)',
            }}
          >
            {data.impacto.map((imp, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--accent-red)',
                    lineHeight: 1,
                  }}
                >
                  {editMode ? (
                    <input
                      value={imp.valor}
                      onChange={e => {
                        const is = [...data.impacto];
                        is[i] = { ...is[i], valor: e.target.value };
                        update({ impacto: is });
                      }}
                      style={{ ...editInput, fontSize: 20, width: 100, textAlign: 'center' }}
                    />
                  ) : (
                    imp.valor
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {editMode ? (
                    <input
                      value={imp.label}
                      onChange={e => {
                        const is = [...data.impacto];
                        is[i] = { ...is[i], label: e.target.value };
                        update({ impacto: is });
                      }}
                      style={editInput}
                    />
                  ) : (
                    imp.label
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* METODO */}
        <section className="ap-reveal" style={{ marginBottom: 48 }}>
          <h2 style={secTitle}>O Metodo MASP</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {data.fases.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderTop: '2px solid var(--accent-blue)',
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-blue)' }}>
                  {f.n}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: '4px 0',
                  }}
                >
                  {editMode ? (
                    <input
                      value={f.label}
                      onChange={e => {
                        const fs = [...data.fases];
                        fs[i] = { ...fs[i], label: e.target.value };
                        update({ fases: fs });
                      }}
                      style={editInput}
                    />
                  ) : (
                    f.label
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {editMode ? (
                    <input
                      value={f.desc}
                      onChange={e => {
                        const fs = [...data.fases];
                        fs[i] = { ...fs[i], desc: e.target.value };
                        update({ fases: fs });
                      }}
                      style={editInput}
                    />
                  ) : (
                    f.desc
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SISTEMA */}
        <section className="ap-reveal" style={{ marginBottom: 48 }}>
          <h2 style={secTitle}>O Sistema MCO</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 12,
            }}
          >
            {data.solucoes.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderTop: '2px solid var(--accent-green)',
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                  }}
                >
                  {editMode ? (
                    <input
                      value={s.titulo}
                      onChange={e => {
                        const ss = [...data.solucoes];
                        ss[i] = { ...ss[i], titulo: e.target.value };
                        update({ solucoes: ss });
                      }}
                      style={editInput}
                    />
                  ) : (
                    s.titulo
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {editMode ? (
                    <input
                      value={s.desc}
                      onChange={e => {
                        const ss = [...data.solucoes];
                        ss[i] = { ...ss[i], desc: e.target.value };
                        update({ solucoes: ss });
                      }}
                      style={editInput}
                    />
                  ) : (
                    s.desc
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EVIDENCIAS */}
        <section className="ap-reveal" style={{ marginBottom: 48 }}>
          <h2 style={secTitle}>Evidencias</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {data.evidencias.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                }}
              >
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{'\u2713'}</span>
                {editMode ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      value={ev}
                      onChange={e => {
                        const es = [...data.evidencias];
                        es[i] = e.target.value;
                        update({ evidencias: es });
                      }}
                      style={{ ...editInput, width: 140 }}
                    />
                    <button
                      onClick={() => {
                        const es = data.evidencias.filter((_, j) => j !== i);
                        update({ evidencias: es });
                      }}
                      style={miniDel}
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
                ) : (
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{ev}</span>
                )}
              </div>
            ))}
            {editMode && (
              <button
                onClick={() => update({ evidencias: [...data.evidencias, 'Nova evidencia'] })}
                style={addItemBtn}
              >
                + Adicionar
              </button>
            )}
          </div>
        </section>

        {/* RESULTADOS */}
        <section className="ap-reveal" style={{ marginBottom: 48 }}>
          <h2 style={secTitle}>Resultado Esperado</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {data.resultados.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: 20,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, color: r.cor, lineHeight: 1 }}>
                  {editMode ? (
                    <input
                      value={r.valor}
                      onChange={e => {
                        const rs = [...data.resultados];
                        rs[i] = { ...rs[i], valor: e.target.value };
                        update({ resultados: rs });
                      }}
                      style={{ ...editInput, fontSize: 20, width: 100, textAlign: 'center' }}
                    />
                  ) : (
                    r.valor
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  {editMode ? (
                    <input
                      value={r.label}
                      onChange={e => {
                        const rs = [...data.resultados];
                        rs[i] = { ...rs[i], label: e.target.value };
                        update({ resultados: rs });
                      }}
                      style={editInput}
                    />
                  ) : (
                    r.label
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div
            style={{
              padding: '16px 24px',
              borderLeft: '3px solid var(--accent-yellow)',
              background: 'var(--bg-secondary)',
              borderRadius: '0 6px 6px 0',
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              &quot;
              {editMode ? (
                <input
                  value={data.fraseFinal}
                  onChange={e => update({ fraseFinal: e.target.value })}
                  style={{ ...editInput, width: '100%' }}
                />
              ) : (
                data.fraseFinal
              )}
              &quot;
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className="ap-reveal"
          style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid var(--border)' }}
        >
          <div
            style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}
          >
            MCO
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Melhoria Continua Operacional -- CCQ -- Vale S.A.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {editMode ? (
              <input
                value={data.footerEvento}
                onChange={e => update({ footerEvento: e.target.value })}
                style={{ ...editInput, textAlign: 'center' }}
              />
            ) : (
              data.footerEvento
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

// CSS
const apCSS = `
  .ap-reveal { opacity:0; transform:translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .ap-visible { opacity:1; transform:translateY(0); }
`;
const secTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 16,
};
const editBar: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 50,
  display: 'flex',
  gap: 8,
  justifyContent: 'flex-end',
  padding: '12px 24px',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border)',
};
const editToggleBtn: React.CSSProperties = {
  padding: '6px 16px',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};
const resetBtn: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid var(--accent-red)',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--accent-red)',
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
const editInput: React.CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text-primary)',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  marginTop: 4,
};
const miniDel: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  border: '1px solid var(--accent-red)',
  background: 'transparent',
  color: 'var(--accent-red)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const addItemBtn: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px dashed var(--border)',
  borderRadius: 6,
  color: 'var(--text-muted)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 12,
  fontFamily: 'inherit',
};
