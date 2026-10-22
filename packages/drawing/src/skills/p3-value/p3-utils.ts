/**
 * Format a ΔL* difference for feedback.
 */
export function formatDeltaL(delta: number): string {
  if (Math.abs(delta) < 0.5) return 'less than 0.5 ΔL*';
  return `${delta.toFixed(1)} ΔL*`;
}

/**
 * Format an L* value for feedback.
 */
export function formatL(lStar: number): string {
  return `L* ${lStar.toFixed(0)}`;
}

/**
 * Compare two L* values and describe the difference.
 */
export function describeDifference(a: number, b: number): string {
  const diff = Math.abs(a - b);
  if (diff < 1) return 'imperceptibly different';
  if (diff < 5) return `differed by ${diff.toFixed(1)} ΔL*`;
  if (diff < 15) return `clearly different: ${diff.toFixed(0)} ΔL* apart`;
  return `very different: ${diff.toFixed(0)} ΔL* apart`;
}