export interface ChatMessage {
  id: string;
  projectId: string;
  phaseNumber: number;
  authorName: string;
  text?: string;
  imageUrl?: string;
  createdAt: string;
  isDecision?: boolean;
  linkedRequirementCode?: string;
}
