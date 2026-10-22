import type { DbAdapter } from '../database';

/**
 * In-memory SQL adapter. Works in Node, browser, Tauri — anywhere.
 * Tables are simulated as arrays. Enough for the current schema.
 *
 * For production desktop, swap this for a rusqlite-backed adapter.
 * For production web, swap for sql.js WASM adapter.
 */

interface Tables {
  variable_state: Array<{
    variable_id: string;
    accuracy: number;
    threshold: number | null;
    trial_count: number;
    last_practiced: string | null;
  }>;
  trial_history: Array<{
    id: number;
    variable_id: string;
    task_type: string;
    stimulus_params: string | null;
    variable_params: string | null;
    task_conditions: string | null;
    correct: number;
    response_time_ms: number | null;
    user_response: string | null;
    correct_response: string | null;
    rating_json: string | null;
    created_at: string;
  }>;
  drill_configurations: Array<{
    id: string;
    task_conditions: string | null;
    variable_params: string | null;
    stimulus_params: string | null;
    updated_at: string;
  }>;
}

export class MemoryAdapter implements DbAdapter {
  private tables: Tables = {
    variable_state: [],
    trial_history: [],
    drill_configurations: [],
  };
  private nextTrialId = 1;

  async exec(_sql: string, _params?: unknown[]): Promise<void> {
    // Schema is implicit in the memory adapter; no-op.
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    const trimmed = sql.trim().toUpperCase();

    if (trimmed.startsWith('INSERT OR REPLACE INTO VARIABLE_STATE')) {
      const [variable_id, accuracy, threshold, trial_count, last_practiced] =
        params as [string, number, number | null, number, string | null];
      const idx = this.tables.variable_state.findIndex(
        (r) => r.variable_id === variable_id
      );
      const row = { variable_id, accuracy, threshold, trial_count, last_practiced };
      if (idx >= 0) this.tables.variable_state[idx] = row;
      else this.tables.variable_state.push(row);
      return;
    }

    if (trimmed.startsWith('INSERT INTO TRIAL_HISTORY')) {
      const [
        variable_id, task_type, stimulus_params, variable_params,
        task_conditions, correct, response_time_ms, user_response,
        correct_response, rating_json,
      ] = params as [
        string, string, string | null, string | null, string | null,
        number, number | null, string | null, string | null, string | null
      ];
      this.tables.trial_history.push({
        id: this.nextTrialId++,
        variable_id, task_type, stimulus_params, variable_params,
        task_conditions, correct, response_time_ms, user_response,
        correct_response, rating_json,
        created_at: new Date().toISOString(),
      });
      return;
    }

    if (trimmed.startsWith('INSERT OR REPLACE INTO DRILL_CONFIGURATIONS')) {
      const [id, task_conditions, variable_params, stimulus_params] =
        params as [string, string | null, string | null, string | null];
      const idx = this.tables.drill_configurations.findIndex((r) => r.id === id);
      const row = {
        id, task_conditions, variable_params, stimulus_params,
        updated_at: new Date().toISOString(),
      };
      if (idx >= 0) this.tables.drill_configurations[idx] = row;
      else this.tables.drill_configurations.push(row);
      return;
    }

    if (trimmed.startsWith('DELETE FROM DRILL_CONFIGURATIONS')) {
      const [id] = params as [string];
      this.tables.drill_configurations = this.tables.drill_configurations.filter(
        (r) => r.id !== id
      );
      return;
    }
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const trimmed = sql.trim().toUpperCase();

    if (trimmed.includes('FROM VARIABLE_STATE')) {
      if (trimmed.includes('WHERE VARIABLE_ID = ?')) {
        const [id] = params as [string];
        return this.tables.variable_state.filter(
          (r) => r.variable_id === id
        ) as unknown as T[];
      }
      return this.tables.variable_state as unknown as T[];
    }

    if (trimmed.includes('FROM DRILL_CONFIGURATIONS')) {
      if (trimmed.includes('WHERE ID = ?')) {
        const [id] = params as [string];
        return this.tables.drill_configurations.filter(
          (r) => r.id === id
        ) as unknown as T[];
      }
      return this.tables.drill_configurations as unknown as T[];
    }

    if (trimmed.includes('FROM TRIAL_HISTORY')) {
      return this.tables.trial_history as unknown as T[];
    }

    return [];
  }

  async getFirst<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }
}
