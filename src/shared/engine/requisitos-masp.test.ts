import { describe, it, expect } from 'vitest';
import {
  REQUISITOS_MASP,
  requisitosDaFase,
  requisitosObrigatorios,
  FASE_LABELS,
  FASE_LABELS_CURTOS,
  TOTAL_FASES,
  TOTAL_REQUISITOS,
  TOTAL_OBRIGATORIOS,
} from './requisitos-masp';

describe('REQUISITOS_MASP catalog', () => {
  it('has 8 phases', () => {
    expect(TOTAL_FASES).toBe(8);
  });

  it('has expected total requirements', () => {
    expect(TOTAL_REQUISITOS).toBe(REQUISITOS_MASP.length);
    expect(REQUISITOS_MASP.length).toBeGreaterThanOrEqual(30);
  });

  it('has correct obrigatorios count', () => {
    const obrigatorios = REQUISITOS_MASP.filter(r => r.obrigatorio);
    expect(TOTAL_OBRIGATORIOS).toBe(obrigatorios.length);
    expect(TOTAL_OBRIGATORIOS).toBeGreaterThan(25); // most are mandatory
  });

  it('every requirement has required fields', () => {
    REQUISITOS_MASP.forEach(r => {
      expect(r.id).toBeTruthy();
      expect(r.fase).toBeGreaterThanOrEqual(1);
      expect(r.fase).toBeLessThanOrEqual(8);
      expect(r.codigo).toBeTruthy();
      expect(r.descricao).toBeTruthy();
      expect(r.descricaoCurta).toBeTruthy();
      expect(r.tipoValidacao).toBeTruthy();
      expect(r.responsavelTipo).toBeTruthy();
      expect(r.dicaIA).toBeTruthy();
    });
  });

  it('every phase has at least 3 requirements', () => {
    for (let fase = 1; fase <= 8; fase++) {
      const reqs = requisitosDaFase(fase);
      expect(reqs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('IDs follow pattern F{N}_{CODE}', () => {
    REQUISITOS_MASP.forEach(r => {
      expect(r.id).toMatch(/^F\d_/);
      expect(r.id.startsWith(`F${r.fase}_`)).toBe(true);
    });
  });
});

describe('requisitosDaFase', () => {
  it('returns only requirements for the given phase', () => {
    const fase4 = requisitosDaFase(4);
    fase4.forEach(r => expect(r.fase).toBe(4));
    expect(fase4.length).toBeGreaterThan(0);
  });

  it('returns empty array for nonexistent phase', () => {
    expect(requisitosDaFase(0)).toEqual([]);
    expect(requisitosDaFase(99)).toEqual([]);
  });
});

describe('requisitosObrigatorios', () => {
  it('returns only mandatory requirements for the given phase', () => {
    const obrig1 = requisitosObrigatorios(1);
    obrig1.forEach(r => {
      expect(r.fase).toBe(1);
      expect(r.obrigatorio).toBe(true);
    });
    expect(obrig1.length).toBeGreaterThan(0);
  });

  it('is a subset of requisitosDaFase', () => {
    for (let fase = 1; fase <= 8; fase++) {
      const all = requisitosDaFase(fase);
      const obrig = requisitosObrigatorios(fase);
      expect(obrig.length).toBeLessThanOrEqual(all.length);
    }
  });
});

describe('FASE_LABELS', () => {
  it('has labels for all 8 phases', () => {
    for (let f = 1; f <= 8; f++) {
      expect(FASE_LABELS[f]).toBeTruthy();
      expect(FASE_LABELS_CURTOS[f]).toBeTruthy();
    }
  });
});
