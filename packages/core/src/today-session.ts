import type { VariableState, DrillSettings, DrillSlot } from './types';

export function buildTodaySession(
  variables: VariableState[],
  _settings: DrillSettings,
  sessionLengthMinutes: number
): DrillSlot[] {
  const slots: DrillSlot[] = [];
  const maxDrills = Math.max(1, Math.floor(sessionLengthMinutes / 3));

  const weakest = findWeakest(variables);
  if (weakest) {
    slots.push({
      type: 'isolation',
      stateId: weakest.id,
      variableId: weakest.variableId,
      subskillId: weakest.subskillId,
      level: weakest.level,
      estimatedMinutes: 3,
      reason: `Weakest variable · accuracy ${Math.round(weakest.accuracy * 100)}%`,
    });
  }

  const secondWeakest = findSecondWeakest(variables, weakest?.id);
  if (secondWeakest && slots.length < maxDrills) {
    slots.push({
      type: 'isolation',
      stateId: secondWeakest.id,
      variableId: secondWeakest.variableId,
      subskillId: secondWeakest.subskillId,
      level: secondWeakest.level,
      estimatedMinutes: 3,
      reason: `Second weakest · accuracy ${Math.round(secondWeakest.accuracy * 100)}%`,
    });
  }

  const maintenance = findMaintenance(variables);
  if (maintenance && slots.length < maxDrills) {
    slots.push({
      type: 'maintenance',
      stateId: maintenance.id,
      variableId: maintenance.variableId,
      subskillId: maintenance.subskillId,
      level: maintenance.level,
      estimatedMinutes: 2,
      reason: `Maintenance · last practiced ${daysAgo(maintenance.lastPracticed)} days ago`,
    });
  }

  return slots.slice(0, maxDrills);
}

function findWeakest(variables: VariableState[]): VariableState | null {
  const eligible = variables.filter((v) => v.trialCount >= 5);
  const pool = eligible.length > 0 ? eligible : variables;
  if (pool.length === 0) return null;

  return [...pool].sort((a, b) => a.accuracy - b.accuracy)[0] ?? null;
}

function findSecondWeakest(
  variables: VariableState[],
  excludeId?: string
): VariableState | null {
  const pool = variables.filter((v) => v.id !== excludeId);
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) => a.accuracy - b.accuracy)[0] ?? null;
}

function findMaintenance(variables: VariableState[]): VariableState | null {
  const mastered = variables.filter((v) => v.accuracy >= 0.9);
  if (mastered.length === 0) return null;

  return [...mastered].sort((a, b) => {
    const aTime = a.lastPracticed ? new Date(a.lastPracticed).getTime() : 0;
    const bTime = b.lastPracticed ? new Date(b.lastPracticed).getTime() : 0;
    return aTime - bTime;
  })[0] ?? null;
}

function daysAgo(dateStr: string | null): number {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}