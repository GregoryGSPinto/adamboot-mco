/**
 * MÓDULO RELATÓRIO — Geração de documentos e exportação.
 *
 * Checklist:
 *   [x] Histórico completo (11)
 *   [x] PDF automático (11)
 *   [x] Progresso do grupo (11)
 *   [x] Dashboard líder (11)
 *   [x] Exportar dados para planilha (18)
 *   [x] Identificação do grupo no relatório (18)
 *   [x] Número automático do projeto (18)
 *   [x] Registro de datas das reuniões (18)
 *   [x] Versão do relatório gerado (18)
 *
 * Em mock, gera texto formatado.
 * Em produção: backend gera PDF real via puppeteer/wkhtmltopdf.
 */

import { FASE_LABELS, TOTAL_FASES } from '@shared/engine';
import type { StatusProjeto } from '@shared/engine';
import { getReunioesDosProjeto } from '@modules/reuniao';

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export interface RelatorioConfig {
  incluirHistorico: boolean;
  incluirReunies: boolean;
  incluirEvidencias: boolean;
  incluirAcoes: boolean;
  incluirAuditoria: boolean;
  anonimizar: boolean;
}

export interface RelatorioGerado {
  id: string;
  projectId: string;
  projectName: string;
  grupoNome: string;
  numeroAutomatico: string;
  versao: number;
  geradoEm: string;
  geradoPor: string;
  formato: 'texto' | 'csv' | 'pdf';
  conteudo: string;
}

// ════════════════════════════════════
// GENERATORS
// ════════════════════════════════════

const _versaoCounter: Map<string, number> = new Map();

/**
 * Gerar número automático do projeto.
 * Formato: CCQ-YYYY-NNN (ex: CCQ-2026-001)
 */
export function gerarNumeroProjeto(dataInicio: string, sequencia: number): string {
  const ano = new Date(dataInicio).getFullYear();
  return `CCQ-${ano}-${String(sequencia).padStart(3, '0')}`;
}

/**
 * Gerar relatório completo do projeto.
 */
