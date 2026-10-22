import type { TaskConditions } from '../types.new';

export const DEFAULT_TASK_CONDITIONS: TaskConditions = {
  repetitions: 20,
  speedSeconds: 'untimed',
  interTrialIntervalSeconds: 2,
  responseDeadlineSeconds: 'none',
  feedbackTiming: 'immediate',
  feedbackDelaySeconds: 0,
  feedbackType: 'specific-error',
  sessionLengthMinutes: 10,
  enableRatings: false,
  showVisualisation: false,
};

export const REPETITION_PRESETS = [5, 10, 20, 50, 100] as const;
export const SPEED_PRESETS = ['untimed', 5, 3, 2, 1, 0.5] as const;
export const ITI_PRESETS = [0.5, 1, 2, 5] as const;
export const DEADLINE_PRESETS = ['none', 10, 5, 3, 2, 1] as const;
export const SESSION_LENGTH_PRESETS = [5, 10, 20, 30] as const;


