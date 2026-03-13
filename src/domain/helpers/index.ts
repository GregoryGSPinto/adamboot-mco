/**
 * Domain Helpers — Pure utility functions for the MCO platform.
 *
 * All functions are stateless, side-effect-free, and easily testable.
 */

/**
 * Formats an ISO date string to DD/MM/YYYY.
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats an ISO date string relative to today (PT-BR).
 * Returns 'Hoje', 'Ontem', or 'X dias atras'.
 */
export function formatDateRelative(iso: string): string {
  const target = new Date(iso);
  if (isNaN(target.getTime())) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays > 1) return `${diffDays} dias atrás`;

  // Future dates
  if (diffDays === -1) return 'Amanhã';
  return `em ${Math.abs(diffDays)} dias`;
}

/**
 * Calculates the percentage improvement between two KPI values.
 * Positive result means improvement (decrease in defects, etc.).
 * Returns 0 when before is 0 to avoid division by zero.
 */
export function calculateKPIImprovement(before: number, after: number): number {
  if (before === 0) return 0;
  return ((before - after) / Math.abs(before)) * 100;
}

/**
 * Truncates text to a maximum length, appending '...' when truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generates a project number in the format CCQ-YYYY-NNN.
 * @param dataInicio - ISO date string for the project start
 * @param sequencia - Sequential number within the year
 */
export function generateProjectNumber(dataInicio: string, sequencia: number): string {
  const d = new Date(dataInicio);
  const year = d.getFullYear();
  const seq = String(sequencia).padStart(3, '0');
  return `CCQ-${year}-${seq}`;
}
