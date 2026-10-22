import type { VariableId, VariableDimension } from '../types.new';
import { VARIABLE_REGISTRY } from '../variables/registry';

export function getVariableDimensions(variableId: VariableId): VariableDimension[] {
  return VARIABLE_REGISTRY[variableId]?.variableDimensions ?? [];
}

export function getDefaultVariableParams(variableId: VariableId): Record<string, string | number> {
  const dims = getVariableDimensions(variableId);
  const result: Record<string, string | number> = {};
  for (const dim of dims) result[dim.id] = dim.defaultValue;
  return result;
}
