import type { MatchConnection } from '../database';
export const version = 5;
export async function up(db: MatchConnection) {
  await db.execAsync(
    'CREATE TABLE app_preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL);',
  );
}
