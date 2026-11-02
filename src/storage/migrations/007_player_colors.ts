import type { MatchConnection } from '../database';
import { nextPlayerColor } from '@/lib/playerColors';
export const version = 7;
export async function up(db: MatchConnection) {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS player_colors (player_id INTEGER PRIMARY KEY, match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE, color_index INTEGER NOT NULL CHECK(color_index BETWEEN 0 AND 5));',
  );
  const players = await db.getAllAsync<{
    id: number;
    match_id: number;
    active: number;
    color_index: number | null;
  }>(
    'SELECT p.id, p.match_id, p.active, c.color_index FROM players p LEFT JOIN player_colors c ON c.player_id = p.id ORDER BY p.id',
  );
  const assigned = new Map<number, { colorIndex: number; active: boolean }[]>();
  for (const player of players) {
    const previous = assigned.get(player.match_id) ?? [];
    const colorIndex = player.color_index ?? nextPlayerColor(previous);
    if (player.color_index === null)
      await db.runAsync(
        'INSERT INTO player_colors(player_id, match_id, color_index) VALUES (?, ?, ?)',
        player.id,
        player.match_id,
        colorIndex,
      );
    previous.push({ colorIndex, active: player.active === 1 });
    assigned.set(player.match_id, previous);
  }
}
