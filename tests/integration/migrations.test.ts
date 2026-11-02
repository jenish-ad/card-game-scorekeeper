import { expect, test } from '@jest/globals';
import { TestDatabase } from '../support/database';
import { migrateDatabase } from '@/storage/database';
import * as initial from '@/storage/migrations/001_initial';

test('the ordered migration runner upgrades version 1 without changing historical input JSON', async () => {
  const db = new TestDatabase();
  try {
    await initial.up(db);
    await db.execAsync('PRAGMA user_version = 1;');
    await db.runAsync(
      "INSERT INTO matches(game,rule_version,created_at) VALUES('marriage','pagat-base-v1',?)",
      '2026-11-02T09:00:00Z',
    );
    await db.runAsync(
      'INSERT INTO players(match_id,name,seat) VALUES(1,?,?)',
      'Sita',
      9,
    );
    const input = '{"winnerId":1,"dubleeWin":false,"players":[]}';
    await db.runAsync(
      'INSERT INTO rounds(match_id,rule_version,inputs_json,created_at) VALUES(1,?,?,?)',
      'pagat-base-v1',
      input,
      '2026-11-02T09:00:00Z',
    );
    await migrateDatabase(db);
    expect(await db.getFirstAsync('PRAGMA user_version')).toEqual({
      user_version: 7,
    });
    expect(
      await db.getFirstAsync('SELECT inputs_json,rule_version FROM rounds'),
    ).toEqual({ inputs_json: input, rule_version: 'marriage-v1' });
    expect(
      await db.getFirstAsync('SELECT name,seat,active FROM players'),
    ).toEqual({ name: 'Sita', seat: 9, active: 1 });
    expect(
      await db.getFirstAsync('SELECT color_index FROM player_colors'),
    ).toEqual({ color_index: 0 });
    const schema = await db.getAllAsync<{ name: string; sql: string }>(
      "SELECT name,sql FROM sqlite_master WHERE type='table' ORDER BY name",
    );
    expect(schema.map((row) => row.name)).toEqual([
      'app_preferences',
      'matches',
      'player_colors',
      'players',
      'rounds',
      'sqlite_sequence',
    ]);
    await migrateDatabase(db);
    expect(
      await db.getAllAsync(
        "SELECT name,sql FROM sqlite_master WHERE type='table' ORDER BY name",
      ),
    ).toEqual(schema);
  } finally {
    db.sqlite.close();
  }
});
