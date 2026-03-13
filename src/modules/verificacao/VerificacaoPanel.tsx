/**
 * VERIFICAÇÃO PANEL — Comparação antes/depois com dados.
 *
 * Checklist:
 *   [x] Registrar resultado (9)
 *   [x] Comparar antes/depois (9)
 *   [x] Evidência final (9)
 *   [x] Confirmar eliminação (9)
 *
 * Renderiza card com indicador, valores, barra de progresso, e botão de confirmação.
 */

import { useState } from 'react';
import {
  registrarResultado,
  getResultados,
  compararAntesDepois,
  confirmarEliminacao,
  type Resultado,
} from '@modules/verificacao';

interface VerificacaoPanelProps {
  projectId: string;
  userId: string;
}

export function VerificacaoPanel({ projectId, userId }: VerificacaoPanelProps) {
  const [resultados, setResultados] = useState<Resultado[]>(getResultados(projectId));
  const [showForm, setShowForm] = useState(false);
  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  // Form state
  const [indicador, setIndicador] = useState('');
  const [unidade, setUnidade] = useState('');
  const [antes, setAntes] = useState('');
  const [depois, setDepois] = useState('');
  const [meta, setMeta] = useState('');

  const handleSubmit = () => {
    if (!indicador || !antes || !depois) return;

    registrarResultado({
      projectId,
      indicador,
      unidade,
      valorAntes: parseFloat(antes),
      valorDepois: parseFloat(depois),
      meta: meta ? parseFloat(meta) : undefined,
      userId,
    });

    setResultados(getResultados(projectId));
    setShowForm(false);
    setIndicador('');
    setUnidade('');
    setAntes('');
    setDepois('');
    setMeta('');
  };

  const handleConfirmar = () => {
    const result = confirmarEliminacao({
      projectId,
      confirmadoPor: userId,
      observacao: confirmacao || '',
    });
    setConfirmacao(null);
    alert(
      result.aprovado
        ? '✅ Problema eliminado — pronto para padronizar!'
        : '⚠️ Meta não atingida em todos indicadores. Revise as ações.'
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>📊 Verificação de Resultados</h3>
        <button onClick={() => setShowForm(!showForm)} style={addBtnStyle}>
          {showForm ? '✕' : '+ Resultado'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={formStyle}>
          <div style={rowStyle}>
            <input
              value={indicador}
              onChange={e => setIndicador(e.target.value)}
              placeholder="Indicador (ex: Tempo de parada)"
              style={inputStyle}
            />
            <input
              value={unidade}
              onChange={e => setUnidade(e.target.value)}
              placeholder="Unidade (min, %, R$)"
              style={{ ...inputStyle, maxWidth: '100px' }}
            />
          </div>
          <div style={rowStyle}>
            <input
              value={antes}
              onChange={e => setAntes(e.target.value)}
              placeholder="Antes"
              type="number"
              style={inputStyle}
            />
            <span style={{ fontSize: '18px', color: '#999' }}>→</span>
            <input
              value={depois}
              onChange={e => setDepois(e.target.value)}
              placeholder="Depois"
              type="number"
              style={inputStyle}
            />
            <input
              value={meta}
              onChange={e => setMeta(e.target.value)}
              placeholder="Meta"
              type="number"
              style={{ ...inputStyle, maxWidth: '80px' }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!indicador || !antes || !depois}
            style={saveBtnStyle}
          >
            Salvar resultado
          </button>
        </div>
      )}

      {/* Results */}
      {resultados.length === 0 && !showForm && (
        <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '20px' }}>
          Nenhum resultado registrado ainda.
        </p>
      )}

      {resultados.map(r => {
        const comp = compararAntesDepois(r);
        const isPositive = comp.variacao < 0; // redução = bom
        const barWidth = Math.min(Math.abs(comp.variacao), 100);

        return (
          <div key={r.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '14px' }}>{comp.indicador}</strong>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isPositive ? 'var(--accent-green)' : '#e53935',
                }}
              >
                {comp.variacao > 0 ? '+' : ''}
                {comp.variacao}%
              </span>
            </div>

            <div style={valuesRowStyle}>
              <div style={valueBoxStyle}>
                <span style={{ fontSize: '11px', color: '#999' }}>ANTES</span>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>{comp.antes}</span>
                <span style={{ fontSize: '11px', color: '#999' }}>{r.unidade}</span>
              </div>
              <span style={{ fontSize: '20px', color: '#ccc' }}>→</span>
              <div style={valueBoxStyle}>
                <span style={{ fontSize: '11px', color: '#999' }}>DEPOIS</span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: isPositive ? 'var(--accent-green)' : '#e53935',
                  }}
                >
                  {comp.depois}
                </span>
                <span style={{ fontSize: '11px', color: '#999' }}>{r.unidade}</span>
              </div>
              {comp.meta != null && (
                <div style={valueBoxStyle}>
                  <span style={{ fontSize: '11px', color: '#999' }}>META</span>
                  <span
                    style={{ fontSize: '18px', fontWeight: 700, color: 'var(--btn-primary-bg)' }}
                  >
                    {comp.meta}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: comp.atingiuMeta ? 'var(--accent-green)' : '#e53935',
                    }}
                  >
                    {comp.atingiuMeta ? '✅ Atingida' : '❌ Não atingida'}
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div style={barBgStyle}>
              <div
                style={{
                  ...barFillStyle,
                  width: `${barWidth}%`,
                  background: isPositive ? 'var(--accent-green)' : '#e53935',
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Confirmar eliminação */}
      {resultados.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          {confirmacao === null ? (
            <button onClick={() => setConfirmacao('')} style={confirmBtnStyle}>
              ✅ Confirmar eliminação do problema
            </button>
          ) : (
            <div style={formStyle}>
              <textarea
                value={confirmacao}
                onChange={e => setConfirmacao(e.target.value)}
                placeholder="Observação sobre a eliminação..."
                rows={2}
                style={{ ...inputStyle, resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setConfirmacao(null)}
                  style={{ ...saveBtnStyle, background: '#999' }}
                >
                  Cancelar
                </button>
                <button onClick={handleConfirmar} style={saveBtnStyle}>
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Styles ──

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const addBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  border: '1px solid var(--btn-primary-bg)',
  borderRadius: '8px',
  background: 'transparent',
  color: 'var(--btn-primary-bg)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px',
  border: '1px solid var(--border-color, #e0e0e0)',
  borderRadius: '10px',
  background: 'var(--surface-1, #f8f8f8)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 10px',
  border: '1px solid var(--border-color, #ddd)',
  borderRadius: '6px',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
};

const saveBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  border: 'none',
  borderRadius: '8px',
  background: 'var(--btn-primary-bg)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const cardStyle: React.CSSProperties = {
  padding: '14px',
  border: '1px solid var(--border-color, #e0e0e0)',
  borderRadius: '10px',
  background: 'var(--surface-0, #fff)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const valuesRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
};

const valueBoxStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
};

const barBgStyle: React.CSSProperties = {
  width: '100%',
  height: '6px',
  background: 'var(--surface-2, #e0e0e0)',
  borderRadius: '3px',
  overflow: 'hidden',
};

const barFillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: '3px',
  transition: 'width 0.5s ease',
};

const confirmBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  border: '2px solid var(--accent-green)',
  borderRadius: '10px',
  background: 'transparent',
  color: 'var(--accent-green)',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};
