/**
 * Versioned Database Migration Runner
 */

import { IDatabaseConnection, IMigration } from '../shared/types/database';
import { migration001 } from './migrations/001_initial_schema';

export class MigrationRunner {
  private static registeredMigrations: IMigration[] = [
    migration001,
  ];

  public static async runMigrations(db: IDatabaseConnection): Promise<number> {
    // 1. Ensure migrations tracking table exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);

    // 2. Fetch applied versions
    const appliedRows = await db.query<{ version: number }>(
      `SELECT version FROM schema_migrations ORDER BY version ASC;`
    );
    const appliedVersions = new Set(appliedRows.map((r) => r.version));

    let appliedCount = 0;

    // 3. Apply pending migrations sequentially
    for (const migration of this.registeredMigrations) {
      if (!appliedVersions.has(migration.version)) {
        await db.transaction(async (tx) => {
          await migration.up(tx);
          await tx.execute(
            `INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);`,
            [migration.version, migration.name, new Date().toISOString()]
          );
        });
        appliedCount++;
      }
    }

    return appliedCount;
  }
}

