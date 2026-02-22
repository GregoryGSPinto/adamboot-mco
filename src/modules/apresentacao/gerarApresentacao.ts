/**
 * GERADOR DE APRESENTAÇÃO — Monta slides automaticamente a partir dos dados A3.
 *
 * Segue a estrutura do template Vale 2026 CCQ:
 *   1. Capa
 *   2. Grupo + participantes
 *   3. Contextualização
 *   4. Problema — Identificação
 *   5. Problema — Histórico/Desdobramento
 *   6. Meta — Definição SMART
 *   7. Meta — Clarificação (Ideal → GAP → Atual)
 *   8. Investigação da Causa (Ishikawa + 5 Porquês)
 *   9. Solução — Contramedidas e Execução
 *  10. Verificação de Resultados
 *  11. Padronização e Replicação
 *  12. Conclusão
 *
 * Em mock, gera array de SlideData.
 * Em produção: backend gera .pptx real via pptxgenjs.
 */

import { FASE_LABELS } from '@shared/engine';
import type { ProjetoMelhoria, StatusProjeto } from '@shared/engine';
import type { Resultado } from '@modules/verificacao';
import { getResultados, compararAntesDepois } from '@modules/verificacao';

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export interface SlideData {
  numero: number;
  titulo: string;
  subtitulo?: string;
  conteudo: SlideConteudo[];
  notas?: string;
  layout: 'capa' | 'titulo_corpo' | 'duas_colunas' | 'dados' | 'conclusao';
}

export type SlideConteudo =
  | { tipo: 'texto'; valor: string; destaque?: boolean }
  | { tipo: 'indicador'; label: string; valor: string; unidade?: string }
  | { tipo: 'lista'; itens: string[] }
  | { tipo: 'comparacao'; antes: string; depois: string; label: string }
  | { tipo: 'tabela'; headers: string[]; rows: string[][] }
  | { tipo: 'placeholder_foto'; legenda: string };

export interface DadosApresentacao {
  nomeGrupo: string;
  unidade: string;
  participantes: { nome: string; papel: string }[];
  contexto: string;
  problema: string;
  indicadorProblema: string;
  desdobramento: string;
  meta: string;
  situacaoIdeal: string;
  situacaoAtual: string;
  gap: string;
  causaRaiz: string;
  metodoAnalise: string; // "5 Porquês", "Ishikawa"
  contramedidas: { descricao: string; responsavel: string; prazo: string; status: string }[];
  resultados: { indicador: string; antes: number; depois: number; meta?: number; unidade: string }[];
  padronizacao: string;
  replicacao: string;
  conclusao: string;
}

// ════════════════════════════════════
// GENERATOR
// ════════════════════════════════════

/**
 * Gerar slides da apresentação CCQ a partir dos dados do A3.
 * Cada slide corresponde a uma seção do template Vale.
 */
