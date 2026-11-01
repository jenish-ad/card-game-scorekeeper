import assert from 'node:assert/strict';
import { mkdtempSync, rmdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test, expect } from '@jest/globals';
import { defaultMatchTitle } from '../src/features/marriage/matchTitle';
import {
  currentRuleVersion,
  defaultSettings,
} from '../src/features/marriage/scoring';
import {
  migrateDatabase,
  type MatchConnection,
  type MatchDatabase,
} from '../src/storage/database';
import {
  type SavedMatch,
  createMatch,
  deleteRound,
  getMatch,
  listMatches,
  matchTotals,
  saveRound,
  setMatchFinished,
} from '../src/features/marriage/matches';
import type { MarriageRoundInput } from '../src/features/marriage/scoring';

function requireMatch(match: SavedMatch | null): SavedMatch {
  assert.ok(match, 'Expected the saved match to exist');
  return match;
}

// Exercise production SQL with real SQLite. Expo's native bridge still needs device testing.
class TestDatabase implements MatchDatabase {
  readonly sqlite: DatabaseSync;
  constructor(filename = ':memory:') {
    this.sqlite = new DatabaseSync(filename);
  }
  async execAsync(sql: string) {
    this.sqlite.exec(sql);
  }
  async runAsync(sql: string, ...params: (string | number | null)[]) {
    const result = this.sqlite.prepare(sql).run(...params);
    return {
      lastInsertRowId: Number(result.lastInsertRowid),
      changes: Number(result.changes),
    };
  }
  async getAllAsync<T>(
    sql: string,
    ...params: (string | number | null)[]
  ): Promise<T[]> {
    // SQLite returns untyped rows; production readers validate them at the boundary.
    return this.sqlite.prepare(sql).all(...params) as T[];
  }
  async getFirstAsync<T>(
    sql: string,
    ...params: (string | number | null)[]
  ): Promise<T | null> {
    return (this.sqlite.prepare(sql).get(...params) as T | undefined) ?? null;
  }
  async withExclusiveTransactionAsync(
    work: (transaction: MatchConnection) => Promise<void>,
  ) {
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      await work(this);
      this.sqlite.exec('COMMIT');
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }
}

function roundFor(players: { id: number }[]): MarriageRoundInput {
  return {
    winnerId: players[0].id,
    dubleeWin: false,
    players: players.map((player, index) => ({
      playerId: player.id,
      maal: index === 0 ? 5 : index === 1 ? 2 : 0,
      seen: index < 2,
    })),
  };
}

test.each(['pagat-base-v1', 'pagat-base-v1-seen-maal'])(
  'migration maps %s and retains canonical round inputs',
  async (oldId) => {
    const database = new TestDatabase();
    try {
      await migrateDatabase(database);
      const id = await createMatch(database, ['Sita', 'Ram', 'Hari']);
      const match = await getMatch(database, id);
      if (!match) throw new Error('Missing fixture match');
      const input = { ...roundFor(match.players), dubleeWin: true };
      input.players[2].maal = 4;
      await saveRound(database, id, input);
      await database.runAsync(
        'UPDATE matches SET rule_version = ? WHERE id = ?',
        oldId,
        id,
      );
      await database.runAsync(
        'UPDATE rounds SET rule_version = ? WHERE match_id = ?',
        oldId,
        id,
      );
      await database.execAsync(
        'ALTER TABLE matches DROP COLUMN title; ALTER TABLE matches DROP COLUMN settings_json; PRAGMA user_version = 1;',
      );
      await migrateDatabase(database);
      const restored = await getMatch(database, id);
      if (!restored) throw new Error('Migration lost match');
      expect(restored.title).toBe(
        defaultMatchTitle(new Date(restored.createdAt)),
      );
      expect(restored.ruleVersion).toBe(currentRuleVersion);
      expect(restored.settings).toEqual(defaultSettings);
      expect(restored.rounds[0].input).toEqual(input);
      expect([...matchTotals(restored).values()]).toEqual([31, -9, -22]);
      await migrateDatabase(database);
      expect(await getMatch(database, id)).toEqual(restored);
    } finally {
      database.sqlite.close();
    }
  },
);

