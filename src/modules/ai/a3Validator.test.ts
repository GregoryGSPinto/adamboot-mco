import { describe, it, expect } from 'vitest';
import {
  validarProblema,
  validarMeta,
  validarCausaRaiz,
  validarContramedida,
  validarResultado,
  validarA3Completo,
  podAcessarPasso,
} from './a3Validator';

// ═══════════════════════════════════
// validarProblema
// ═══════════════════════════════════

describe('validarProblema', () => {
  it('blocks empty text', () => {
    expect(validarProblema('')).toMatchObject({ severidade: 'bloqueio' });
  });

  it('blocks text shorter than 10 chars', () => {
    expect(validarProblema('curto')).toMatchObject({ severidade: 'bloqueio' });
  });

  it('blocks text without number or indicator', () => {
    expect(validarProblema('há um problema operacional grave na empresa'))
      .toMatchObject({ severidade: 'bloqueio', campo: 'problema' });
  });

  it('accepts text with number', () => {
    expect(validarProblema('25% dos eventos ocorrem ao assumir locomotiva'))
      .toMatchObject({ severidade: 'ok' });
  });

  it('accepts text with indicator word', () => {
    expect(validarProblema('ocorreram muitas paradas não-programadas, totalizando 4 eventos no mês'))
      .toMatchObject({ severidade: 'ok' });
  });

  it('warns when text contains cause language', () => {
    expect(validarProblema('10 falhas porque o sistema trava'))
      .toMatchObject({ severidade: 'aviso' });
  });

  it('warns for generic risk language without number', () => {
    const r = validarProblema('existe um risco operacional na planta');
    expect(r.severidade).not.toBe('ok');
  });

  it('returns campo = problema', () => {
    expect(validarProblema('texto válido com 5 eventos')).toMatchObject({ campo: 'problema' });
  });
});

// ═══════════════════════════════════
// validarMeta
// ═══════════════════════════════════

describe('validarMeta', () => {
  it('blocks empty meta', () => {
    expect(validarMeta('')).toMatchObject({ severidade: 'bloqueio' });
  });

  it('blocks short meta', () => {
    expect(validarMeta('meta')).toMatchObject({ severidade: 'bloqueio' });
  });

  it('blocks meta without number and deadline', () => {
    expect(validarMeta('melhorar o processo de forma geral'))
      .toMatchObject({ severidade: 'bloqueio' });
  });

  it('warns when missing just one SMART component', () => {
    const r = validarMeta('Reduzir erros de 10 para 0');
    expect(r.severidade).toBe('aviso');
  });

  it('accepts full SMART meta', () => {
    expect(validarMeta('Reduzir erros de 10 para 0 até dezembro'))
      .toMatchObject({ severidade: 'ok' });
  });

  it('accepts meta with percentage and date', () => {
    expect(validarMeta('Atingir 100% de conformidade até 28/01/2026'))
      .toMatchObject({ severidade: 'ok' });
  });

  it('returns campo = meta', () => {
    expect(validarMeta('qualquer texto longo o suficiente com dados')).toMatchObject({ campo: 'meta' });
  });
});

// ═══════════════════════════════════
// validarCausaRaiz
// ═══════════════════════════════════

describe('validarCausaRaiz', () => {
  it('blocks empty causa', () => {
    expect(validarCausaRaiz('')).toMatchObject({ severidade: 'bloqueio' });
  });

  it('blocks "falta de atenção"', () => {
    expect(validarCausaRaiz('a causa foi falta de atenção do operador'))
      .toMatchObject({ severidade: 'bloqueio' });
  });

  it('blocks "erro humano"', () => {
    expect(validarCausaRaiz('a causa raiz é erro humano na operação'))
      .toMatchObject({ severidade: 'bloqueio' });
  });

  it('blocks "falha operacional"', () => {
    expect(validarCausaRaiz('identificamos falha operacional no turno'))
      .toMatchObject({ severidade: 'bloqueio' });
  });

  it('blocks "negligência"', () => {
    expect(validarCausaRaiz('negligência do colaborador na execução'))
      .toMatchObject({ severidade: 'bloqueio' });
  });

  it('warns behavioral cause', () => {
    expect(validarCausaRaiz('o operador não seguiu o procedimento correto'))
      .toMatchObject({ severidade: 'aviso' });
  });

  it('accepts systemic cause', () => {
    expect(validarCausaRaiz('o sensor de temperatura está descalibrado desde a última manutenção'))
      .toMatchObject({ severidade: 'ok' });
  });

  it('returns campo = causa_raiz', () => {
    expect(validarCausaRaiz('causa sistêmica identificada corretamente no processo'))
      .toMatchObject({ campo: 'causa_raiz' });
  });
});

