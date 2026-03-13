/**
 * Step Progression Validation — Pure functions for phase gate logic.
 *
 * No side effects. No dependencies on state or UI.
 * Used by both the engine and the presentation layer.
 */

/**
 * Determines if a project can advance to the next MASP phase.
 * All required requirements for the current phase must be completed.
 */
export function canAdvanceStep(
  currentPhase: number,
  completedRequirements: number,
  totalRequired: number
): boolean {
  if (totalRequired <= 0) return false;
  if (currentPhase < 1 || currentPhase > 8) return false;
  return completedRequirements >= totalRequired;
}

/**
 * Calculates the completion percentage of a step.
 * Returns 0 when total is 0 (avoids division by zero).
 */
export function getStepCompletionPercentage(completed: number, total: number): number {
  if (total <= 0) return 0;
  const pct = (completed / total) * 100;
  return Math.min(Math.round(pct), 100);
}

/**
 * Checks whether a project is past its presentation deadline.
 */
export function isProjectOverdue(dataApresentacao: string): boolean {
  const deadline = new Date(dataApresentacao);
  const today = new Date();
  // Compare dates only (ignore time)
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  return today > deadline;
}

/**
 * Returns the number of calendar days remaining until the presentation date.
 * Negative values indicate overdue days.
 */
export function getDaysRemaining(dataApresentacao: string): number {
  const deadline = new Date(dataApresentacao);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diffMs = deadline.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
