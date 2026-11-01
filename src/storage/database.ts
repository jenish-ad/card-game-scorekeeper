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

export async function migrateDatabase(database: MatchDatabase) {
  await database.execAsync(
    'PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;',
  );
  await database.withExclusiveTransactionAsync(async (transaction) => {
    const row = await transaction.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
    );
    if (!row || !Number.isInteger(row.user_version) || row.user_version > 2) {
      throw new Error(
        'This database needs a newer app version. No saved matches were changed.',
      );
    }
    if (row.user_version === 0) {
      await transaction.execAsync(`
        CREATE TABLE matches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game TEXT NOT NULL CHECK (game = 'marriage'),
          rule_version TEXT NOT NULL,
          created_at TEXT NOT NULL,
          finished_at TEXT
        );
        CREATE TABLE players (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
          name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 40),
          seat INTEGER NOT NULL CHECK (seat >= 0),
          UNIQUE(match_id, seat)
        );
        CREATE TABLE rounds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
          rule_version TEXT NOT NULL,
          inputs_json TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX players_by_match ON players(match_id, seat);
        CREATE INDEX rounds_by_match ON rounds(match_id, id);
        PRAGMA user_version = 1;
      `);
    }
    if (row.user_version < 2) {
      await transaction.execAsync(
        "ALTER TABLE matches ADD COLUMN title TEXT NOT NULL DEFAULT ''; PRAGMA user_version = 2;",
      );
    }
  });
}
