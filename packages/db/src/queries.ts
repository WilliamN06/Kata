import type {
  VariableState,
  DrillSettings,
  CalibrationData,
  UnlockState,
  TrialResult,
  Level,
} from '@kata/core';
import { DEFAULT_SETTINGS } from '@kata/core';
import { getAdapter } from './index';
import { isCalibrationValid } from '@kata/rendering';

export async function getGlobalSettings(): Promise<DrillSettings> {
  const adapter = getAdapter();
  const rows = await adapter.query<{
    id: string;
    tier: string;
    difficulty_mode: string;
    range: string;
    tolerance: string;
    timed: number;
    seconds_per_trial: number;
    interaction: string;
    variability: string;
    conditions: string;
    task_condition: string;
    background_condition: string;
    trials_per_session: number;
    step_size_min: number | null;
    step_size_max: number | null;
    endless: number;
    streak_threshold: number | null;
    answer_display_duration: number | null;
    auto_continue: number;
    feedback_duration_ms: number | null;
  }>("SELECT * FROM drill_settings WHERE id = 'global'");

  const row = rows[0];
  if (!row) return { ...DEFAULT_SETTINGS };

  return {
    id: row.id,
    tier: row.tier as DrillSettings['tier'],
    difficultyMode: row.difficulty_mode as DrillSettings['difficultyMode'],
    range: row.range as DrillSettings['range'],
    tolerance: row.tolerance as DrillSettings['tolerance'],
    timed: Boolean(row.timed),
    secondsPerTrial: row.seconds_per_trial,
    interaction: row.interaction as DrillSettings['interaction'],
    variability: row.variability as DrillSettings['variability'],
    conditions: row.conditions as DrillSettings['conditions'],
    taskCondition: row.task_condition,
    backgroundCondition: row.background_condition,
    trialsPerSession: row.trials_per_session,
    stepSizeMin: row.step_size_min ?? undefined,
    stepSizeMax: row.step_size_max ?? undefined,
    endless: Boolean(row.endless),
    streakThreshold: row.streak_threshold ?? undefined,
    answerDisplayDuration: row.answer_display_duration ?? undefined,
    autoContinue: Boolean(row.auto_continue),
    feedbackDurationMs: row.feedback_duration_ms ?? undefined,
  };
}

