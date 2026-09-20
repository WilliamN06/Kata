export interface DatabaseAdapter {
  init(): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string, params?: unknown[]): Promise<void>;
  close(): Promise<void>;
}