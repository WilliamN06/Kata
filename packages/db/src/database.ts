export interface DbAdapter {
  exec: (sql: string, params?: unknown[]) => Promise<void>;
  query: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  getFirst: <T>(sql: string, params?: unknown[]) => Promise<T | null>;
  run: (sql: string, params?: unknown[]) => Promise<void>;
}

let adapter: DbAdapter | null = null;

export function setDbAdapter(a: DbAdapter): void {
  adapter = a;
}

export function getAdapter(): DbAdapter {
  if (!adapter) {
    throw new Error(
      'DB adapter not set. Call setDbAdapter() on app startup before any query.'
    );
  }
  return adapter;
}

export async function getDatabase(): Promise<DbAdapter> {
  return getAdapter();
}