export async function saveSettings(settings: DrillSettings): Promise<void> {
  const adapter = getAdapter();
  await adapter.exec(
    `INSERT OR REPLACE INTO drill_settings
      (id, tier, difficulty_mode, range, tolerance, timed, seconds_per_trial,
       interaction, variability, conditions, task_condition,
       background_condition, trials_per_session,
       step_size_min, step_size_max, endless,
       streak_threshold, answer_display_duration,
       auto_continue, feedback_duration_ms, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      settings.id,
      settings.tier,
      settings.difficultyMode,
      settings.range,
      settings.tolerance,
      settings.timed ? 1 : 0,
      settings.secondsPerTrial ?? 15,
      settings.interaction,
      settings.variability,
      settings.conditions,
      settings.taskCondition,
      settings.backgroundCondition,
      settings.trialsPerSession,
      settings.stepSizeMin ?? null,
      settings.stepSizeMax ?? null,
      settings.endless ? 1 : 0,
      settings.streakThreshold ?? null,
      settings.answerDisplayDuration ?? null,
      settings.autoContinue ? 1 : 0,
      settings.feedbackDurationMs ?? null,
    ]
  );
}

export async function getCalibration(): Promise<CalibrationData | null> {
  const adapter = getAdapter();
  const rows = await adapter.query<{
    calibration_gamma: number;
    calibration_black: number;
    calibration_white: number;
    calibration_date: string | null;
  }>(
    'SELECT calibration_gamma, calibration_black, calibration_white, calibration_date FROM user_profile WHERE id = 1'
  );

  const row = rows[0];
  if (!row?.calibration_date) return null;

  const calibration = {
    gamma: row.calibration_gamma,
    blackPoint: row.calibration_black,
    whitePoint: row.calibration_white,
    date: row.calibration_date,
  };

  if (!isCalibrationValid(calibration)) {
    return null;
  }

  return calibration;
}

export async function saveCalibration(cal: CalibrationData): Promise<void> {
  const adapter = getAdapter();
  await adapter.exec(
    `UPDATE user_profile SET
      calibration_gamma = ?,
      calibration_black = ?,
      calibration_white = ?,
      calibration_date = datetime('now')
    WHERE id = 1`,
    [cal.gamma, cal.blackPoint, cal.whitePoint]
  );
}

export async function getAllVariableStates(): Promise<VariableState[]> {
  const adapter = getAdapter();
  const rows = await adapter.query<{
    id: string;
    domain: string;
    subskill_id: string;
    variable_id: string;
    level: string;
    accuracy: number;
    threshold: number | null;
    trial_count: number;
    last_practiced: string | null;
    unlocked_at: string | null;
  }>('SELECT * FROM variable_state ORDER BY subskill_id, variable_id');

  return rows.map((r) => ({
    id: r.id,
    domain: r.domain as VariableState['domain'],
    subskillId: r.subskill_id,
    variableId: r.variable_id,
    level: r.level as Level,
    accuracy: r.accuracy,
    threshold: r.threshold,
    trialCount: r.trial_count,
    lastPracticed: r.last_practiced,
    unlockedAt: r.unlocked_at,
  }));
}

export async function ensureVariableState(
  id: string,
  domain: string,
  subskillId: string,
  variableId: string
): Promise<void> {
  const adapter = getAdapter();
  await adapter.exec(
    `INSERT OR IGNORE INTO variable_state (id, domain, subskill_id, variable_id)
     VALUES (?, ?, ?, ?)`,
    [id, domain, subskillId, variableId]
  );
}

export async function updateVariableState(
  id: string,
  updates: Partial<VariableState>
): Promise<void> {
  const adapter = getAdapter();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.accuracy !== undefined) {
    fields.push('accuracy = ?');
    values.push(updates.accuracy);
  }
  if (updates.threshold !== undefined) {
    fields.push('threshold = ?');
    values.push(updates.threshold);
  }
  if (updates.trialCount !== undefined) {
    fields.push('trial_count = ?');
    values.push(updates.trialCount);
  }
  if (updates.lastPracticed !== undefined) {
    fields.push('last_practiced = ?');
    values.push(updates.lastPracticed);
  }
  if (updates.level !== undefined) {
    fields.push('level = ?');
    values.push(updates.level);
  }

  if (fields.length === 0) return;
  values.push(id);

  await adapter.exec(
    `UPDATE variable_state SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function logTrial(result: TrialResult, sessionId: string): Promise<void> {
  const adapter = getAdapter();
  await adapter.exec(
    `INSERT INTO trial_history
      (state_id, level, group_id, task_condition, background_condition,
       delta_value, correct, response_time_ms, session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      result.stateId,
      result.level,
      result.groupId ?? null,
      result.taskCondition ?? null,
      result.backgroundCondition ?? null,
      result.deltaValue,
      result.correct ? 1 : 0,
      result.responseTimeMs,
      sessionId,
    ]
  );
}

export async function getRecentTrials(limit = 50): Promise<
  {
    id: number;
    state_id: string;
    delta_value: number;
    correct: number;
    created_at: string;
  }[]
> {
  const adapter = getAdapter();
  return adapter.query(
    `SELECT id, state_id, delta_value, correct, created_at
     FROM trial_history
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit]
  );
}

export async function getUnlockState(): Promise<UnlockState> {
  const adapter = getAdapter();
  const rows = await adapter.query<{ key: string; unlocked: number }>(
    'SELECT key, unlocked FROM unlock_state'
  );

  const map: Record<string, boolean> = {};
  for (const r of rows) map[r.key] = r.unlocked === 1;

  return {
    groupA: map['group_A'] ?? false,
    groupB: map['group_B'] ?? false,
    groupC: map['group_C'] ?? false,
    taskConditions: map['taskConditions'] ?? false,
    backgroundConditions: map['backgroundConditions'] ?? false,
    level3A: map['level3A'] ?? false,
    automaticity: map['automaticity'] ?? false,
  };
}

export async function unlock(key: string): Promise<void> {
  const adapter = getAdapter();
  await adapter.exec(
    `UPDATE unlock_state SET unlocked = 1, unlocked_at = datetime('now') WHERE key = ?`,
    [key]
  );
}

export async function saveSessionSummary(summary: {
  id: string;
  type: 'adaptive' | 'freeplay';
  startedAt: string;
  endedAt: string;
  drillCount: number;
  accuracy: number;
  drills: string[];
}): Promise<void> {
  const adapter = getAdapter();
  await adapter.exec(
    `INSERT OR REPLACE INTO session_summary
      (id, type, started_at, ended_at, drill_count, accuracy, drills)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      summary.id,
      summary.type,
      summary.startedAt,
      summary.endedAt,
      summary.drillCount,
      summary.accuracy,
      JSON.stringify(summary.drills),
    ]
  );
}

// ============================================================
// Drill Configurations (per-drill settings persistence)
// ============================================================

export interface DrillConfiguration {
  id: string;
  tier: 'global' | 'subskill' | 'drill';
  difficultyMode: 'auto' | 'manual';
  manualDelta: number;
  variable: Record<string, string | number>;
  stimulus: {
    texture: string;
    colour: string;
    backgroundValue: string;
    backgroundColour: string;
    backgroundComplexity: string;
    contrast: string;
    lightingDirection: string;
    lightingIntensity: string;
    lightingColour: string;
    viewingDistance: string;
    viewingAngle: string;
    surfaceOrientation: string;
    surfaceTexture: string;
    surfaceColour: string;
    ambientNoise: string;
    temperature: string;
    timeOfDay: string;
  };
  task: {
    timed: boolean;
    secondsPerTrial: number;
    endless: boolean;
    repetitions: number;
    streakThreshold: number | null;
    autoContinue: boolean;
    feedbackDurationMs: number;
    feedbackDelay: 'immediate' | 'short' | 'long';
    feedbackType: 'visual' | 'verbal' | 'numerical';
    tolerance: 'loose' | 'moderate' | 'tight';
    distraction: 'none' | 'background' | 'dual';
    fatigue: 'fresh' | 'moderate' | 'high';
    complexity: '1' | '2-3' | '4+';
    interaction: 'independent' | 'sequential' | 'simultaneous';
    variability: 'predictable' | 'semi' | 'unpredictable';
    conditions: '1' | '3' | '6+';
  };
}

export async function getDrillConfiguration(id: string): Promise<DrillConfiguration | null> {
  const adapter = getAdapter();
  const rows = await adapter.query<any>('SELECT * FROM drill_configurations WHERE id = ?', [id]);
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    tier: row.tier,
    difficultyMode: row.difficulty_mode,
    manualDelta: row.manual_delta,
    variable: JSON.parse(row.variable_params ?? '{}'),
    stimulus: {
      texture: row.stimulus_texture,
      colour: row.stimulus_colour,
      backgroundValue: row.stimulus_background_value,
      backgroundColour: row.stimulus_background_colour,
      backgroundComplexity: row.stimulus_background_complexity,
      contrast: row.stimulus_contrast,
      lightingDirection: row.stimulus_lighting_direction,
      lightingIntensity: row.stimulus_lighting_intensity,
      lightingColour: row.stimulus_lighting_colour,
      viewingDistance: row.stimulus_viewing_distance,
      viewingAngle: row.stimulus_viewing_angle,
      surfaceOrientation: row.stimulus_surface_orientation,
      surfaceTexture: row.stimulus_surface_texture,
      surfaceColour: row.stimulus_surface_colour,
      ambientNoise: row.stimulus_ambient_noise,
      temperature: row.stimulus_temperature,
      timeOfDay: row.stimulus_time_of_day,
    },
    task: {
      timed: row.task_timed === 1,
      secondsPerTrial: row.task_seconds_per_trial,
      endless: row.task_endless === 1,
      repetitions: row.task_repetitions,
      streakThreshold: row.task_streak_threshold ?? null,
      autoContinue: row.task_auto_continue === 1,
      feedbackDurationMs: row.task_feedback_duration_ms,
      feedbackDelay: row.task_feedback_delay,
      feedbackType: row.task_feedback_type,
      tolerance: row.task_tolerance,
      distraction: row.task_distraction,
      fatigue: row.task_fatigue,
      complexity: row.task_complexity,
      interaction: row.task_interaction,
      variability: row.task_variability,
      conditions: row.task_conditions,
    },
  };
}

export async function saveDrillConfiguration(config: DrillConfiguration): Promise<void> {
  const adapter = getAdapter();
  await adapter.exec(
    `INSERT OR REPLACE INTO drill_configurations (
      id, tier, difficulty_mode, manual_delta, variable_params,
      stimulus_texture, stimulus_colour, stimulus_background_value,
      stimulus_background_colour, stimulus_background_complexity,
      stimulus_contrast, stimulus_lighting_direction,
      stimulus_lighting_intensity, stimulus_lighting_colour,
      stimulus_viewing_distance, stimulus_viewing_angle,
      stimulus_surface_orientation, stimulus_surface_texture,
      stimulus_surface_colour, stimulus_ambient_noise,
      stimulus_temperature, stimulus_time_of_day,
      task_timed, task_seconds_per_trial, task_endless, task_repetitions,
      task_auto_continue, task_feedback_duration_ms, task_streak_threshold,
      task_feedback_delay, task_feedback_type, task_tolerance,
      task_distraction, task_fatigue, task_complexity, task_interaction,
      task_variability, task_conditions, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      config.id,
      config.tier,
      config.difficultyMode,
      config.manualDelta,
      JSON.stringify(config.variable),
      config.stimulus.texture,
      config.stimulus.colour,
      config.stimulus.backgroundValue,
      config.stimulus.backgroundColour,
      config.stimulus.backgroundComplexity,
      config.stimulus.contrast,
      config.stimulus.lightingDirection,
      config.stimulus.lightingIntensity,
      config.stimulus.lightingColour,
      config.stimulus.viewingDistance,
      config.stimulus.viewingAngle,
      config.stimulus.surfaceOrientation,
      config.stimulus.surfaceTexture,
      config.stimulus.surfaceColour,
      config.stimulus.ambientNoise,
      config.stimulus.temperature,
      config.stimulus.timeOfDay,
      config.task.timed ? 1 : 0,
      config.task.secondsPerTrial,
      config.task.endless ? 1 : 0,
      config.task.repetitions,
      config.task.autoContinue ? 1 : 0,
      config.task.feedbackDurationMs,
      config.task.streakThreshold ?? null,
      config.task.feedbackDelay,
      config.task.feedbackType,
      config.task.tolerance,
      config.task.distraction,
      config.task.fatigue,
      config.task.complexity,
      config.task.interaction,
      config.task.variability,
      config.task.conditions,
    ]
  );
}