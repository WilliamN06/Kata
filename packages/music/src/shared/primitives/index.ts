import type { DrillDefinition, TaskType, Variable } from '@kata/core';
import { PrimitiveDrill } from './PrimitiveDrill';
import { registerPrimitive, type PrimitiveModel } from './model';

export * from './audio';
export * from './model';
export { PrimitiveDrill } from './PrimitiveDrill';

const TASKS: TaskType[] = [
  'T1-categorisation',
  'T2-discrimination',
  'T3-estimation',
  'T4-matching',
  'T5-detection',
  'T6-ordering',
  'T7-identification',
];

export function primitiveDrills(variableId: string, defaultTrials = 20): Record<TaskType, DrillDefinition> {
  return Object.fromEntries(
    TASKS.map((t) => [t, { variableId: variableId as any, renderer: PrimitiveDrill, defaultTrials }])
  ) as Record<TaskType, DrillDefinition>;
}

/** Register every model and build the per-variable drill table. */
export function primitiveSubskillDrills(entries: Array<{ variable: Variable; model: PrimitiveModel }>) {
  for (const e of entries) registerPrimitive(e.variable.id, e.model);
  const byVariable = Object.fromEntries(entries.map((e) => [e.variable.id, primitiveDrills(e.variable.id)]));
  return { drills: primitiveDrills(entries[0]!.variable.id), drillsByVariable: byVariable };
}