export function gerarSlides(dados: DadosApresentacao): SlideData[] {
  const slides: SlideData[] = [];

  // ── 1. CAPA ──
  slides.push({
    numero: 1,
    titulo: 'Encontro de Melhoria Contínua',
    subtitulo: dados.nomeGrupo,
    conteudo: [
      { tipo: 'texto', valor: dados.unidade },
    ],
    layout: 'capa',
  });

  // ── 2. PARTICIPANTES ──
  slides.push({
    numero: 2,
    titulo: 'Participantes',
    conteudo: [
      {
        tipo: 'tabela',
        headers: ['Nome', 'Papel'],
        rows: dados.participantes.map((p) => [p.nome, p.papel]),
      },
    ],
    layout: 'titulo_corpo',
  });

  // ── 3. CONTEXTUALIZAÇÃO ──
  slides.push({
    numero: 3,
    titulo: 'Contextualização',
    subtitulo: 'Qual a origem? Por que este projeto foi desenvolvido?',
    conteudo: [
      { tipo: 'texto', valor: dados.contexto },
      { tipo: 'placeholder_foto', legenda: 'Foto do local/processo' },
    ],
    layout: 'duas_colunas',
    notas: 'Transformando dados em decisões seguras e competitivas',
  });

  // ── 4. PROBLEMA — IDENTIFICAÇÃO ──
  slides.push({
    numero: 4,
    titulo: 'Problema — Identificação',
    subtitulo: '1º Passo: Clarificar o Problema',
    conteudo: [
      { tipo: 'texto', valor: dados.problema, destaque: true },
      { tipo: 'indicador', label: 'Indicador', valor: dados.indicadorProblema },
    ],
    layout: 'titulo_corpo',
  });

  // ── 5. PROBLEMA — DESDOBRAMENTO ──
  slides.push({
    numero: 5,
    titulo: 'Problema — Desdobramento',
    subtitulo: '2º Passo: Priorização',
    conteudo: [
      { tipo: 'texto', valor: dados.desdobramento },
    ],
    layout: 'titulo_corpo',
    notas: 'Use Pareto: 80% do efeito vem de 20% das causas',
  });

  // ── 6. META ──
  slides.push({
    numero: 6,
    titulo: 'Definição da Meta',
    subtitulo: '3º Passo: Meta SMART',
    conteudo: [
      { tipo: 'texto', valor: dados.meta, destaque: true },
    ],
    layout: 'titulo_corpo',
  });

  // ── 7. CLARIFICAÇÃO — GAP ──
  slides.push({
    numero: 7,
    titulo: 'Clarificação do Problema',
    conteudo: [
      { tipo: 'indicador', label: 'Situação Ideal', valor: dados.situacaoIdeal },
      { tipo: 'indicador', label: 'GAP (Problema)', valor: dados.gap },
      { tipo: 'indicador', label: 'Situação Atual', valor: dados.situacaoAtual },
    ],
    layout: 'dados',
  });

  // ── 8. INVESTIGAÇÃO DA CAUSA ──
  slides.push({
    numero: 8,
    titulo: 'Investigação da Causa',
    subtitulo: `4º Passo: Análise — ${dados.metodoAnalise}`,
    conteudo: [
      { tipo: 'texto', valor: `Causa Raiz: ${dados.causaRaiz}`, destaque: true },
    ],
    layout: 'titulo_corpo',
    notas: 'Causa sistêmica, não comportamental',
  });

  // ── 9. SOLUÇÃO — CONTRAMEDIDAS + EXECUÇÃO ──
  slides.push({
    numero: 9,
    titulo: 'Solução — Execução das Ações',
    subtitulo: '5º e 6º Passos: Contramedidas e Plano de Ação',
    conteudo: [
      {
        tipo: 'tabela',
        headers: ['#', 'Contramedida', 'Responsável', 'Prazo', 'Status'],
        rows: dados.contramedidas.map((cm, i) => [
          String(i + 1),
          cm.descricao,
          cm.responsavel,
          cm.prazo,
          cm.status,
        ]),
      },
      { tipo: 'placeholder_foto', legenda: 'Foto da implementação' },
    ],
    layout: 'titulo_corpo',
  });

  // ── 10. VERIFICAÇÃO DE RESULTADOS ──
  if (dados.resultados.length > 0) {
    slides.push({
      numero: 10,
      titulo: 'Verificação de Resultados',
      subtitulo: '7º Passo: Antes vs. Depois',
      conteudo: dados.resultados.map((r) => ({
        tipo: 'comparacao' as const,
        label: r.indicador,
        antes: `${r.antes} ${r.unidade}`,
        depois: `${r.depois} ${r.unidade}`,
      })),
      layout: 'dados',
    });
  }

  // ── 11. PADRONIZAÇÃO E REPLICAÇÃO ──
  slides.push({
    numero: 11,
    titulo: 'Padronização e Replicação',
    subtitulo: '8º Passo',
    conteudo: [
      { tipo: 'texto', valor: `Padronização: ${dados.padronizacao}` },
      { tipo: 'texto', valor: `Replicação: ${dados.replicacao}` },
      { tipo: 'placeholder_foto', legenda: 'Foto do novo padrão' },
    ],
    layout: 'duas_colunas',
  });

  // ── 12. CONCLUSÃO ──
  slides.push({
    numero: 12,
    titulo: 'Conclusão',
    conteudo: [
      { tipo: 'texto', valor: dados.conclusao },
    ],
    layout: 'conclusao',
    notas: 'Insira benefícios da replicação. Quantifique a redução de desperdícios.',
  });

  return slides;
}