test('new matches persist titles, seat order, rule revision, and canonical unseen maal', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const id = await createMatch(
      database,
      ['Hari', 'Sita', 'Ram'],
      '  Sunday Evening Game  ',
      currentRuleVersion,
    );
    let match = requireMatch(await getMatch(database, id));
    expect(match.title).toBe('Sunday Evening Game');
    expect(match.players.map((player) => player.name)).toEqual([
      'Hari',
      'Sita',
      'Ram',
    ]);
    const input = roundFor(match.players);
    input.players[2].maal = 9;
    await saveRound(database, id, input);
    match = requireMatch(await getMatch(database, id));
    expect(match.rounds[0].input.players[2].maal).toBe(9);
    expect([...matchTotals(match).values()]).toEqual([21, -4, -17]);
    await saveRound(database, id, { ...input, dubleeWin: true });
    expect((await getMatch(database, id))?.rounds).toHaveLength(2);
    await assert.rejects(
      createMatch(database, ['A', 'B'], '   ', currentRuleVersion),
      /match title/,
    );
    await assert.rejects(
      createMatch(database, ['A', 'B'], 'x'.repeat(81), currentRuleVersion),
      /match title/,
    );
  } finally {
    database.sqlite.close();
  }
});

test('migrations are repeatable, preserve records and reject newer schemas', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const id = await createMatch(database, ['Sita', 'Ram']);
    await migrateDatabase(database);
    assert.equal((await getMatch(database, id))?.players[0].name, 'Sita');
    await database.execAsync('PRAGMA user_version = 4');
    await assert.rejects(migrateDatabase(database), /newer app/);
    assert.equal(
      (
        await database.getFirstAsync<{ user_version: number }>(
          'PRAGMA user_version',
        )
      )?.user_version,
      4,
    );
  } finally {
    database.sqlite.close();
  }
});

test('a failed migration rolls back schema changes and version', async () => {
  const database = new TestDatabase();
  try {
    await database.execAsync('CREATE TABLE players (id INTEGER)');
    await assert.rejects(migrateDatabase(database));
    assert.equal(
      await database.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE name = 'matches'",
      ),
      null,
    );
    assert.equal(
      (
        await database.getFirstAsync<{ user_version: number }>(
          'PRAGMA user_version',
        )
      )?.user_version,
      0,
    );
  } finally {
    database.sqlite.close();
  }
});

test('match and ordered players roll back together when a player write fails', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    await database.execAsync(
      "CREATE TRIGGER reject_ram BEFORE INSERT ON players WHEN NEW.name = 'Ram' BEGIN SELECT RAISE(ABORT, 'disk write failed'); END;",
    );
    await assert.rejects(
      createMatch(database, ['Sita', 'Ram']),
      /disk write failed/,
    );
    assert.deepEqual(await listMatches(database), []);
    expect(await database.getAllAsync('SELECT * FROM players')).toEqual([]);
  } finally {
    database.sqlite.close();
  }
});

test('saved rounds survive reopening, correct/delete recalculate, and finished matches are protected', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'scorekeeper-test-'));
  const filename = join(directory, 'matches.db');
  let database = new TestDatabase(filename);
  try {
    await migrateDatabase(database);
    assert.deepEqual(await listMatches(database), []);
    const id = await createMatch(
      database,
      [' Sita ', 'Ram', 'Hari'],
      'Marriage Match',
      currentRuleVersion,
    );
    const initial = requireMatch(await getMatch(database, id));
    expect(initial.players.map((player) => player.name)).toEqual([
      'Sita',
      'Ram',
      'Hari',
    ]);
    const input = roundFor(initial.players);
    await saveRound(database, id, input);
    await saveRound(database, id, { ...input, dubleeWin: true });
    database.sqlite.close();
    database = new TestDatabase(filename);
    await migrateDatabase(database);
    let saved = requireMatch(await getMatch(database, id));
    expect(saved.rounds[0].input).toEqual(input);
    assert.deepEqual([...matchTotals(saved).values()], [52, -13, -39]);
    await saveRound(
      database,
      id,
      { ...input, dubleeWin: true },
      saved.rounds[0].id,
    );
    saved = requireMatch(await getMatch(database, id));
    assert.deepEqual([...matchTotals(saved).values()], [62, -18, -44]);
    await deleteRound(database, id, saved.rounds[0].id);
    saved = requireMatch(await getMatch(database, id));
    assert.deepEqual([...matchTotals(saved).values()], [31, -9, -22]);
    await setMatchFinished(database, id, true);
    await assert.rejects(saveRound(database, id, input), /Reopen/);
    await assert.rejects(
      deleteRound(database, id, saved.rounds[0].id),
      /Reopen/,
    );
    assert.ok((await listMatches(database))[0].finishedAt);
    await setMatchFinished(database, id, false);
    await deleteRound(database, id, saved.rounds[0].id);
    assert.deepEqual(
      [...matchTotals(requireMatch(await getMatch(database, id))).values()],
      [0, 0, 0],
    );
  } finally {
    database.sqlite.close();
    unlinkSync(filename);
    rmdirSync(directory);
  }
});

