import { describe, it, expect } from 'vitest';
import {
  calcularNivelCobranca,
  gerarMensagemCobranca,
  ESCALACAO_DEFAULT,
} from './cobrancaProgressiva';

describe('calcularNivelCobranca', () => {
  it('returns lembrete for 0 days', () => {
    const r = calcularNivelCobranca(0);
    expect(r.nivel).toBe('lembrete');
    expect(r.destinatario).toBe('responsavel');
  });

  it('returns lembrete for 3 days', () => {
    const r = calcularNivelCobranca(3);
    expect(r.nivel).toBe('lembrete');
    expect(r.destinatario).toBe('responsavel');
  });

  it('returns alerta for 7 days', () => {
    const r = calcularNivelCobranca(7);
    expect(r.nivel).toBe('alerta');
    expect(r.destinatario).toBe('grupo');
  });

  it('returns cobranca for 14 days', () => {
    const r = calcularNivelCobranca(14);
    expect(r.nivel).toBe('cobranca');
    expect(r.destinatario).toBe('lider');
  });

  it('returns escalacao for 21 days', () => {
    const r = calcularNivelCobranca(21);
    expect(r.nivel).toBe('escalacao');
    expect(r.destinatario).toBe('facilitador');
  });

  it('returns escalacao for 30 days', () => {
    const r = calcularNivelCobranca(30);
    expect(r.nivel).toBe('escalacao');
  });

  it('uses custom config', () => {
    const config = { ...ESCALACAO_DEFAULT, diasLembrete: 1, diasAlerta: 2, diasCobranca: 3, diasEscalacao: 4 };
    expect(calcularNivelCobranca(4, config)).toMatchObject({ nivel: 'escalacao' });
  });
});

describe('gerarMensagemCobranca', () => {
  it('generates lembrete message', () => {
    const msg = gerarMensagemCobranca({
      nome: 'Carlos Silva', requisitoDesc: 'Definir problema', diasAtraso: 3,
      nivel: 'lembrete', destinatario: 'responsavel', projetoNome: 'CCQ-01',
    });
    expect(msg).toContain('Carlos');
    expect(msg).toContain('3 dias');
  });

  it('generates alerta message', () => {
    const msg = gerarMensagemCobranca({
      nome: 'Ana', requisitoDesc: 'Meta', diasAtraso: 7,
      nivel: 'alerta', destinatario: 'grupo', projetoNome: 'CCQ-01',
    });
    expect(msg).toContain('Grupo');
  });

  it('generates cobranca message', () => {
    const msg = gerarMensagemCobranca({
      nome: 'Pedro', requisitoDesc: 'Causa raiz', diasAtraso: 14,
      nivel: 'cobranca', destinatario: 'lider', projetoNome: 'Projeto X',
    });
    expect(msg).toContain('Pedro');
    expect(msg).toContain('Projeto X');
  });

  it('generates escalacao message', () => {
    const msg = gerarMensagemCobranca({
      nome: 'Maria', requisitoDesc: 'Plano', diasAtraso: 21,
      nivel: 'escalacao', destinatario: 'facilitador', projetoNome: 'CCQ-02',
    });
    expect(msg).toContain('ESCALAÇÃO');
  });
});
