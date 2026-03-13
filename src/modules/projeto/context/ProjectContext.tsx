import { createContext, useContext, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useProjeto } from '@modules/projeto';
import { statusToGroup } from '@modules/mission';
import { subscribeDomainEvents } from '@modules/core/domainEvents';
import type { StatusProjeto } from '@shared/engine';
import type { MissionGroup } from '@modules/mission';

/**
 * PROJETO CONTEXT — fonte única da verdade.
 *
 * Regra de ouro do sistema:
 *   O domínio nunca sabe da tela.
 *   Todas as abas são VISÕES do mesmo agregado.
 *
 * Carrega o projeto UMA VEZ. Deriva tudo dele.
 * Se amanhã a Vale mudar de 8 para 10 fases,
 * mexe em 1 arquivo (requisitos-masp.ts) e pronto.
 *
 * Teste: quantos arquivos precisa alterar?
 * Resposta correta: 1.
 */

interface ProjectContextValue {
  /** StatusProjeto completo — a verdade */
  status: StatusProjeto;
  /** MissionGroup derivado do mesmo status (sem re-fetch) */
  missionGroup: MissionGroup;
  /** ID do projeto */
  projectId: string;
  /** Forçar recarga */
  reload: () => void;
  /** Loading state */
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

// ════════════════════════════════════
// PROVIDER
// ════════════════════════════════════

interface ProviderProps {
  projectId: string;
  children: ReactNode;
}

export function ProjectProvider({ projectId, children }: ProviderProps) {
  const { data: status, isLoading, isError, refetch } = useProjeto(projectId);

  const reload = useCallback(() => {
    refetch();
  }, [refetch]);

  // ═══ DOMAIN EVENTS — o projeto vira objeto vivo ═══
  // Qualquer ação em qualquer aba dispara evento →
  // provider recarrega → todas as views atualizam.
  useEffect(() => {
    const unsub = subscribeDomainEvents(event => {
      if (event.projectId === projectId) {
        refetch();
      }
    });
    return unsub;
  }, [projectId, refetch]);

  // Loading
  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div style={pulseStyle} />
        Carregando projeto...
      </div>
    );
  }

  // Erro
  if (isError || !status) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Projeto não encontrado.</div>
    );
  }

  // Derivar MissionGroup do mesmo StatusProjeto (sem fetch separado)
  const missionGroup = statusToGroup(status);

  const value: ProjectContextValue = {
    status,
    missionGroup,
    projectId,
    reload,
    isLoading,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

// ════════════════════════════════════
// HOOK
// ════════════════════════════════════

/**
 * useProjectContext — acessa o agregado Projeto.
 *
 * Regra: nenhuma view dentro do workspace pode chamar
 * useProjeto() ou useMission() diretamente.
 * Tudo passa por aqui.
 */
export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error(
      'useProjectContext() chamado fora do ProjectProvider. ' +
        'Envolva o componente em <ProjectProvider projectId="...">'
    );
  }
  return ctx;
}

// ════════════════════════════════════
// STYLES (loading/error states)
// ════════════════════════════════════

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '2rem',
  color: 'var(--text-muted)',
};

const pulseStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: 'var(--btn-primary-bg)',
  animation: 'pulse-step 1s ease-in-out infinite',
};
