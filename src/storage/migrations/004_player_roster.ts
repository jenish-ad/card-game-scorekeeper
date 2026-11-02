import type { MatchConnection } from '../database';
export const version = 4;
export async function up(db: MatchConnection) {
  await db.execAsync(`
        ALTER TABLE players ADD COLUMN active INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE players ADD COLUMN joined_at TEXT;
      `);
}
