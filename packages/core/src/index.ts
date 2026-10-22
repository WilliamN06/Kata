// Types
export * from './types.new';
export {
  VARIABLE_REGISTRY,
  registerVariable,
  registerVariables,
  getVariable,
  getAllVariables,
  getVariablesForSubskill,
} from './variables/registry';

// Engine
export { createStaircase, updateStaircase, computeThreshold } from './engine/staircase.new';
export type { StaircaseState } from './engine/staircase.new';
export { createDrillState, recordTrial } from './engine/drill-engine.new';
export { computeProgress } from './engine/progress.new';

// Settings
export {
  DEFAULT_TASK_CONDITIONS,
  REPETITION_PRESETS,
  SPEED_PRESETS,
  ITI_PRESETS,
  DEADLINE_PRESETS,
  SESSION_LENGTH_PRESETS,
} from './settings/task-conditions.new';
export { resolveSettings } from './settings/resolve.new';
