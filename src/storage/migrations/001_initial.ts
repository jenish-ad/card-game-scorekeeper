import type { MatchConnection } from '../database';
export const version = 1;
export async function up(db: MatchConnection) {
  await db.execAsync(`
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
      `);
}
