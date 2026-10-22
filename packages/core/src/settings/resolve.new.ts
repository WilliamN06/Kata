import type { DrillConfiguration } from '../types.new';

export function resolveSettings(global: DrillConfiguration, subskill?: Partial<DrillConfiguration>, perDrill?: Partial<DrillConfiguration>): DrillConfiguration {
  return {
    ...global,
    ...(subskill ?? {}),
    ...(perDrill ?? {}),
    taskConditions: { ...global.taskConditions, ...(subskill?.taskConditions ?? {}), ...(perDrill?.taskConditions ?? {}) },
    variableParams: { ...global.variableParams, ...(subskill?.variableParams ?? {}), ...(perDrill?.variableParams ?? {}) },
    stimulusParams: { ...global.stimulusParams, ...(subskill?.stimulusParams ?? {}), ...(perDrill?.stimulusParams ?? {}) },
  };
}
