import { describe, it, expect } from 'vitest';
import { mockDb } from './mock-db';

describe('mockDb', () => {
  describe('listarEventos', () => {
    it('returns paginated list with default params', async () => {
      const result = await mockDb.listarEventos();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 20);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('respects pagination params', async () => {
      const result = await mockDb.listarEventos({ page: 1, limit: 2 });
      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.limit).toBe(2);
    });

    it('returns sorted by criadoEm descending', async () => {
      const result = await mockDb.listarEventos();
      for (let i = 1; i < result.data.length; i++) {
        const prev = new Date(result.data[i - 1].criadoEm).getTime();
        const curr = new Date(result.data[i].criadoEm).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });
  });

  describe('buscarEvento', () => {
    it('finds existing event', async () => {
      const evt = await mockDb.buscarEvento('evt-001');
      expect(evt.id).toBe('evt-001');
      expect(evt.tipo).toBe('INCIDENTE');
    });

    it('throws for nonexistent event', async () => {
      await expect(mockDb.buscarEvento('evt-999')).rejects.toThrow('não encontrado');
    });
  });

  describe('criarEvento', () => {
    it('creates a new event and returns it', async () => {
      const novo = await mockDb.criarEvento({
        data: '2026-03-01T10:00:00Z',
        local: 'Test Location',
        descricao: 'Test event',
        tipo: 'DESVIO',
        severidade: 'BAIXA',
      });
      expect(novo.id).toBeTruthy();
      expect(novo.descricao).toBe('Test event');
      expect(novo.tipo).toBe('DESVIO');
    });
  });

  describe('listarCiclos', () => {
    it('returns ciclos list', async () => {
      const result = await mockDb.listarCiclos();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('faseAtual');
    });
  });

  describe('buscarCiclo', () => {
    it('finds existing ciclo', async () => {
      const ciclo = await mockDb.buscarCiclo('ciclo-001');
      expect(ciclo.id).toBe('ciclo-001');
    });

    it('throws for nonexistent ciclo', async () => {
      await expect(mockDb.buscarCiclo('ciclo-999')).rejects.toThrow('não encontrado');
    });
  });

  describe('avancarFase', () => {
    it('advances ciclo to next phase', async () => {
      const before = await mockDb.buscarCiclo('ciclo-002');
      const beforePhase = before.faseAtual;
      const beforeHistLen = before.historicoFases.length;
      const result = await mockDb.avancarFase('ciclo-002', 'Test advance');
      expect(result.faseAtual).not.toBe(beforePhase);
      expect(result.faseNumero).toBeGreaterThan(0);
      expect(result.historicoFases.length).toBeGreaterThan(beforeHistLen);
    });

    it('throws for nonexistent ciclo', async () => {
      await expect(mockDb.avancarFase('ciclo-999')).rejects.toThrow('não encontrado');
    });
  });

  describe('listarEvidencias', () => {
    it('returns all evidencias', async () => {
      const result = await mockDb.listarEvidencias();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('filters by eventoId', async () => {
      const result = await mockDb.listarEvidencias({ eventoId: 'evt-001' });
      result.data.forEach(e => expect(e.eventoId).toBe('evt-001'));
    });

    it('returns empty for unknown eventoId', async () => {
      const result = await mockDb.listarEvidencias({ eventoId: 'evt-999' });
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('returns aggregate statistics', async () => {
      const stats = await mockDb.getStats();
      expect(stats.totalEventos).toBeGreaterThan(0);
      expect(stats).toHaveProperty('porSeveridade');
      expect(stats).toHaveProperty('porTipo');
      expect(stats.porSeveridade).toHaveProperty('CRITICA');
      expect(stats.porTipo).toHaveProperty('INCIDENTE');
    });
  });
});
