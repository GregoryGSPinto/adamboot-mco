/**
 * GERAR APRESENTAÇÃO VIEW — Preview + export dos slides A3.
 *
 * Monta slides automaticamente a partir dos dados do projeto.
 * Usuário NÃO edita slides manualmente.
 *
 * Layout: cards de slides em sequência vertical.
 * Botão "Gerar Apresentação" no topo.
 *
 * Visual: simulação de slides no estilo Vale 2026 CCQ template.
 */

import { useState, useMemo } from 'react';
import type React from 'react';
import { useProjectContext } from '@modules/projeto';
import {
  gerarSlides,
  extrairDadosApresentacao,
  gerarTextoApresentacao,
  type SlideData,
  type SlideConteudo,
} from '@modules/apresentacao/gerarApresentacao';

export function GerarApresentacaoView() {
  const { status } = useProjectContext();
  const [slides, setSlides] = useState<SlideData[] | null>(null);
  const [exportado, setExportado] = useState(false);

  const dados = useMemo(() => extrairDadosApresentacao(status), [status]);

  const handleGerar = () => {
    const s = gerarSlides(dados);
    setSlides(s);
    setExportado(false);
  };

  const handleExportTXT = () => {
    if (!slides) return;
    const texto = gerarTextoApresentacao(slides);
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Apresentacao-${status.projeto.titulo.slice(0, 30)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportado(true);
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h3 style={titleStyle}>📽️ Gerar Apresentação</h3>
          <p style={subtitleStyle}>Monta automaticamente os slides seguindo a metodologia A3.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleGerar} style={btnPrimaryStyle}>
            {slides ? '🔄 Regerar' : '▶ Gerar slides'}
          </button>
          {slides && (
            <button onClick={handleExportTXT} style={btnSecondaryStyle}>
              📄 Exportar TXT
            </button>
          )}
        </div>
      </div>

      {exportado && <div style={successBanner}>✅ Apresentação exportada com sucesso.</div>}

      {/* Slide info */}
      {!slides && (
        <div style={emptyStateStyle}>
          <span style={{ fontSize: '48px', opacity: 0.3 }}>📽</span>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Clique em <strong>"Gerar slides"</strong> para montar a apresentação automaticamente.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Os dados vêm direto do seu projeto A3. Nada para editar manualmente.
          </p>
        </div>
      )}

      {/* Slides preview */}
      {slides && (
        <div style={slidesGridStyle}>
          {slides.map(slide => (
            <SlideCard key={slide.numero} slide={slide} />
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════
// SLIDE CARD — Preview de um slide
// ════════════════════════════════════

function SlideCard({ slide }: { slide: SlideData }) {
  const isCapa = slide.layout === 'capa';
  const isConclusao = slide.layout === 'conclusao';
  const isDark = isCapa || isConclusao;

  return (
    <div
      style={{
        ...slideCardStyle,
        background: isDark ? 'var(--bg-secondary)' : 'var(--surface-0, #fff)',
      }}
    >
      {/* Slide number badge */}
      <div style={slideNumberStyle}>{slide.numero}</div>

      {/* Title */}
      <h4
        style={{
          ...slideTitleStyle,
          color: isDark ? '#fff' : 'var(--text-primary)',
          fontSize: isCapa ? '18px' : '14px',
        }}
      >
        {slide.titulo}
      </h4>

      {slide.subtitulo && (
        <p
          style={{
            ...slideSubtitleStyle,
            color: isDark ? 'var(--accent-green)' : 'var(--btn-primary-bg)',
          }}
        >
          {slide.subtitulo}
        </p>
      )}

      {/* Content */}
      <div style={slideContentStyle}>
        {slide.conteudo.map((c, i) => (
          <SlideConteudoItem key={i} item={c} isDark={isDark} />
        ))}
      </div>

      {/* Notes */}
      {slide.notas && <div style={slideNotesStyle}>📌 {slide.notas}</div>}
    </div>
  );
}

function SlideConteudoItem({ item, isDark }: { item: SlideConteudo; isDark: boolean }) {
  const textColor = isDark ? 'rgba(255,255,255,0.85)' : 'var(--text-primary)';
  const mutedColor = isDark ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)';

  switch (item.tipo) {
    case 'texto':
      return (
        <p
          style={{
            fontSize: item.destaque ? '14px' : '12px',
            fontWeight: item.destaque ? 700 : 400,
            color: item.destaque ? (isDark ? '#fff' : 'var(--btn-primary-bg)') : textColor,
            margin: '4px 0',
            lineHeight: 1.4,
          }}
        >
          {item.destaque && '▸ '}
          {item.valor}
        </p>
      );

    case 'indicador':
      return (
        <div style={indicadorStyle}>
          <span
            style={{
              fontSize: '10px',
              color: mutedColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {item.label}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
            {item.valor}
            {item.unidade && (
              <span style={{ fontSize: '11px', color: mutedColor }}> {item.unidade}</span>
            )}
          </span>
        </div>
      );

    case 'lista':
      return (
        <div style={{ paddingLeft: '8px' }}>
          {item.itens.map((it, i) => (
            <p key={i} style={{ fontSize: '12px', color: textColor, margin: '2px 0' }}>
              • {it}
            </p>
          ))}
        </div>
      );

    case 'comparacao':
      return (
        <div style={comparacaoStyle}>
          <span style={{ fontSize: '11px', color: mutedColor }}>{item.label}:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#e53935' }}>
              {item.antes}
            </span>
            <span style={{ fontSize: '14px', color: mutedColor }}>→</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)' }}>
              {item.depois}
            </span>
          </div>
        </div>
      );

    case 'tabela':
      return (
        <div style={{ overflowX: 'auto', marginTop: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr>
                {item.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{ ...thStyle, color: isDark ? '#fff' : 'var(--text-primary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ ...tdStyle, color: textColor }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'placeholder_foto':
      return <div style={placeholderFotoStyle}>📷 {item.legenda}</div>;

    default:
      return null;
  }
}

// ════════════════════════════════════
// STYLES
// ════════════════════════════════════

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '12px',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: '13px',
  color: 'var(--text-muted)',
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: '10px 18px',
  border: 'none',
  borderRadius: '8px',
  background: 'var(--btn-primary-bg)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const btnSecondaryStyle: React.CSSProperties = {
  padding: '10px 16px',
  border: '1px solid var(--border-color, #ddd)',
  borderRadius: '8px',
  background: 'transparent',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const successBanner: React.CSSProperties = {
  padding: '10px 14px',
  background: 'rgba(105, 190, 40, 0.08)',
  border: '1px solid rgba(105, 190, 40, 0.2)',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--accent-green)',
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px 24px',
  background: 'var(--surface-1, #f8f8f8)',
  borderRadius: '12px',
  border: '2px dashed var(--border-color, #e0e0e0)',
};

const slidesGridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const slideCardStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '16px',
  position: 'relative',
  minHeight: '120px',
};

const slideNumberStyle: React.CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '10px',
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono, monospace)',
  background: 'rgba(128,128,128,0.1)',
  padding: '2px 6px',
  borderRadius: '4px',
};

const slideTitleStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontWeight: 700,
  lineHeight: 1.3,
};

const slideSubtitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.02em',
};

const slideContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const slideNotesStyle: React.CSSProperties = {
  marginTop: '8px',
  paddingTop: '8px',
  borderTop: '1px dashed rgba(128,128,128,0.2)',
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
};

const indicadorStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  padding: '6px 10px',
  background: 'rgba(128,128,128,0.06)',
  borderRadius: '6px',
};

const comparacaoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  padding: '6px 10px',
  background: 'rgba(128,128,128,0.06)',
  borderRadius: '6px',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '4px 6px',
  borderBottom: '1px solid rgba(128,128,128,0.2)',
  fontWeight: 700,
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tdStyle: React.CSSProperties = {
  padding: '3px 6px',
  borderBottom: '1px solid rgba(128,128,128,0.1)',
  fontSize: '11px',
};

const placeholderFotoStyle: React.CSSProperties = {
  padding: '16px',
  border: '2px dashed rgba(128,128,128,0.2)',
  borderRadius: '8px',
  textAlign: 'center',
  fontSize: '12px',
  color: 'var(--text-muted)',
  background: 'rgba(128,128,128,0.03)',
};
