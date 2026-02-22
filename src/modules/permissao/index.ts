/**
 * MÓDULO PERMISSÃO — Controle de acesso baseado em papel.
 *
 * Checklist:
 *   [x] Perfil membro
 *   [x] Perfil líder
 *   [x] Perfil coordenador
 *   [x] Só líder encerra projeto
 *   [x] Só coordenador altera fase manualmente
 *
 * Guard functions que verificam se ação é permitida.
 * UI usa para esconder/desabilitar botões.
 * API usa para bloquear mutations.
 */

// ════════════════════════════════════
// TYPES
// ════════════════════════════════════

export type Perfil = 'membro' | 'lider' | 'facilitador' | 'coordenador' | 'admin';

export type AcaoProtegida =
  | 'avancar_fase'
  | 'retroceder_fase'
  | 'encerrar_projeto'
  | 'arquivar_projeto'
  | 'restaurar_projeto'
  | 'criar_projeto'
  | 'editar_projeto'
  | 'excluir_projeto'
  | 'gerenciar_membros'
  | 'cumprir_requisito'
  | 'marcar_decisao'
  | 'iniciar_reuniao'
  | 'finalizar_reuniao'
  | 'cobrar_membro'
  | 'escalar_impedimento'
  | 'alterar_responsavel'
  | 'alterar_prazo'
  | 'exportar_relatorio'
  | 'ver_auditoria'
  | 'resetar_dados'
  | 'desativar_usuario'
  | 'transferir_usuario';

// ════════════════════════════════════
// MATRIZ DE PERMISSÕES
// ════════════════════════════════════

const PERMISSOES: Record<AcaoProtegida, Perfil[]> = {
  // Fases
  avancar_fase:        ['lider', 'coordenador', 'admin'],
  retroceder_fase:     ['coordenador', 'admin'],

  // Projeto
  encerrar_projeto:    ['lider', 'coordenador', 'admin'],
  arquivar_projeto:    ['lider', 'coordenador', 'admin'],
  restaurar_projeto:   ['coordenador', 'admin'],
  criar_projeto:       ['lider', 'coordenador', 'admin'],
  editar_projeto:      ['lider', 'coordenador', 'admin'],
  excluir_projeto:     ['admin'],
  gerenciar_membros:   ['lider', 'coordenador', 'admin'],

  // Operações
  cumprir_requisito:   ['membro', 'lider', 'facilitador', 'coordenador', 'admin'],
  marcar_decisao:      ['lider', 'facilitador', 'coordenador', 'admin'],
  iniciar_reuniao:     ['lider', 'coordenador', 'admin'],
  finalizar_reuniao:   ['lider', 'coordenador', 'admin'],
  cobrar_membro:       ['lider', 'facilitador', 'coordenador', 'admin'],
  escalar_impedimento: ['lider', 'facilitador', 'coordenador', 'admin'],

  // Ajustes
  alterar_responsavel: ['lider', 'coordenador', 'admin'],
  alterar_prazo:       ['lider', 'coordenador', 'admin'],

  // Relatórios
  exportar_relatorio:  ['lider', 'facilitador', 'coordenador', 'admin'],
  ver_auditoria:       ['coordenador', 'admin'],

  // Admin
  resetar_dados:       ['admin'],
  desativar_usuario:   ['admin'],
  transferir_usuario:  ['admin'],
};

// ════════════════════════════════════
// GUARD FUNCTIONS
// ════════════════════════════════════

/**
 * Verifica se o perfil pode executar a ação.
 */
export function podeExecutar(perfil: Perfil | Perfil[], acao: AcaoProtegida): boolean {
  const perfis = Array.isArray(perfil) ? perfil : [perfil];
  const permitidos = PERMISSOES[acao];
  if (!permitidos) return false;
  return perfis.some((p) => permitidos.includes(p));
}

/**
 * Retorna lista de ações que o perfil pode executar.
 */
export function acoesPermitidas(perfil: Perfil | Perfil[]): AcaoProtegida[] {
  const perfis = Array.isArray(perfil) ? perfil : [perfil];
  return (Object.keys(PERMISSOES) as AcaoProtegida[]).filter((acao) =>
    perfis.some((p) => PERMISSOES[acao].includes(p)),
  );
}

/**
 * Determinar perfil efetivo de um usuário em relação a um projeto.
 *
 * Se o userId é o líder do projeto → 'lider'
 * Se é facilitador → 'facilitador'
 * Se é membro → 'membro'
 */
export function perfilNoProjeto(
  userId: string,
  projeto: {
    liderId: string;
    facilitadorId: string;
    membros: { id: string; papel: string }[];
  },
): Perfil {
  if (userId === projeto.liderId) return 'lider';
  if (userId === projeto.facilitadorId) return 'facilitador';
  const membro = projeto.membros.find((m) => m.id === userId);
  if (membro?.papel === 'lider') return 'lider';
  if (membro?.papel === 'facilitador') return 'facilitador';
  if (membro) return 'membro';
  return 'membro'; // default
}

/**
 * Guard que lança erro se ação não permitida.
 */
export function exigirPermissao(perfil: Perfil | Perfil[], acao: AcaoProtegida): void {
  if (!podeExecutar(perfil, acao)) {
    throw new Error(
      `Ação "${acao}" não permitida para perfil "${Array.isArray(perfil) ? perfil.join(', ') : perfil}".`,
    );
  }
}
