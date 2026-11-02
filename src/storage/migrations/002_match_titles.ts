import type { MatchConnection } from '../database';
export const version = 2;
export async function up(db: MatchConnection) {
  await db.execAsync(
    "ALTER TABLE matches ADD COLUMN title TEXT NOT NULL DEFAULT '';",
  );
}
