import { describe, it, expect } from 'vitest';
import { calcularStatusProjeto } from './phase-engine';
import type { ProjetoMelhoria } from './phase-engine';

function makeProjeto(overrides: Partial<ProjetoMelhoria> = {}): ProjetoMelhoria {
  return {
    id: 'proj-1',
    titulo: 'Teste CCQ',
    faseAtual: 1,
    dataInicio: '2026-01-01',
    dataApresentacao: '2026-06-01',
    liderId: 'user-1',
    facilitadorId: 'user-2',
    membros: [
      { id: 'user-1', nome: 'Lider', papel: 'lider' },
      { id: 'user-2', nome: 'Facilitador', papel: 'facilitador' },
      { id: 'user-3', nome: 'Membro A', papel: 'membro' },
    ],
    evidencias: [],
    acoes: [],
    status: 'ativo',
    ...overrides,
  };
}

describe('calcularStatusProjeto', () => {
  it('returns status for empty project', () => {
    const status = calcularStatusProjeto(makeProjeto());
    expect(status.projeto.id).toBe('proj-1');
    expect(status.faseLabel).toBeTruthy();
    expect(status.bloqueio).toBeDefined();
  });

  it('calculates bloqueio with pendentes', () => {
    const status = calcularStatusProjeto(makeProjeto());
    expect(status.bloqueio.pendentes.length).toBeGreaterThan(0);
    expect(status.bloqueio.podeSeguir).toBe(false);
  });

  it('shows risco CRITICO when past deadline', () => {
    const status = calcularStatusProjeto(makeProjeto({ dataApresentacao: '2020-01-01' }));
    expect(status.risco).toBe('CRITICO');
  });

  it('shows diasRestantes negative when past deadline', () => {
    const status = calcularStatusProjeto(makeProjeto({ dataApresentacao: '2020-01-01' }));
    expect(status.diasRestantes).toBeLessThan(0);
  });

  it('calculates diasPorFase', () => {
    const status = calcularStatusProjeto(makeProjeto());
    expect(status.diasPorFase).toBeGreaterThanOrEqual(0);
  });

  it('generates mensagensIA', () => {
    const status = calcularStatusProjeto(makeProjeto());
    expect(status.mensagensIA).toBeDefined();
    expect(Array.isArray(status.mensagensIA)).toBe(true);
  });

  it('generates pendenciasPorPessoa map', () => {
    const status = calcularStatusProjeto(makeProjeto());
    expect(status.pendenciasPorPessoa).toBeInstanceOf(Map);
  });

  it('allows phase advance when all requisitos cumpridos', () => {
    // Phase 1 has requisitos F1_xxx. Cumprindo all obrigatorios should allow advance
    const projeto = makeProjeto();
    const statusBefore = calcularStatusProjeto(projeto);
    const reqIds = statusBefore.bloqueio.pendentes.map(p => p.requisito.id);

    // Add evidencias for all pendentes
    const evidencias = reqIds.map(id => ({
      requisitoId: id,
      preenchidoPor: 'user-1',
      dataRegistro: '2026-03-01',
      aprovado: true,
    }));

    const statusAfter = calcularStatusProjeto(makeProjeto({ evidencias }));
    expect(statusAfter.bloqueio.podeSeguir).toBe(true);
    expect(statusAfter.bloqueio.pendentes.length).toBe(0);
  });

  it('fase label matches current phase', () => {
    const status = calcularStatusProjeto(makeProjeto({ faseAtual: 3 }));
    expect(status.faseLabel).toBeTruthy();
  });

  it('bloqueio percentual is 100 when all done', () => {
    const projeto = makeProjeto();
    const s = calcularStatusProjeto(projeto);
    const evidencias = s.bloqueio.pendentes.map(p => ({
      requisitoId: p.requisito.id,
      preenchidoPor: 'user-1',
      dataRegistro: '2026-03-01',
      aprovado: true,
    }));
    const s2 = calcularStatusProjeto(makeProjeto({ evidencias }));
    expect(s2.bloqueio.percentual).toBe(100);
  });
});
