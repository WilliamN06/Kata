import type { DrillConfiguration, DrillState, TrialResult } from '../types.new';
import { updateStaircase, createStaircase } from './staircase.new';

export function createDrillState(config: DrillConfiguration, initialValue: number): DrillState {
  return { config, trialCount: 0, correctCount: 0, startTime: Date.now(), currentValue: initialValue, history: [], complete: false };
}

export function recordTrial(state: DrillState, result: TrialResult): DrillState {
  const next = { ...state };
  next.trialCount++;
  if (result.correct) next.correctCount++;
  next.history = [...next.history, result];
  const staircase = updateStaircase(createStaircase(next.currentValue), result.correct);
  next.currentValue = staircase.currentValue;
  const { taskConditions } = state.config;
  const targetReps = taskConditions.repetitions;
  const elapsed = (Date.now() - state.startTime) / 1000 / 60;
  const sessionMinutes = taskConditions.sessionLengthMinutes;
  const repsDone = targetReps === 'endless' ? false : next.trialCount >= targetReps;
  const timeDone = sessionMinutes === 'endless' ? false : elapsed >= sessionMinutes;
  if (repsDone || timeDone) next.complete = true;
  return next;
}
