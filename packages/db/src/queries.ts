import { getAdapter } from './database';
import type {
  VariableState,
  DrillConfiguration,
  TrialResult,
} from '@kata/core';

// ---------- VARIABLE STATE ----------

export async function getVariableState(variableId: string): Promise<VariableState | null> {
  const db = getAdapter();
  const rows = await db.query<{
    variable_id: string;
    accuracy: number;
    threshold: number | null;
    trial_count: number;
    last_practiced: string | null;
    thresholds_json?: string | null;
  }>('SELECT * FROM variable_state WHERE variable_id = ?', [variableId]);
  const row = rows[0];
  if (!row) return null;
  return toState(row);
}

export async function getAllVariableStates(): Promise<VariableState[]> {
  const db = getAdapter();
  const rows = await db.query<{
    variable_id: string;
    accuracy: number;
    threshold: number | null;
    trial_count: number;
    last_practiced: string | null;
    thresholds_json?: string | null;
  }>('SELECT * FROM variable_state');
  return rows.map(toState);
}

function toState(r: {
  variable_id: string;
  accuracy: number;
  threshold: number | null;
  trial_count: number;
  last_practiced: string | null;
  thresholds_json?: string | null;
}): VariableState {
  let thresholds: VariableState['thresholds'];
  try {
    thresholds = r.thresholds_json ? JSON.parse(r.thresholds_json) : undefined;
  } catch {
    thresholds = undefined;
  }
  return {
    variableId: r.variable_id as any,
    accuracy: r.accuracy,
    threshold: r.threshold,
    trialCount: r.trial_count,
    lastPracticed: r.last_practiced,
    thresholds,
  };
}

export async function upsertVariableState(state: VariableState): Promise<void> {
  const db = getAdapter();
  await db.run(
    `INSERT OR REPLACE INTO variable_state
      (variable_id, accuracy, threshold, trial_count, last_practiced, thresholds_json)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      state.variableId,
      state.accuracy,
      state.threshold,
      state.trialCount,
      state.lastPracticed,
      state.thresholds ? JSON.stringify(state.thresholds) : null,
    ]
  );
}

// ---------- TRIAL LOGGING ----------

export async function logTrial(result: TrialResult): Promise<void> {
  const db = getAdapter();
  await db.run(
    `INSERT INTO trial_history
      (variable_id, task_type, stimulus_params, variable_params, task_conditions,
       correct, response_time_ms, user_response, correct_response, rating_json,
       delta, session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      result.variableId,
      result.taskType,
      JSON.stringify(result.stimulusParams),
      JSON.stringify(result.variableParams),
      JSON.stringify(result.taskConditions),
      result.correct ? 1 : 0,
      result.responseTimeMs,
      JSON.stringify(result.userResponse ?? null),
      JSON.stringify(result.correctResponse ?? null),
      result.rating ? JSON.stringify(result.rating) : null,
      result.delta ?? null,
      result.sessionId ?? null,
    ]
  );

  // Update variable state (moving average accuracy)
  const existing = await getVariableState(result.variableId);
  const trialCount = (existing?.trialCount ?? 0) + 1;
  const correctCount = existing
    ? Math.round(existing.accuracy * existing.trialCount) + (result.correct ? 1 : 0)
    : result.correct ? 1 : 0;
  const accuracy = correctCount / trialCount;

  // Per-task threshold: latest value, and one history entry per session.
  const thresholds = { ...(existing?.thresholds ?? {}) };
  const now = new Date().toISOString();
  if (result.threshold != null && Number.isFinite(result.threshold)) {
    const rec = thresholds[result.taskType] ?? { latest: result.threshold, history: [] };
    const history = [...rec.history];
    const last = history[history.length - 1];
    const sessionId = result.sessionId ?? now;
    if (last && last.sessionId === sessionId) history[history.length - 1] = { sessionId, value: result.threshold, at: now };
    else history.push({ sessionId, value: result.threshold, at: now });
    thresholds[result.taskType] = { latest: result.threshold, history: history.slice(-100) };
  }

  await upsertVariableState({
    variableId: result.variableId,
    accuracy,
    threshold: thresholds['T2-discrimination']?.latest ?? existing?.threshold ?? null,
    trialCount,
    lastPracticed: now,
    thresholds,
  });
}

// ---------- DRILL CONFIGURATION ----------

export async function getDrillConfig(id: string): Promise<DrillConfiguration | null> {
  const db = getAdapter();
  const rows = await db.query<{
    id: string;
    task_conditions: string;
    variable_params: string;
    stimulus_params: string;
  }>('SELECT * FROM drill_configurations WHERE id = ?', [id]);
  const row = rows[0];
  if (!row) return null;

  const [domain, subskillId, variableId, taskType] = row.id.split(':');

  return {
    id: row.id,
    domain: domain as any,
    subskillId: subskillId as any,
    variableId: variableId as any,
    taskType: taskType as any,
    taskConditions: JSON.parse(row.task_conditions),
    variableParams: JSON.parse(row.variable_params),
    stimulusParams: JSON.parse(row.stimulus_params),
  };
}

export async function saveDrillConfig(config: DrillConfiguration): Promise<void> {
  const db = getAdapter();
  await db.run(
    `INSERT OR REPLACE INTO drill_configurations
      (id, task_conditions, variable_params, stimulus_params, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))`,
    [
      config.id,
      JSON.stringify(config.taskConditions),
      JSON.stringify(config.variableParams),
      JSON.stringify(config.stimulusParams),
    ]
  );
}

export async function resetDrillConfig(id: string): Promise<void> {
  const db = getAdapter();
  await db.run('DELETE FROM drill_configurations WHERE id = ?', [id]);
}
