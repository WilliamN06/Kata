import type { TaskType, Variable, VariableState } from '@kata/core';
import { getPrimitive } from '@kata/music';
import { MUSIC_SUBSKILLS, getVariable } from './registry';

/**
 * Mastery path per variable:
 *   1. discrimination  — can you hear the difference?
 *   2. identification  — can you name which value it was?
 *   3. estimation      — can you produce the number unaided?
 *   4. matching        — can you reproduce it?
 * A stage is passed when its latest staircase threshold is at or below the
 * variable's target × the stage multiplier (later stages are naturally harder).
 * Transfer comes next: repeat with relative mode or wider randomisation.
 */
export const STAGES: Array<{ task: TaskType; label: string; multiplier: number }> = [
  { task: 'T2-discrimination', label: 'Discrimination', multiplier: 1 },
  { task: 'T7-identification', label: 'Identification', multiplier: 2 },
  { task: 'T3-estimation', label: 'Estimation', multiplier: 3 },
  { task: 'T4-matching', label: 'Matching', multiplier: 2 },
];

export interface MasteryStatus {
  variable: Variable;
  subskillId: string;
  target: number;
  unit: string;
  /** Index into STAGES of the first unpassed stage; STAGES.length when mastered. */
  stage: number;
  /** Latest threshold for the current stage, if any. */
  current: number | null;
  /** current ÷ stage target. ∞ when not practised yet. */
  gap: number;
  lastPracticed: string | null;
}

export function masteryFor(variableId: string, state: VariableState | undefined): MasteryStatus | null {
  const model = getPrimitive(variableId);
  const variable = getVariable(variableId);
  if (!model || !variable) return null;
  const unit = model.scale === 'ratio' ? '%' : model.unit;
  let stage = 0;
  for (; stage < STAGES.length; stage++) {
    const s = STAGES[stage]!;
    const latest = state?.thresholds?.[s.task]?.latest;
    if (latest == null || latest > model.target * s.multiplier) break;
  }
  const s = STAGES[stage];
  const current = s ? state?.thresholds?.[s.task]?.latest ?? null : null;
  return {
    variable,
    subskillId: variableId.split(':').slice(0, 2).join(':'),
    target: model.target,
    unit,
    stage,
    current,
    gap: s ? (current == null ? Infinity : current / (model.target * s.multiplier)) : 0,
    lastPracticed: state?.lastPracticed ?? null,
  };
}

export function allMastery(states: Record<string, VariableState>): MasteryStatus[] {
  const out: MasteryStatus[] = [];
  for (const sub of MUSIC_SUBSKILLS) {
    for (const id of sub.variables) {
      const m = masteryFor(id as string, states[id as string]);
      if (m) out.push(m);
    }
  }
  return out;
}

/**
 * Today's Session: the variables furthest from their target, least-recently
 * practised first among ties. Mastered variables are skipped.
 */
export function todaysSession(states: Record<string, VariableState>, count = 3): MasteryStatus[] {
  const time = (s: MasteryStatus) => (s.lastPracticed ? new Date(s.lastPracticed).getTime() : 0);
  return allMastery(states)
    .filter((m) => m.stage < STAGES.length)
    .sort((a, b) => {
      // Practised-but-far beats never-practised only when gaps are finite; ∞ ties fall to recency.
      if (a.gap !== b.gap) return b.gap - a.gap;
      return time(a) - time(b);
    })
    .slice(0, count);
}

export function formatThreshold(v: number | null, unit: string): string {
  if (v == null) return '—';
  return `${v < 10 ? v.toFixed(1) : Math.round(v)}${unit === '%' ? '%' : ` ${unit}`}`;
}
