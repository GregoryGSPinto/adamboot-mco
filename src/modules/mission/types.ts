export type MissionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface MissionItem {
  id: string;
  projectId: string;
  projectName: string;
  phaseNumber: number;
  phaseName: string;

  responsibleId: string;
  responsibleName: string;
  responsibleRole: 'LEADER' | 'MEMBER' | 'FACILITATOR';

  requirementCode: string;
  requirementDescription: string;

  message: string;
  priority: MissionPriority;

  dueDate?: string;
  daysLate?: number;
}

export interface MissionGroup {
  projectId: string;
  projectName: string;
  items: MissionItem[];

  /** Engine data for MissionProjectCard */
  phaseNumber: number;
  phaseName: string;
  totalPhases: number;
  daysRemaining: number;
  completedRequirements: number;
  totalRequirements: number;
  canAdvance: boolean;
  riskLevel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO' | 'EM_DIA';
  aiMessages: {
    text: string;
    urgency: 'info' | 'atencao' | 'urgente' | 'critico';
  }[];
}
