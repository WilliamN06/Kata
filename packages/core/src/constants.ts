export const MASTERY = {
  L1A: 0.9,
  L1B: 0.85,
  L2A: 0.85,
  L2B: 0.85,
  L3A: 0.85,
  AUTO: 0.85,
} as const;

export const STAIRCASE = {
  INITIAL_DELTA: 25.0,
  MIN_DELTA: 0.5,
  MAX_DELTA: 50.0,
  HARDER_FACTOR: 0.85,
  EASIER_FACTOR: 1.6,
  STREAK_THRESHOLD: 2,
  TRIALS_PER_SESSION: 20,
  REVERSALS_FOR_THRESHOLD: 6,
} as const;

export const MANUAL_LEVELS = {
  easy: 10.0,
  medium: 5.0,
  hard: 2.0,
  expert: 1.0,
} as const;

export const SESSION_LENGTHS = [5, 10, 15, 20] as const;

export const TASK_CONDITIONS = [
  'none',
  'media',
  'time',
  'subject',
  'scale',
] as const;

export const BACKGROUND_CONDITIONS = [
  'none',
  'lighting',
  'background_value',
  'colour',
  'surface',
  'distance',
  'angle',
  'noise',
  'temperature',
  'time_of_day',
] as const;

export const DEFAULT_SETTINGS = {
  id: 'global',
  tier: 'global' as const,
  difficultyMode: 'auto' as const,
  range: 'moderate' as const,
  tolerance: 'moderate' as const,
  timed: false,
  secondsPerTrial: 15,
  interaction: 'independent' as const,
  variability: 'predictable' as const,
  conditions: '1' as const,
  taskCondition: 'none',
  backgroundCondition: 'none',
  trialsPerSession: 20,
  stepSizeMin: 1,
  stepSizeMax: 5,
  endless: false,
  streakThreshold: 5,
  answerDisplayDuration: 1500,
  showAngleLines: true,
  angleDisplayMode: 'line' as const,
  angleShowReference: true,
  angleReferenceType: 'vertical' as const,
  autoContinue: true,
  feedbackDurationMs: 1500,
} as const;