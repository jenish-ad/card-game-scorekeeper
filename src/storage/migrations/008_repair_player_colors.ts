import type { MatchConnection } from '../database';
import { up as backfillPlayerColors } from './007_player_colors';

export const version = 8;

export async function up(db: MatchConnection) {
  await backfillPlayerColors(db);
}