test('rounds reject foreign players and missing IDs without changing saved inputs', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const firstId = await createMatch(database, ['Sita', 'Ram']);
    const secondId = await createMatch(database, ['Hari', 'Gita']);
    const first = requireMatch(await getMatch(database, firstId));
    const second = requireMatch(await getMatch(database, secondId));
    const input = roundFor(first.players);
    await assert.rejects(
      saveRound(database, firstId, roundFor(second.players)),
      /every player/,
    );
    await saveRound(database, firstId, input);
    const saved = requireMatch(await getMatch(database, firstId));
    await assert.rejects(
      saveRound(database, firstId, input, 999),
      /no longer exists/,
    );
    await assert.rejects(
      deleteRound(database, secondId, saved.rounds[0].id),
      /no longer exists/,
    );
    assert.deepEqual((await getMatch(database, firstId))?.rounds, saved.rounds);
    assert.equal(await getMatch(database, 999), null);
  } finally {
    database.sqlite.close();
  }
});

test('invalid names, rule versions and corrupt round inputs fail explicitly', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    await assert.rejects(
      createMatch(database, ['Sita', 'sita']),
      /different name/,
    );
    const id = await createMatch(
      database,
      ['Sita', 'Ram'],
      'Marriage Match',
      currentRuleVersion,
    );
    const match = requireMatch(await getMatch(database, id));
    await saveRound(database, id, roundFor(match.players));
    await database.runAsync(
      'UPDATE rounds SET rule_version = ? WHERE match_id = ?',
      'future-v2',
      id,
    );
    await assert.rejects(getMatch(database, id), /Update the app/);
    await database.runAsync(
      'UPDATE rounds SET rule_version = ?, inputs_json = ? WHERE match_id = ?',
      currentRuleVersion,
      '{}',
      id,
    );
    await assert.rejects(getMatch(database, id), /invalid/);
  } finally {
    database.sqlite.close();
  }
});

test('settings are isolated per match and recompute saved rounds after reopening', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const custom = {
      seenFee: 0,
      unseenFee: 2,
      dubleeExtra: 7,
      moneyRate: 1.25,
    };
    const first = await createMatch(
      database,
      ['Sita', 'Ram', 'Hari'],
      'Custom',
      currentRuleVersion,
      custom,
    );
    const second = await createMatch(database, ['Sita', 'Ram', 'Hari']);
    const match = await getMatch(database, first);
    if (!match) throw new Error('Missing fixture');
    await saveRound(database, first, {
      ...roundFor(match.players),
      dubleeWin: true,
    });
    const saved = await getMatch(database, first);
    if (!saved) throw new Error('Missing saved match');
    expect(saved.settings).toEqual(custom);
    expect([...matchTotals(saved).values()]).toEqual([24, -8, -16]);
    expect((await getMatch(database, second))?.settings).toEqual(
      defaultSettings,
    );
    await assert.rejects(
      createMatch(database, ['A', 'B'], 'Invalid', currentRuleVersion, {
        ...custom,
        seenFee: -1,
      }),
    );
    expect(await listMatches(database)).toHaveLength(2);
  } finally {
    database.sqlite.close();
  }
});
