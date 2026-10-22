import type { VariableState, DrillConfiguration, TrialResult } from '@kata/core';
import { getDatabase } from './database';

export async function getVariableState(variableId: string): Promise<VariableState | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM variable_state WHERE variable_id = ?', [variableId]);
  if (!row) return null;
  return { variableId: row.variable_id, accuracy: row.accuracy, threshold: row.threshold, trialCount: row.trial_count, lastPracticed: row.last_practiced };
}

export async function upsertVariableState(state: VariableState): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO variable_state (variable_id, accuracy, threshold, trial_count, last_practiced) VALUES (?, ?, ?, ?, ?)',
    [state.variableId, state.accuracy, state.threshold, state.trialCount, state.lastPracticed]
  );
}

export async function logTrial(result: TrialResult): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO trial_history (variable_id, task_type, stimulus_params, variable_params, task_conditions, correct, response_time_ms, user_response, correct_response, rating_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      result.variableId,
      result.taskType,
      JSON.stringify(result.stimulusParams),
      JSON.stringify(result.variableParams),
      JSON.stringify(result.taskConditions),
      result.correct ? 1 : 0,
      result.responseTimeMs,
      JSON.stringify(result.userResponse),
      JSON.stringify(result.correctResponse),
      result.rating ? JSON.stringify(result.rating) : null,
    ]
  );
}

export async function getDrillConfiguration(id: string): Promise<DrillConfiguration | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM drill_configurations WHERE id = ?', [id]);
  if (!row) return null;
  return {
    id: row.id,
    domain: 'drawing',
    subskillId: '' as any,
    variableId: '' as any,
    taskType: '' as any,
    taskConditions: JSON.parse(row.task_conditions),
    variableParams: JSON.parse(row.variable_params),
    stimulusParams: JSON.parse(row.stimulus_params),
  };
}

export async function saveDrillConfiguration(config: DrillConfiguration): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO drill_configurations (id, task_conditions, variable_params, stimulus_params, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
    [config.id, JSON.stringify(config.taskConditions), JSON.stringify(config.variableParams), JSON.stringify(config.stimulusParams)]
  );
}

export async function resetDrillConfiguration(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM drill_configurations WHERE id = ?', [id]);
}
