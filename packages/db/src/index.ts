import type { DatabaseAdapter } from './adapter';

let adapter: DatabaseAdapter | null = null;

export async function initDatabase(): Promise<void> {
  const isTauri =
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  if (isTauri) {
    const { TauriDatabaseAdapter } = await import('./tauri-adapter');
    adapter = new TauriDatabaseAdapter();
  } else {
    const { WebDatabaseAdapter } = await import('./web-adapter');
    adapter = new WebDatabaseAdapter();
  }

  await adapter.init();
}

export function getAdapter(): DatabaseAdapter {
  if (!adapter) throw new Error('Database not initialized');
  return adapter;
}

export * from './queries';
export { useStore } from './store';
export { SCHEMA_SQL } from './schema';
export type { DatabaseAdapter } from './adapter';