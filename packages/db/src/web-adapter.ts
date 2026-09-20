import initSqlJs, { type Database } from 'sql.js';
import type { DatabaseAdapter } from './adapter';
import { SCHEMA_SQL } from './schema';

export class WebDatabaseAdapter implements DatabaseAdapter {
  private db: Database | null = null;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  async init(): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: () => '/sql-wasm.wasm',
    });

    const saved = await this.load();
    this.db = saved ? new SQL.Database(saved) : new SQL.Database();

    // Always apply the schema so existing databases are migrated with any
    // newly added tables/columns (CREATE TABLE IF NOT EXISTS is idempotent).
    this.db.run(SCHEMA_SQL);
    // Lightweight migration: add newly-added columns to existing DBs.
    try {
      this.db.run('ALTER TABLE drill_configurations ADD COLUMN task_streak_threshold INTEGER');
    } catch {
      // Column already exists (or table not present) — ignore.
    }
    await this.persist();
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(sql);
    stmt.bind(params as any);
    const results: T[] = [];
    while (stmt.step()) results.push(stmt.getAsObject() as T);
    stmt.free();
    return results;
  }

  async exec(sql: string, params: unknown[] = []): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run(sql, params as any);
    this.schedulePersist();
  }

  async close(): Promise<void> {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    await this.persist();
    this.db?.close();
    this.db = null;
  }

  private schedulePersist(): void {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      void this.persist();
    }, 500);
  }

  private async load(): Promise<Uint8Array | null> {
    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      try {
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle('kata.db');
        const file = await handle.getFile();
        return new Uint8Array(await file.arrayBuffer());
      } catch {
        return null;
      }
    }
    return null;
  }

  private async persist(): Promise<void> {
    if (!this.db) return;
    const data = this.db.export();
    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    const view = new Uint8Array(ab);

    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      try {
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle('kata.db', { create: true });
        const writable = await handle.createWritable();
        await writable.write(view);
        await writable.close();
      } catch (err) {
        console.error('Failed to persist database:', err);
      }
    }
  }
}