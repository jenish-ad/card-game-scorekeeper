import { AppError } from '@/lib/errors';
import * as migration1 from './migrations/001_initial';
import * as migration2 from './migrations/002_match_titles';
import * as migration3 from './migrations/003_match_settings';
import * as migration4 from './migrations/004_player_roster';
import * as migration5 from './migrations/005_preferences';
import * as migration6 from './migrations/006_auto_titles';
import * as migration7 from './migrations/007_player_colors';
export interface MatchConnection {
  execAsync(sql: string): Promise<void>;
  runAsync(
    sql: string,
    ...params: (string | number | null)[]
  ): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T>(
    sql: string,
    ...params: (string | number | null)[]
  ): Promise<T[]>;
  getFirstAsync<T>(
    sql: string,
    ...params: (string | number | null)[]
  ): Promise<T | null>;
}

export interface MatchDatabase extends MatchConnection {
  withExclusiveTransactionAsync(
    work: (transaction: MatchConnection) => Promise<void>,
  ): Promise<void>;
}

const migrations = [
  migration1,
  migration2,
  migration3,
  migration4,
  migration5,
  migration6,
  migration7,
];
export async function migrateDatabase(database: MatchDatabase) {
  await database.execAsync(
    'PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;',
  );
  await database.withExclusiveTransactionAsync(async (db) => {
    const row = await db.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
    );
    if (
      !row ||
      !Number.isInteger(row.user_version) ||
      row.user_version > migrations.length
    )
      throw new AppError(
        'THIS_DATABASE_NEEDS_A_NEWER_APP_VERSION_NO_SAVED_MATCHES_WERE_CHANGED',
      );
    for (const migration of migrations)
      if (row.user_version < migration.version) {
        await migration.up(db);
        await db.execAsync(`PRAGMA user_version = ${migration.version};`);
      }
  });
}
