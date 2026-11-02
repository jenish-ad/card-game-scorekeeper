import type { MatchConnection } from '../database';
export const version = 3;
export async function up(db: MatchConnection) {
  // Preserve canonical inputs while adopting the single unreleased scoring definition.
  await db.execAsync(`
        ALTER TABLE matches ADD COLUMN settings_json TEXT NOT NULL DEFAULT '{"seenFee":3,"unseenFee":10,"dubleeExtra":5,"moneyRate":null}';
        UPDATE matches SET rule_version = 'marriage-v1' WHERE rule_version IN ('pagat-base-v1', 'pagat-base-v1-seen-maal');
        UPDATE rounds SET rule_version = 'marriage-v1' WHERE rule_version IN ('pagat-base-v1', 'pagat-base-v1-seen-maal');
      `);
}
