import type { VariableState, TrialResult, ProgressSnapshot } from '../types.new';

export function computeProgress(states: Record<string, VariableState>, trials: TrialResult[]): ProgressSnapshot {
  return {
    byVariable: states,
    byTaskType: {},
    byCondition: {},
    byParameter: {},
    byStimulus: {},
    averageResponseTime: {},
    weaknessMap: [],
    strengthMap: [],
    dueForReview: [],
  };
}