// ═══════════════════════════════════
// validarContramedida
// ═══════════════════════════════════

describe('validarContramedida', () => {
  it('blocks empty contramedida', () => {
    expect(validarContramedida('')).toMatchObject({ severidade: 'bloqueio' });
  });

  it('warns for "retreinar"', () => {
    expect(validarContramedida('retreinar todos os operadores'))
      .toMatchObject({ severidade: 'aviso' });
  });

  it('warns for "conscientizar"', () => {
    expect(validarContramedida('conscientizar a equipe sobre segurança'))
      .toMatchObject({ severidade: 'aviso' });
  });

  it('warns for DDS', () => {
    expect(validarContramedida('realizar DDS sobre o procedimento correto'))
      .toMatchObject({ severidade: 'aviso' });
  });

  it('accepts systemic action', () => {
    expect(validarContramedida('instalar poka-yoke no ponto de alimentação do material'))
      .toMatchObject({ severidade: 'ok' });
  });

  it('returns campo = contramedida', () => {
    expect(validarContramedida('redesenhar layout da estação de trabalho'))
      .toMatchObject({ campo: 'contramedida' });
  });
});

// ═══════════════════════════════════
// validarResultado
// ═══════════════════════════════════

describe('validarResultado', () => {
  it('blocks without comparison', () => {
    expect(validarResultado({ temComparacao: false, temEvidencia: true }))
      .toMatchObject({ severidade: 'bloqueio' });
  });

  it('warns without evidence', () => {
    expect(validarResultado({ temComparacao: true, temEvidencia: false }))
      .toMatchObject({ severidade: 'aviso' });
  });

  it('warns when meta not met', () => {
    expect(validarResultado({ temComparacao: true, temEvidencia: true, metaAtingida: false }))
      .toMatchObject({ severidade: 'aviso' });
  });

  it('accepts complete valid result', () => {
    expect(validarResultado({ temComparacao: true, temEvidencia: true, metaAtingida: true }))
      .toMatchObject({ severidade: 'ok' });
  });
});

// ═══════════════════════════════════
// validarA3Completo
// ═══════════════════════════════════

describe('validarA3Completo', () => {
  it('returns empty for empty data', () => {
    expect(validarA3Completo({})).toHaveLength(0);
  });

  it('validates all provided fields', () => {
    const results = validarA3Completo({
      problema: '10 paradas no mês',
      meta: 'Reduzir de 10 para 0 até março',
      causaRaiz: 'sensor descalibrado na linha 3',
      contramedidas: ['instalar poka-yoke'],
    });
    expect(results.length).toBe(4);
    expect(results.every(r => r.severidade === 'ok')).toBe(true);
  });
});

// ═══════════════════════════════════
// podAcessarPasso
// ═══════════════════════════════════

describe('podAcessarPasso', () => {
  it('passo 1 always accessible', () => {
    expect(podAcessarPasso(1, {})).toMatchObject({ podeAcessar: true });
  });

  it('passo 2 blocked without valid problem', () => {
    expect(podAcessarPasso(2, {})).toMatchObject({ podeAcessar: false });
  });

  it('passo 2 allowed with valid problem', () => {
    expect(podAcessarPasso(2, { problema: '5 falhas no turno noturno' }))
      .toMatchObject({ podeAcessar: true });
  });
});
