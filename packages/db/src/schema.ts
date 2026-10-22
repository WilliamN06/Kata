export const SCHEMA_VERSION = 1;

export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    calibration_gamma REAL DEFAULT 1.0,
    calibration_black REAL DEFAULT 0.0,
    calibration_white REAL DEFAULT 100.0,
    calibration_date TEXT,
    session_length_minutes INTEGER DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS variable_state (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    subskill_id TEXT NOT NULL,
    variable_id TEXT NOT NULL,
    level TEXT DEFAULT '1A',
    accuracy REAL DEFAULT 0.0,
    threshold REAL,
    trial_count INTEGER DEFAULT 0,
    last_practiced TEXT,
    unlocked_at TEXT
  );

  CREATE TABLE IF NOT EXISTS drill_settings (
    id TEXT PRIMARY KEY,
    tier TEXT NOT NULL,
    difficulty_mode TEXT DEFAULT 'auto',
    range TEXT DEFAULT 'moderate',
    tolerance TEXT DEFAULT 'moderate',
    timed INTEGER DEFAULT 0,
    seconds_per_trial INTEGER DEFAULT 15,
    interaction TEXT DEFAULT 'independent',
    variability TEXT DEFAULT 'predictable',
    conditions TEXT DEFAULT '1',
    task_condition TEXT DEFAULT 'none',
    background_condition TEXT DEFAULT 'none',
    trials_per_session INTEGER DEFAULT 20,
    step_size_min REAL,
    step_size_max REAL,
    endless INTEGER DEFAULT 0,
    streak_threshold INTEGER,
    answer_display_duration INTEGER,
    auto_continue INTEGER DEFAULT 1,
    feedback_duration_ms INTEGER DEFAULT 1500,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trial_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id TEXT NOT NULL,
    level TEXT,
    group_id TEXT,
    task_condition TEXT,
    background_condition TEXT,
    delta_value REAL,
    correct INTEGER,
    response_time_ms INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    session_id TEXT
  );

  CREATE TABLE IF NOT EXISTS session_summary (
    id TEXT PRIMARY KEY,
    type TEXT,
    started_at TEXT,
    ended_at TEXT,
    drill_count INTEGER,
    accuracy REAL,
    drills TEXT
  );

  CREATE TABLE IF NOT EXISTS unlock_state (
    key TEXT PRIMARY KEY,
    unlocked INTEGER DEFAULT 0,
    unlocked_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_trial_variable
    ON trial_history(state_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_trial_session
    ON trial_history(session_id);

  CREATE TABLE IF NOT EXISTS drill_configurations (
    id TEXT PRIMARY KEY,
    tier TEXT NOT NULL,
    difficulty_mode TEXT DEFAULT 'auto',
    manual_delta REAL DEFAULT 5.0,
    variable_params TEXT DEFAULT '{}',
    stimulus_texture TEXT DEFAULT 'smooth',
    stimulus_colour TEXT DEFAULT 'neutral',
    stimulus_background_value TEXT DEFAULT 'mid',
    stimulus_background_colour TEXT DEFAULT 'neutral',
    stimulus_background_complexity TEXT DEFAULT 'plain',
    stimulus_contrast TEXT DEFAULT 'moderate',
    stimulus_lighting_direction TEXT DEFAULT 'front',
    stimulus_lighting_intensity TEXT DEFAULT 'moderate',
    stimulus_lighting_colour TEXT DEFAULT 'neutral',
    stimulus_viewing_distance TEXT DEFAULT 'close',
    stimulus_viewing_angle TEXT DEFAULT 'frontal',
    stimulus_surface_orientation TEXT DEFAULT 'flat',
    stimulus_surface_texture TEXT DEFAULT 'smooth',
    stimulus_surface_colour TEXT DEFAULT 'white',
    stimulus_ambient_noise TEXT DEFAULT 'quiet',
    stimulus_temperature TEXT DEFAULT 'moderate',
    stimulus_time_of_day TEXT DEFAULT 'morning',
    task_timed INTEGER DEFAULT 0,
    task_seconds_per_trial INTEGER DEFAULT 15,
    task_endless INTEGER DEFAULT 0,
    task_repetitions INTEGER DEFAULT 20,
    task_auto_continue INTEGER DEFAULT 1,
    task_streak_threshold INTEGER,
    task_feedback_duration_ms INTEGER DEFAULT 1500,
    task_feedback_delay TEXT DEFAULT 'immediate',
    task_feedback_type TEXT DEFAULT 'visual',
    task_tolerance TEXT DEFAULT 'moderate',
    task_distraction TEXT DEFAULT 'none',
    task_fatigue TEXT DEFAULT 'fresh',
    task_complexity TEXT DEFAULT '1',
    task_interaction TEXT DEFAULT 'independent',
    task_variability TEXT DEFAULT 'predictable',
    task_conditions TEXT DEFAULT '1',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  INSERT OR IGNORE INTO drill_configurations (id, tier) VALUES ('global', 'global');

  CREATE INDEX IF NOT EXISTS idx_trial_variable
    ON trial_history(state_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_trial_session
    ON trial_history(session_id);

  INSERT OR IGNORE INTO user_profile (id) VALUES (1);
  INSERT OR IGNORE INTO drill_settings (id, tier) VALUES ('global', 'global');
  INSERT OR IGNORE INTO unlock_state (key, unlocked) VALUES
    ('group_A', 0),('group_B', 0),('group_C', 0),
    ('taskConditions', 0),('backgroundConditions', 0),
    ('level3A', 0),('automaticity', 0);
`;