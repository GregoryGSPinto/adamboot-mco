/**
 * MÓDULO LGPD — Conformidade com Lei Geral de Proteção de Dados.
 *
 * Checklist:
 *   [x] Aviso de uso de imagem ao anexar foto
 *   [x] Anonimizar nomes em relatório externo
 *   [x] Controle de retenção de dados
 *   [x] Exportar dados do usuário
 *   [x] Termo de responsabilidade no primeiro acesso
 */

import { auditLog } from '@modules/audit';

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export interface ConsentimentoUsuario {
  userId: string;
  termoAceito: boolean;
  dataAceite?: string;
  versaoTermo: string;
  usoImagem: boolean;
  compartilhamentoDados: boolean;
}

export interface RetencaoConfig {
  /** Dias para manter projetos concluídos */
  diasProjetosConcluidos: number;
  /** Dias para manter logs de auditoria */
  diasAuditoria: number;
  /** Dias para manter fotos */
  diasFotos: number;
  /** Dias para manter mensagens de chat */
  diasMensagens: number;
}

export interface ExportacaoDados {
  userId: string;
  geradoEm: string;
  dados: {
    perfil: Record<string, unknown>;
    projetos: string[];
    mensagens: number;
    evidencias: number;
    acoes: number;
  };
  formato: 'json';
  conteudo: string;
}

// ════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════

export const VERSAO_TERMO_ATUAL = '1.0.0';

export const RETENCAO_DEFAULT: RetencaoConfig = {
  diasProjetosConcluidos: 1825, // 5 anos
  diasAuditoria: 3650,          // 10 anos
  diasFotos: 1825,
  diasMensagens: 1825,
};

export const AVISO_USO_IMAGEM = `
AVISO: Ao anexar uma foto, você confirma que:
• A imagem não contém informações pessoais sensíveis
• Pessoas na imagem foram informadas sobre o registro
• A foto será utilizada exclusivamente para fins do projeto CCQ
• O uso segue a Política de Privacidade da empresa
`.trim();

export const TERMO_RESPONSABILIDADE = `
TERMO DE RESPONSABILIDADE E CONSENTIMENTO

Ao utilizar o sistema MCO (Melhoria Contínua Operacional), declaro que:

1. Minhas ações serão registradas para fins de auditoria
2. Fotos e documentos enviados ficam vinculados ao projeto
3. Dados podem ser acessados por líderes e coordenadores do CCQ
4. Posso solicitar exportação dos meus dados a qualquer momento
5. Dados são retidos conforme política de retenção corporativa

Versão: ${VERSAO_TERMO_ATUAL}
`.trim();

// ════════════════════════════════════
// STORE
// ════════════════════════════════════

const _consentimentos: Map<string, ConsentimentoUsuario> = new Map();

// ════════════════════════════════════
// API
// ════════════════════════════════════

/**
 * Verificar se usuário aceitou o termo atual.
 */
export function verificarConsentimento(userId: string): boolean {
  const c = _consentimentos.get(userId);
  return c?.termoAceito === true && c.versaoTermo === VERSAO_TERMO_ATUAL;
}

/**
 * Registrar aceite do termo.
 */
export function registrarConsentimento(userId: string, userName: string): ConsentimentoUsuario {
  const consentimento: ConsentimentoUsuario = {
    userId,
    termoAceito: true,
    dataAceite: new Date().toISOString(),
    versaoTermo: VERSAO_TERMO_ATUAL,
    usoImagem: true,
    compartilhamentoDados: true,
  };

  _consentimentos.set(userId, consentimento);

  auditLog({
    userId,
    userName,
    action: 'lgpd_consentimento',
    description: `Termo v${VERSAO_TERMO_ATUAL} aceito`,
  });

  return consentimento;
}

/**
 * Anonimizar nome para relatório externo.
 */
export function anonimizar(nome: string): string {
  if (!nome || nome.length < 2) return '***';
  return nome.charAt(0) + '*'.repeat(nome.length - 1);
}

/**
 * Exportar todos os dados do usuário (direito LGPD).
 */
export function exportarDadosUsuario(userId: string, userName: string): ExportacaoDados {
  auditLog({
    userId,
    userName,
    action: 'lgpd_exportacao',
    description: 'Solicitação de exportação de dados pessoais (LGPD)',
  });

  // Em mock, retorna estrutura vazia
  const dados = {
    perfil: { id: userId, nome: userName },
    projetos: [],
    mensagens: 0,
    evidencias: 0,
    acoes: 0,
  };

  return {
    userId,
    geradoEm: new Date().toISOString(),
    dados,
    formato: 'json',
    conteudo: JSON.stringify(dados, null, 2),
  };
}

/**
 * Verificar itens com retenção expirada.
 */
export function verificarRetencao(_config: RetencaoConfig = RETENCAO_DEFAULT): {
  projetosExpirados: number;
  logsExpirados: number;
} {
  // Em mock, retorna zeros
  return { projetosExpirados: 0, logsExpirados: 0 };
}
