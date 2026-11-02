import type { MatchConnection } from '../database';
import { legacyAutoTitles } from '../autoTitles';
export const version = 6;
export async function up(db: MatchConnection) {
  const matches = await db.getAllAsync<{
    id: number;
    title: string;
    created_at: string;
  }>('SELECT id, title, created_at FROM matches');
  for (const match of matches) {
    if (legacyAutoTitles(match.created_at).has(match.title))
      await db.runAsync("UPDATE matches SET title = '' WHERE id = ?", match.id);
  }
}
