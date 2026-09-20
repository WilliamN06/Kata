export type Domain = 'drawing' | 'music';
export type Layer = 'perception' | 'representation' | 'decision';
export type Level = '1A' | '1B' | '2A' | '2B' | '3A' | 'auto';
export type DifficultyMode = 'auto' | 'manual';

export interface Variable {
  id: string;
  name: string;
  definition: string;
  unit: string;
  lowerIsBetter: boolean;
  normativeRange: { lower: number; upper: number };
}

export interface VariableState {
  id: string;
  domain: Domain;
  subskillId: string;
  variableId: string;
  level: Level;
  accuracy: number;
  threshold: number | null;
  trialCount: number;
  lastPracticed: string | null;
  unlockedAt: string | null;
}

export interface DrillSettings {
  id: string;
  tier: 'global' | 'subskill' | 'drill';
  difficultyMode: DifficultyMode;
  range: 'narrow' | 'moderate' | 'wide';
  tolerance: 'loose' | 'moderate' | 'tight';
  timed?: boolean;
  secondsPerTrial?: number;
  interaction: 'independent' | 'sequential' | 'simultaneous';
  variability: 'predictable' | 'semi' | 'unpredictable';
  conditions: '1' | '3' | '6+';
  taskCondition: string;
  backgroundCondition: string;
  trialsPerSession: number;
  stepSizeMin?: number;
  stepSizeMax?: number;
  endless?: boolean;
  streakThreshold?: number;
  answerDisplayDuration?: number;
  showAngleLines?: boolean;
  angleDisplayMode?: 'line' | 'line-with-dots' | 'dots-only' | 'line-with-ticks';
  angleShowReference?: boolean;
  angleReferenceType?: 'horizontal' | 'vertical' | 'none';
  angleSet?: string;
  angleMin?: number;
  angleMax?: number;
  includeReflex?: boolean;
  showAnnotation?: boolean;
  magnitudeTolerance?: string | number;
  magnitudeDirection?: string;
  ratioRange?: string;
  orientation?: string;
  unitSize?: string;
  distanceRange?: string;
  memorizeDuration?: number;
  delayRange?: string;
  contextType?: string;
  contextDensity?: string;
  scaleRange?: string;
  axis?: string;
  asymmetryRange?: string;
  autoContinue?: boolean;
  feedbackDurationMs?: number;
  variableParams?: Record<string, string | number>;
  perSubskill?: Record<string, Partial<DrillSettings>>;
  perDrill?: Record<string, Partial<DrillSettings>>;
}

export interface TrialResult {
  stateId: string;
  level: Level;
  groupId?: string;
  taskCondition?: string;
  backgroundCondition?: string;
  correct: boolean;
  deltaValue: number;
  responseTimeMs: number;
}

export interface UnlockState {
  groupA: boolean;
  groupB: boolean;
  groupC: boolean;
  taskConditions: boolean;
  backgroundConditions: boolean;
  level3A: boolean;
  automaticity: boolean;
}

export interface CalibrationData {
  gamma: number;
  blackPoint: number;
  whitePoint: number;
  date: string;
}

export interface StaircaseState {
  currentDelta: number;
  correctStreak: number;
  reversals: number[];
  lastDirection: 'up' | 'down' | null;
  trialCount: number;
  history: { delta: number; correct: boolean }[];
  minDelta?: number;
  maxDelta?: number;
}

export interface DrillProps {
  variable: Variable;
  delta: number;
  onAnswer: (correct: boolean, responseTimeMs: number) => void;
  calibratedLStar: (target: number) => number;
  settings?: Partial<DrillSettings>;
  stimulus?: StimulusParameters;
  task: TaskParameters;
  /** User-selected variable parameters for this drill. */
  variableParams?: Record<string, string | number>;
}

export interface StimulusParameters {
  texture: string;
  colour: string;
  backgroundValue: string;
  backgroundColour: string;
  backgroundComplexity: string;
  contrast: string;
  lightingDirection: string;
  lightingIntensity: string;
  lightingColour: string;
  viewingDistance: string;
  viewingAngle: string;
  surfaceOrientation: string;
  surfaceTexture: string;
  surfaceColour: string;
  ambientNoise: string;
  temperature: string;
  timeOfDay: string;
}

export interface TaskParameters {
  timed?: boolean;
  secondsPerTrial?: number;
  endless?: boolean;
  repetitions?: number;
  autoContinue?: boolean;
  feedbackDurationMs?: number;
  feedbackDelay?: 'immediate' | 'short' | 'long';
  feedbackType?: 'visual' | 'verbal' | 'numerical';
  tolerance?: 'loose' | 'moderate' | 'tight';
  distraction?: 'none' | 'background' | 'dual';
  fatigue?: 'fresh' | 'moderate' | 'high';
  complexity?: '1' | '2-3' | '4+';
  interaction?: 'independent' | 'sequential' | 'simultaneous';
  variability?: 'predictable' | 'semi' | 'unpredictable';
  conditions?: '1' | '3' | '6+';
}

export interface DrillDefinition {
  variableId: string;
  renderer: React.ComponentType<DrillProps>;
  defaultTrials: number;
  description: string;
  variableParams?: VariableParameters;
}

/** A user-adjustable control for one drill dimension. */
export interface VariableDimension {
  id: string;
  label: string;
  description?: string;
  kind: 'select' | 'range' | 'toggle';
  options?: Array<{ value: string | number; label: string }>;
  defaultValue?: string | number | boolean;
  range?: { min: number; max: number; step: number; unit?: string };
}

/** Metadata describing the variable parameters a drill exposes. */
export interface VariableParameters {
  variableId: string;
  summary: string;
  dimensions: VariableDimension[];
}

export interface IntegrationGroup {
  id: string;
  variables: string[];
  name: string;
}

export interface Subskill {
  id: string;
  name: string;
  domain: Domain;
  layer: Layer;
  definition: string;
  variables: Variable[];
  drills: Record<string, DrillDefinition>;
  integrationGroups?: IntegrationGroup[];
}

export interface SkillDomain {
  id: Domain;
  name: string;
  subskills: Subskill[];
  integrationGroups: IntegrationGroup[];
}

export interface DrillSlot {
  type: 'isolation' | 'integration' | 'condition' | 'maintenance';
  stateId: string;
  variableId: string;
  subskillId: string;
  level: Level;
  estimatedMinutes: number;
  reason: string;
}