// ════════════════════════════════════
// HELPER — EXTRAIR DADOS DO PROJETO
// ════════════════════════════════════

/**
 * Montar DadosApresentacao a partir de StatusProjeto.
 * Usa dados do mock. Em produção, alimentado pelos formulários do A3.
 */
export function extrairDadosApresentacao(status: StatusProjeto): DadosApresentacao {
  const { projeto } = status;

  // Buscar resultados da verificação
  const resultados = getResultados(projeto.id);
  const comparacoes = resultados.map((r) => ({
    indicador: r.indicador,
    antes: r.valorAntes,
    depois: r.valorDepois,
    meta: r.meta,
    unidade: r.unidade,
  }));

  return {
    nomeGrupo: 'ArtTrens CCQ',
    unidade: 'Supervisão CSI — Ferrovia',
    participantes: projeto.membros.map((m) => ({ nome: m.nome, papel: m.papel })),
    contexto: `Projeto iniciado em ${new Date(projeto.dataInicio).toLocaleDateString('pt-BR')} para resolver: ${projeto.titulo}.`,
    problema: projeto.titulo,
    indicadorProblema: 'Indicador: verificar dados do A3',
    desdobramento: 'Priorização via Pareto — verificar dados do A3',
    meta: `Apresentação até ${new Date(projeto.dataApresentacao).toLocaleDateString('pt-BR')}`,
    situacaoIdeal: 'Zero ocorrências',
    situacaoAtual: 'Verificar dados do A3',
    gap: 'Diferença entre ideal e atual',
    causaRaiz: 'Verificar dados do A3',
    metodoAnalise: '5 Porquês + Ishikawa',
    contramedidas: projeto.acoes.map((a) => ({
      descricao: a.descricao,
      responsavel: a.responsavelId,
      prazo: a.dataPrevista,
      status: a.status,
    })),
    resultados: comparacoes,
    padronizacao: 'Procedimento a ser documentado',
    replicacao: 'Áreas de replicação a definir',
    conclusao: `Projeto "${projeto.titulo}" — Fase ${projeto.faseAtual}/8.`,
  };
}

/**
 * Gerar texto completo da apresentação (para export sem pptx).
 */
export function gerarTextoApresentacao(slides: SlideData[]): string {
  const linhas: string[] = [];

  slides.forEach((slide) => {
    linhas.push(`${'═'.repeat(60)}`);
    linhas.push(`SLIDE ${slide.numero}: ${slide.titulo}`);
    if (slide.subtitulo) linhas.push(slide.subtitulo);
    linhas.push(`${'─'.repeat(60)}`);

    slide.conteudo.forEach((c) => {
      switch (c.tipo) {
        case 'texto':
          linhas.push(c.destaque ? `▸ ${c.valor}` : c.valor);
          break;
        case 'indicador':
          linhas.push(`  ${c.label}: ${c.valor}${c.unidade ? ' ' + c.unidade : ''}`);
          break;
        case 'lista':
          c.itens.forEach((item) => linhas.push(`  • ${item}`));
          break;
        case 'comparacao':
          linhas.push(`  ${c.label}: ${c.antes} → ${c.depois}`);
          break;
        case 'tabela':
          linhas.push(`  ${c.headers.join(' | ')}`);
          c.rows.forEach((row) => linhas.push(`  ${row.join(' | ')}`));
          break;
        case 'placeholder_foto':
          linhas.push(`  [📷 ${c.legenda}]`);
          break;
      }
    });

    if (slide.notas) {
      linhas.push(`  📌 ${slide.notas}`);
    }
    linhas.push('');
  });

  return linhas.join('\n');
}
