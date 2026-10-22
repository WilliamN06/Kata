import { MASTERY } from './constants';
import type { UnlockState } from './types';

export function computeNewAccuracy(
  oldAccuracy: number,
  correct: boolean,
  alpha = 0.1
): number {
  return oldAccuracy * (1 - alpha) + (correct ? 1 : 0) * alpha;
}

export function checkGroupUnlock(
  variables: string[],
  accuracies: Record<string, number>
): boolean {
  return variables.every((v) => (accuracies[v] ?? 0) >= MASTERY.L1A);
}

export function checkConditionUnlock(unlocks: UnlockState): boolean {
  return unlocks.groupA && unlocks.groupB && unlocks.groupC;
}

export function getLevelForAccuracy(accuracy: number): number {
  if (accuracy >= MASTERY.AUTO) return 6;
  if (accuracy >= MASTERY.L3A) return 5;
  if (accuracy >= MASTERY.L2B) return 4;
  if (accuracy >= MASTERY.L2A) return 3;
  if (accuracy >= MASTERY.L1B) return 2;
  return 1;
}

export function getMasteryPercentage(accuracy: number, threshold: number): number {
  if (accuracy >= threshold) return 100;
  return Math.min(100, (accuracy / threshold) * 100);
}