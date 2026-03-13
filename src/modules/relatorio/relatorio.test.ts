import { describe, it, expect } from 'vitest';
import { gerarNumeroProjeto, exportarCSV } from './index';
import type { StatusProjeto } from '@shared/engine';

describe('gerarNumeroProjeto', () => {
  it('formats as CCQ-YYYY-NNN', () => {
    expect(gerarNumeroProjeto('2026-03-15', 1)).toBe('CCQ-2026-001');
    expect(gerarNumeroProjeto('2026-06-15', 42)).toBe('CCQ-2026-042');
    expect(gerarNumeroProjeto('2025-12-15', 100)).toBe('CCQ-2025-100');
  });

  it('pads sequence number to 3 digits', () => {
    expect(gerarNumeroProjeto('2026-06-15', 1)).toBe('CCQ-2026-001');
    expect(gerarNumeroProjeto('2026-06-15', 99)).toBe('CCQ-2026-099');
  });

  it('extracts year from ISO date string', () => {
    expect(gerarNumeroProjeto('2024-06-15T10:00:00Z', 5)).toBe('CCQ-2024-005');
  });
});

describe('exportarCSV', () => {
  const mockStatus = {
    projeto: {
      id: 'proj-1',
      titulo: 'Teste',
      evidencias: [
        {
          requisitoId: 'F1_ANALISE',
          preenchidoPor: 'user-1',
          dataRegistro: '2026-03-01',
        },
        {
          requisitoId: 'F2_CAUSA',
          preenchidoPor: 'user-2',
          dataRegistro: '2026-03-02',
        },
      ],
      acoes: [],
      membros: [],
      dataInicio: '2026-01-01',
      dataApresentacao: '2026-06-01',
      faseAtual: 2,
      status: 'ativo',
      liderId: 'user-1',
    },
    bloqueio: {
      pendentes: [
        {
          requisito: { id: 'F2_META', fase: 2, descricaoCurta: 'Definir meta' },
          responsavelNome: 'Carlos',
        },
      ],
      podAvancar: false,
    },
    diasRestantes: 90,
    risco: 'BAIXO',
  } as unknown as StatusProjeto;

  it('generates CSV with header row', () => {
    const csv = exportarCSV(mockStatus);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Fase,Requisito,Status,Responsável,Data');
  });

  it('includes completed evidence rows', () => {
    const csv = exportarCSV(mockStatus);
    expect(csv).toContain('1,F1_ANALISE,Cumprido,user-1,2026-03-01');
    expect(csv).toContain('2,F2_CAUSA,Cumprido,user-2,2026-03-02');
  });

  it('includes pending requirement rows', () => {
    const csv = exportarCSV(mockStatus);
    expect(csv).toContain('2,F2_META,Pendente,Carlos,');
  });

  it('handles empty evidencias and pendentes', () => {
    const emptyStatus = {
      projeto: { evidencias: [], acoes: [], membros: [] },
      bloqueio: { pendentes: [] },
    } as unknown as StatusProjeto;
    const csv = exportarCSV(emptyStatus);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1); // only header
  });
});
