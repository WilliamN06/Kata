export type Domain = 'drawing' | 'music';

export type SubskillId =
  | 'drawing:p1-proportion'
  | 'drawing:p2-colour'
  | 'music:p1-pitch'
  | 'music:p2-dynamic'
  | 'music:p3-timbre'
  | 'music:p4-rhythm'
  | 'music:p5-spatial';

export type VariableId =
  | 'drawing:p1-proportion:V1'
  | 'drawing:p1-proportion:V2'
  | 'drawing:p2-colour:V1'
  | 'drawing:p2-colour:V2'
  | 'drawing:p2-colour:V3'
  | 'music:p1-pitch:V1'
  | 'music:p1-pitch:V2'
  | 'music:p1-pitch:V3'
  | 'music:p2-dynamic:V1'
  | 'music:p2-dynamic:V2'
  | 'music:p2-dynamic:V3'
  | 'music:p2-dynamic:V4'
  | 'music:p2-dynamic:V5'
  | 'music:p2-dynamic:V6'
  | 'music:p3-timbre:V1'
  | 'music:p3-timbre:V2'
  | 'music:p3-timbre:V3'
  | 'music:p3-timbre:V4'
  | 'music:p3-timbre:V5'
  | 'music:p3-timbre:V6'
  | 'music:p3-timbre:V7'
  | 'music:p3-timbre:V8'
  | 'music:p3-timbre:V9'
  | 'music:p3-timbre:V10'
  | 'music:p4-rhythm:V1'
  | 'music:p4-rhythm:V2'
  | 'music:p4-rhythm:V3'
  | 'music:p4-rhythm:V4'
  | 'music:p4-rhythm:V5'
  | 'music:p5-spatial:V1'
  | 'music:p5-spatial:V2';

export type TaskType =
  | 'T1-categorisation'
  | 'T2-discrimination'
  | 'T3-estimation'
  | 'T4-matching'
  | 'T5-detection'
  | 'T6-ordering'
  | 'T7-identification';

export interface Variable {
  id: VariableId;
  name: string;
  definition: string;
  unit: string;
  defaultValue: number;
  variableDimensions: VariableDimension[];
  stimulusParameters: StimulusParameter[];
  visualisation: VisualisationType;
}

export interface VariableDimension {
  id: string;
  label: string;
  kind: 'select' | 'range' | 'number' | 'text';
  options?: Array<{ value: string; label: string; group?: string }>;
  range?: { min: number; max: number; step: number; unit: string; extendable: boolean };
  defaultValue: number | string;
  appliesWhen?: { dimension: string; values: string[] };
  helpText?: string;
}

export interface StimulusParameter {
  id: string;
  label: string;
  kind: 'select' | 'range' | 'number' | 'text';
  options?: Array<{ value: string; label: string; group?: string }>;
  range?: { min: number; max: number; step: number; unit: string; extendable: boolean };
  defaultValue: number | string;
  helpText?: string;
}

export type VisualisationType =
  | 'none'
  | 'spectrum'
  | 'spectrum-spectrogram'
  | 'spectrum-waveform'
  | 'waveform'
  | 'waveform-envelope'
  | 'goniometer'
  | 'loudness-meter'
  | 'partial-grid'
  | 'phase-vector-plot'
  | 'roughness-envelope';

export interface TaskConditions {
  repetitions: number | 'endless';
  speedSeconds: number | 'untimed';
  interTrialIntervalSeconds: number;
  responseDeadlineSeconds: number | 'none';
  feedbackTiming: 'immediate' | 'delayed' | 'session-end';
  feedbackDelaySeconds: number;
  feedbackType: 'correct-incorrect' | 'specific-error' | 'timed';
  sessionLengthMinutes: number | 'endless';
  enableRatings: boolean;
  showVisualisation: boolean;
}

export interface DrillConfiguration {
  id: string;
  domain: Domain;
  subskillId: SubskillId;
  variableId: VariableId;
  taskType: TaskType;
  taskConditions: TaskConditions;
  variableParams: Record<string, string | number>;
  stimulusParams: Record<string, string | number>;
}

export interface PerceptualRating {
  brightness?: number;
  warmth?: number;
  harshness?: number;
  breathiness?: number;
  buzziness?: number;
  metallicity?: number;
  noisiness?: number;
}

export interface TrialResult {
  variableId: VariableId;
  taskType: TaskType;
  correct: boolean;
  responseTimeMs: number;
  userResponse: unknown;
  correctResponse: unknown;
  stimulusParams: Record<string, string | number>;
  variableParams: Record<string, string | number>;
  taskConditions: TaskConditions;
  rating?: PerceptualRating;
}

export interface DrillState {
  config: DrillConfiguration;
  trialCount: number;
  correctCount: number;
  startTime: number;
  currentValue: number;
  history: TrialResult[];
  complete: boolean;
}

export interface VariableState {
  variableId: VariableId;
  accuracy: number;
  threshold: number | null;
  trialCount: number;
  lastPracticed: string | null;
}

export interface ProgressSnapshot {
  byVariable: Record<string, VariableState>;
  byTaskType: Record<string, Record<TaskType, number>>;
  byCondition: Record<string, Record<string, number>>;
  byParameter: Record<string, Record<string, number>>;
  byStimulus: Record<string, Record<string, number>>;
  averageResponseTime: Record<string, number>;
  weaknessMap: VariableId[];
  strengthMap: VariableId[];
  dueForReview: VariableId[];
}

export interface Subskill {
  id: SubskillId;
  name: string;
  domain: Domain;
  definition: string;
  variables: VariableId[];
  drills: Record<TaskType, DrillDefinition>;
  drillsByVariable?: Record<string, Partial<Record<TaskType, DrillDefinition>>>;
  integrationGroups?: IntegrationGroup[];
}

export interface IntegrationGroup {
  id: string;
  name: string;
  variables: VariableId[];
}

export interface DrillDefinition {
  variableId: VariableId;
  renderer: unknown;
  defaultTrials: number;
  description?: string;
}

export interface DrillProps {
  /** Increments each trial — used as a key so drills remount fresh */
  trialKey?: number;
  variable: Variable;
  taskType: TaskType;
  taskConditions: TaskConditions;
  variableParams: Record<string, string | number>;
  stimulusParams: Record<string, string | number>;
  currentValue: number;
  onAnswer: (result: {
    correct: boolean;
    responseTimeMs: number;
    userResponse: unknown;
    correctResponse: unknown;
  }) => void;
  calibratedLStar?: (target: number) => number;
  audioContext?: AudioContext;
}



