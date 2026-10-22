import type { Variable, VariableId } from '../types.new';

/**
 * Mutable variable registry.
 *
 * Subskills call `registerVariable()` at import time to populate this.
 * The app reads from it via `getVariable()` and `getAllVariables()`.
 */
export const VARIABLE_REGISTRY: Partial<Record<VariableId, Variable>> = {};

export function registerVariable(variable: Variable): void {
  VARIABLE_REGISTRY[variable.id] = variable;
}

export function registerVariables(variables: Variable[]): void {
  for (const v of variables) registerVariable(v);
}

export function getVariable(id: string): Variable | undefined {
  return VARIABLE_REGISTRY[id as VariableId];
}

export function getAllVariables(): Variable[] {
  return Object.values(VARIABLE_REGISTRY).filter(
    (v): v is Variable => v !== undefined
  );
}

export function getVariablesForSubskill(subskillId: string): Variable[] {
  return getAllVariables().filter((v) => v.id.startsWith(subskillId + ':'));
}
