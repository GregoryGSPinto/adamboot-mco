export interface Evidence {
  id: string;
  projectId: string;
  phaseNumber: number;
  title: string;
  fileUrl: string;
  type: 'PHOTO' | 'DOCUMENT';
}
