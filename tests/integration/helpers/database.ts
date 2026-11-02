import { DatabaseSync } from 'node:sqlite';
import type { MatchConnection, MatchDatabase } from '@/storage/database';
// Exercise production SQL with real SQLite. Expo's native bridge still needs device testing.
export class TestDatabase implements MatchDatabase {
  readonly sqlite: DatabaseSync;
  constructor(filename = ':memory:') {
    this.sqlite = new DatabaseSync(filename);
  }
  async execAsync(sql: string) {
    this.sqlite.exec(sql);
  }
  async runAsync(sql: string, ...params: (string | number | null)[]) {
    const result = this.sqlite.prepare(sql).run(...params);
    return {
      lastInsertRowId: Number(result.lastInsertRowid),
      changes: Number(result.changes),
    };
  }
  async getAllAsync<T>(
    sql: string,
    ...params: (string | number | null)[]
  ): Promise<T[]> {
    // SQLite returns untyped rows; production readers validate them at the boundary.
    return this.sqlite.prepare(sql).all(...params) as T[];
  }
  async getFirstAsync<T>(
    sql: string,
    ...params: (string | number | null)[]
  ): Promise<T | null> {
    return (this.sqlite.prepare(sql).get(...params) as T | undefined) ?? null;
  }
  async withExclusiveTransactionAsync(
    work: (transaction: MatchConnection) => Promise<void>,
  ) {
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      await work(this);
      this.sqlite.exec('COMMIT');
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }
}
