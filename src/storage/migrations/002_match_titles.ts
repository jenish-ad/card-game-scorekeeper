import type { MatchConnection } from '../database';
export const version = 2;
async function addMatchTitles(db: MatchConnection) {
  await db.execAsync(
    "ALTER TABLE matches ADD COLUMN title TEXT NOT NULL DEFAULT '';",
  );
}

export { addMatchTitles as up };
