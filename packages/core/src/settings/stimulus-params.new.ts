import type { VariableId, StimulusParameter } from '../types.new';
import { VARIABLE_REGISTRY } from '../variables/registry';

export function getStimulusParameters(variableId: VariableId): StimulusParameter[] {
  return VARIABLE_REGISTRY[variableId]?.stimulusParameters ?? [];
}

export function getDefaultStimulusParams(variableId: VariableId): Record<string, string | number> {
  const params = getStimulusParameters(variableId);
  const result: Record<string, string | number> = {};
  for (const p of params) result[p.id] = p.defaultValue;
  return result;
}
