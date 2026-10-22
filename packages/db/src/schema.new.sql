DROP TABLE IF EXISTS user_profile;
DROP TABLE IF EXISTS unlock_state;
DROP TABLE IF EXISTS level_state;
DROP TABLE IF EXISTS variable_state;
DROP TABLE IF EXISTS trial_history;
DROP TABLE IF EXISTS drill_configurations;

CREATE TABLE variable_state (
  variable_id TEXT PRIMARY KEY,
  accuracy REAL DEFAULT 0.0,
  threshold REAL,
  trial_count INTEGER DEFAULT 0,
  last_practiced TEXT
);

CREATE TABLE trial_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variable_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  stimulus_params TEXT,
  variable_params TEXT,
  task_conditions TEXT,
  correct INTEGER NOT NULL,
  response_time_ms INTEGER,
  user_response TEXT,
  correct_response TEXT,
  rating_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_trial_variable ON trial_history(variable_id);
CREATE INDEX idx_trial_created ON trial_history(created_at);

CREATE TABLE drill_configurations (
  id TEXT PRIMARY KEY,
  task_conditions TEXT,
  variable_params TEXT,
  stimulus_params TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);