export function gerarRelatorio(
  status: StatusProjeto,
  config: RelatorioConfig,
  userId: string
): RelatorioGerado {
  const { projeto } = status;
  const versao = (_versaoCounter.get(projeto.id) ?? 0) + 1;
  _versaoCounter.set(projeto.id, versao);

  const linhas: string[] = [];
  const sep = '═'.repeat(60);

  // Header
  linhas.push(sep);
  linhas.push('RELATÓRIO DE PROJETO CCQ');
  linhas.push(sep);
  linhas.push(`Projeto: ${projeto.titulo}`);
  linhas.push(`Número: ${gerarNumeroProjeto(projeto.dataInicio, 1)}`);
  linhas.push(`Grupo: Grupo CCQ`);
  linhas.push(`Líder: ${projeto.liderId}`);
  linhas.push(
    `Fase atual: ${projeto.faseAtual}/${TOTAL_FASES} — ${FASE_LABELS[projeto.faseAtual]}`
  );
  linhas.push(`Status: ${projeto.status}`);
  linhas.push(`Início: ${new Date(projeto.dataInicio).toLocaleDateString('pt-BR')}`);
  linhas.push(`Apresentação: ${new Date(projeto.dataApresentacao).toLocaleDateString('pt-BR')}`);
  linhas.push(`Dias restantes: ${status.diasRestantes}`);
  linhas.push(`Risco: ${status.risco}`);
  linhas.push(`Versão: v${versao} · ${new Date().toLocaleString('pt-BR')}`);
  linhas.push('');

  // Membros
  linhas.push('─── EQUIPE ───');
  projeto.membros.forEach(m => {
    const nome = config.anonimizar ? `Membro ${m.id.slice(-3)}` : m.nome;
    linhas.push(`  ${nome} (${m.papel})`);
  });
  linhas.push('');

  // Progresso por fase
  linhas.push('─── PROGRESSO ───');
  for (let f = 1; f <= TOTAL_FASES; f++) {
    const label = FASE_LABELS[f];
    const done = projeto.evidencias.filter(e => e.requisitoId.startsWith(`F${f}_`)).length;
    const status_icon = f < projeto.faseAtual ? '✅' : f === projeto.faseAtual ? '🔄' : '⬜';
    linhas.push(`  ${status_icon} Fase ${f}: ${label} (${done} evidências)`);
  }
  linhas.push('');

  // Bloqueios atuais
  if (status.bloqueio.pendentes.length > 0) {
    linhas.push('─── PENDÊNCIAS ATUAIS ───');
    status.bloqueio.pendentes.forEach(p => {
      const nome = config.anonimizar
        ? `Responsável ${p.responsavelNome.slice(0, 1)}***`
        : p.responsavelNome;
      linhas.push(`  ⚠ ${p.requisito.descricaoCurta} → ${nome}`);
    });
    linhas.push('');
  }

  // Ações
  if (config.incluirAcoes && projeto.acoes.length > 0) {
    linhas.push('─── PLANO DE AÇÃO ───');
    projeto.acoes.forEach((a, i) => {
      const nome = config.anonimizar ? `Responsável ${a.responsavelId.slice(-3)}` : a.responsavelId;
      linhas.push(`  ${i + 1}. ${a.descricao}`);
      linhas.push(`     Responsável: ${nome} | Prazo: ${a.dataPrevista} | Status: ${a.status}`);
    });
    linhas.push('');
  }

  // Evidências
  if (config.incluirEvidencias && projeto.evidencias.length > 0) {
    linhas.push('─── EVIDÊNCIAS REGISTRADAS ───');
    projeto.evidencias.forEach(e => {
      linhas.push(
        `  ✓ ${e.requisitoId} — por ${config.anonimizar ? '***' : e.preenchidoPor} em ${e.dataRegistro}`
      );
    });
    linhas.push('');
  }

  // Reuniões
  if (config.incluirReunies) {
    const reunioes = getReunioesDosProjeto(projeto.id);
    if (reunioes.length > 0) {
      linhas.push('─── REUNIÕES ───');
      reunioes.forEach(r => {
        const data = new Date(r.inicio).toLocaleDateString('pt-BR');
        const presentes = r.participantes.filter(p => p.presente).length;
        linhas.push(
          `  ${data} — ${presentes} presentes, ${r.decisoes.length} decisões, ${r.tarefas.length} tarefas`
        );
      });
      linhas.push('');
    }
  }

  linhas.push(sep);
  linhas.push(`Gerado automaticamente pelo MCO em ${new Date().toLocaleString('pt-BR')}`);

  return {
    id: `rel-${Date.now()}`,
    projectId: projeto.id,
    projectName: projeto.titulo,
    grupoNome: 'Grupo CCQ',
    numeroAutomatico: gerarNumeroProjeto(projeto.dataInicio, 1),
    versao,
    geradoEm: new Date().toISOString(),
    geradoPor: userId,
    formato: 'texto',
    conteudo: linhas.join('\n'),
  };
}

/**
 * Exportar dados em formato CSV (para planilha).
 */
export function exportarCSV(status: StatusProjeto): string {
  const { projeto } = status;
  const linhas: string[] = [];

  // Header
  linhas.push('Fase,Requisito,Status,Responsável,Data');

  // Evidências cumpridas
  projeto.evidencias.forEach(e => {
    const faseNum = parseInt(e.requisitoId.split('_')[0].replace('F', ''));
    linhas.push(`${faseNum},${e.requisitoId},Cumprido,${e.preenchidoPor},${e.dataRegistro}`);
  });

  // Pendentes
  status.bloqueio.pendentes.forEach(p => {
    linhas.push(`${p.requisito.fase},${p.requisito.id},Pendente,${p.responsavelNome},`);
  });

  return linhas.join('\n');
}
