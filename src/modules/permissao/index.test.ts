import { describe, it, expect } from 'vitest';
import { podeExecutar, perfilNoProjeto, acoesPermitidas, exigirPermissao } from './index';

describe('podeExecutar', () => {
  it('admin can do anything', () => {
    expect(podeExecutar('admin', 'resetar_dados')).toBe(true);
    expect(podeExecutar('admin', 'avancar_fase')).toBe(true);
    expect(podeExecutar('admin', 'excluir_projeto')).toBe(true);
  });

  it('membro can cumprir_requisito', () => {
    expect(podeExecutar('membro', 'cumprir_requisito')).toBe(true);
  });

  it('membro cannot avancar_fase', () => {
    expect(podeExecutar('membro', 'avancar_fase')).toBe(false);
  });

  it('lider can avancar_fase', () => {
    expect(podeExecutar('lider', 'avancar_fase')).toBe(true);
  });

  it('lider cannot retroceder_fase', () => {
    expect(podeExecutar('lider', 'retroceder_fase')).toBe(false);
  });

  it('coordenador can retroceder_fase', () => {
    expect(podeExecutar('coordenador', 'retroceder_fase')).toBe(true);
  });

  it('accepts array of perfis', () => {
    expect(podeExecutar(['membro', 'lider'], 'avancar_fase')).toBe(true);
  });

  it('rejects unknown action', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(podeExecutar('admin', 'nonexistent_action' as any)).toBe(false);
  });

  it('facilitador can cobrar_membro', () => {
    expect(podeExecutar('facilitador', 'cobrar_membro')).toBe(true);
  });

  it('membro cannot excluir_projeto', () => {
    expect(podeExecutar('membro', 'excluir_projeto')).toBe(false);
  });
});

describe('perfilNoProjeto', () => {
  const projeto = {
    liderId: 'user-1',
    facilitadorId: 'user-2',
    membros: [
      { id: 'user-1', papel: 'lider' },
      { id: 'user-2', papel: 'facilitador' },
      { id: 'user-3', papel: 'membro' },
    ],
  };

  it('returns lider for liderId', () => {
    expect(perfilNoProjeto('user-1', projeto)).toBe('lider');
  });

  it('returns facilitador for facilitadorId', () => {
    expect(perfilNoProjeto('user-2', projeto)).toBe('facilitador');
  });

  it('returns membro for membro', () => {
    expect(perfilNoProjeto('user-3', projeto)).toBe('membro');
  });

  it('returns membro for unknown user', () => {
    expect(perfilNoProjeto('user-99', projeto)).toBe('membro');
  });
});

describe('acoesPermitidas', () => {
  it('admin has most actions', () => {
    const acoes = acoesPermitidas('admin');
    expect(acoes.length).toBeGreaterThan(10);
    expect(acoes).toContain('resetar_dados');
  });

  it('membro has limited actions', () => {
    const acoes = acoesPermitidas('membro');
    expect(acoes).toContain('cumprir_requisito');
    expect(acoes).not.toContain('resetar_dados');
  });
});

describe('exigirPermissao', () => {
  it('does not throw for allowed action', () => {
    expect(() => exigirPermissao('admin', 'resetar_dados')).not.toThrow();
  });

  it('throws for denied action', () => {
    expect(() => exigirPermissao('membro', 'resetar_dados')).toThrow();
  });
});
