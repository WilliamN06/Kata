import { invoke } from '@tauri-apps/api/core';
import type { DatabaseAdapter } from './adapter';

export class TauriDatabaseAdapter implements DatabaseAdapter {
  async init(): Promise<void> {
    await invoke('db_init');
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return invoke<T[]>('db_query', { sql, params });
  }

  async exec(sql: string, params: unknown[] = []): Promise<void> {
    await invoke('db_exec', { sql, params });
  }

  async close(): Promise<void> {
    await invoke('db_close');
  }
}