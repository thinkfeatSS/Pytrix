/**
 * In-Memory SQLite Connection backed by official SQLite WebAssembly (sql.js)
 * Guarantees 100% deterministic SQLite semantics in Jest tests and headless environments.
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { IDatabaseConnection } from '../shared/types/database';

let sqlJsInstance: SqlJsStatic | null = null;

export class InMemorySqliteConnection implements IDatabaseConnection {
  private db: Database | null = null;
  private inTransaction: boolean = false;

  public async initialize(): Promise<void> {
    if (!sqlJsInstance) {
      sqlJsInstance = await initSqlJs();
    }
    this.db = new sqlJsInstance.Database();
    // Enable SQLite foreign keys
    this.db.run('PRAGMA foreign_keys = ON;');
  }

  private ensureOpen(): Database {
    if (!this.db) {
      throw new Error('Database is not initialized. Call initialize() first.');
    }
    return this.db;
  }

  public async execute(sql: string, params: any[] = []): Promise<void> {
    const db = this.ensureOpen();
    db.run(sql, params);
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const db = this.ensureOpen();
    const stmt = db.prepare(sql);
    try {
      stmt.bind(params);
      const results: T[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as T);
      }
      return results;
    } finally {
      stmt.free();
    }
  }

  public async querySingle<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  public async transaction<T>(action: (tx: IDatabaseConnection) => Promise<T>): Promise<T> {
    const db = this.ensureOpen();
    if (this.inTransaction) {
      // Nested transaction simulation with savepoint
      const savepoint = `sp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      db.run(`SAVEPOINT ${savepoint};`);
      try {
        const result = await action(this);
        db.run(`RELEASE SAVEPOINT ${savepoint};`);
        return result;
      } catch (error) {
        db.run(`ROLLBACK TO SAVEPOINT ${savepoint};`);
        throw error;
      }
    }

    this.inTransaction = true;
    db.run('BEGIN TRANSACTION;');
    try {
      const result = await action(this);
      db.run('COMMIT;');
      return result;
    } catch (error) {
      db.run('ROLLBACK;');
      throw error;
    } finally {
      this.inTransaction = false;
    }
  }

  public async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

