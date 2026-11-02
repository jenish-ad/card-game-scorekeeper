import { afterEach, test, expect } from '@jest/globals';
import { AppError } from '../src/errors';
import { configureI18n } from '../src/i18n';
import { displayMatchTitle } from '../src/i18n/matchText';
import { formatDate } from '../src/i18n/dates';
import {
  PreferenceStore,
  defaultPreferences,
  readPreferences,
  writePreference,
} from '../src/storage/preferences';
import { settleUp } from '../src/features/marriage/settlement';
import assert from 'node:assert/strict';
import { mkdtempSync, rmdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  currentRuleVersion,
  defaultSettings,
  scoreRound,
} from '../src/features/marriage/scoring';
import {
  migrateDatabase,
  type MatchConnection,
  type MatchDatabase,
} from '../src/storage/database';
import {
  type SavedMatch,
  createMatch,
  addPlayer,
  setPlayerActive,
  deleteRound,
  getMatch,
  listMatches,
  matchTotals,
  saveRound,
  setMatchFinished,
} from '../src/features/marriage/matches';
import type { NormalRoundInput } from '../src/features/marriage/scoring';
afterEach(() => configureI18n(defaultPreferences));

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

function roundFor(players: { id: number }[]): NormalRoundInput {
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
        'DROP TABLE app_preferences; ALTER TABLE players DROP COLUMN active; ALTER TABLE players DROP COLUMN joined_at; ALTER TABLE matches DROP COLUMN title; ALTER TABLE matches DROP COLUMN settings_json; PRAGMA user_version = 1;',
      );
      await migrateDatabase(database);
      const restored = await getMatch(database, id);
      if (!restored) throw new Error('Migration lost match');
      expect(restored.title).toBe('');
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
    expect(
      match.rounds[0].input.kind !== 'foul' &&
        match.rounds[0].input.players[2].maal,
    ).toBe(9);
    expect([...matchTotals(match).values()]).toEqual([21, -4, -17]);
    await saveRound(database, id, { ...input, dubleeWin: true });
    expect((await getMatch(database, id))?.rounds).toHaveLength(2);
    const untitled = await createMatch(
      database,
      ['A', 'B'],
      '   ',
      currentRuleVersion,
    );
    expect((await getMatch(database, untitled))?.title).toBe('');
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
    await database.execAsync('PRAGMA user_version = 7');
    await assert.rejects(migrateDatabase(database), /newer app/);
    assert.equal(
      (
        await database.getFirstAsync<{ user_version: number }>(
          'PRAGMA user_version',
        )
      )?.user_version,
      7,
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
    assert.deepEqual(await listMatches(database), {
      matches: [],
      unavailable: [],
    });
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
    assert.deepEqual(await listMatches(database), {
      matches: [],
      unavailable: [],
    });
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
    assert.ok((await listMatches(database)).matches[0].finishedAt);
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
      /Every player/,
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
      ...defaultSettings,
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
    expect((await listMatches(database)).matches).toHaveLength(2);
  } finally {
    database.sqlite.close();
  }
});

test('joining, leaving, rejoining and historical edits preserve round participants and totals', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const id = await createMatch(database, ['A', 'B', 'C', 'D']);
    let match = requireMatch(await getMatch(database, id));
    const old = roundFor(match.players);
    await saveRound(database, id, old);
    await saveRound(database, id, old);
    await addPlayer(database, id, 'E');
    match = requireMatch(await getMatch(database, id));
    await assert.rejects(addPlayer(database, id, 'F'), /already at the table/);
    await saveRound(database, id, roundFor(match.players));
    await setPlayerActive(database, id, match.players[1].id, false);
    await assert.rejects(saveRound(database, id, old), /active/);
    await saveRound(database, id, old, match.rounds[0].id);
    await setPlayerActive(database, id, match.players[1].id, true);
    match = requireMatch(await getMatch(database, id));
    expect(match.rounds.map((round) => round.input.players.length)).toEqual([
      4, 4, 5,
    ]);
    expect(match.rounds[0].input).toEqual(old);
    for (const round of match.rounds)
      expect(
        scoreRound(round.input).reduce((sum, score) => sum + score.points, 0),
      ).toBe(0);
    expect(
      [...matchTotals(match).values()].reduce((sum, value) => sum + value, 0),
    ).toBe(0);
    for (const player of match.players.slice(2))
      await setPlayerActive(database, id, player.id, false);
    await assert.rejects(
      setPlayerActive(database, id, match.players[0].id, false),
      /At least 2/,
    );
    await assert.rejects(addPlayer(database, id, ' a '), /different name/);
    await setMatchFinished(database, id, true);
    await assert.rejects(addPlayer(database, id, 'F'), /Reopen/);
    await assert.rejects(
      setPlayerActive(database, id, match.players[2].id, true),
      /Reopen/,
    );
  } finally {
    database.sqlite.close();
  }
});

test('v3 migration preserves data and rolls back both new columns on failure', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const id = await createMatch(database, ['A', 'B']);
    const before = requireMatch(await getMatch(database, id));
    await saveRound(database, id, roundFor(before.players));
    const totals = [...matchTotals(requireMatch(await getMatch(database, id)))];
    await database.execAsync(
      'DROP TABLE app_preferences; ALTER TABLE players DROP COLUMN active; ALTER TABLE players DROP COLUMN joined_at; PRAGMA user_version = 3;',
    );
    const original = database.execAsync.bind(database);
    database.execAsync = async (sql) => {
      if (sql.includes('ADD COLUMN joined_at')) {
        await original(
          'ALTER TABLE players ADD COLUMN active INTEGER NOT NULL DEFAULT 1;',
        );
        throw new Error('injected migration failure');
      }
      await original(sql);
    };
    await assert.rejects(migrateDatabase(database), /injected/);
    expect(
      (
        await database.getAllAsync<{ name: string }>(
          'PRAGMA table_info(players)',
        )
      ).some((row) => row.name === 'active'),
    ).toBe(false);
    expect(await database.getFirstAsync('PRAGMA user_version')).toEqual({
      user_version: 3,
    });
    database.execAsync = original;
    await migrateDatabase(database);
    expect([
      ...matchTotals(requireMatch(await getMatch(database, id))),
    ]).toEqual(totals);
    expect(
      (await getMatch(database, id))?.players.every((player) => player.active),
    ).toBe(true);
  } finally {
    database.sqlite.close();
  }
});

test('foul snapshot survives settings changes, joins, departures and undo', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const id = await createMatch(database, ['A', 'B', 'C']);
    let match = requireMatch(await getMatch(database, id));
    const foul = {
      kind: 'foul' as const,
      offenderId: match.players[0].id,
      players: match.players.map((player) => ({ playerId: player.id })),
    };
    await saveRound(database, id, foul);
    await database.runAsync(
      'UPDATE matches SET settings_json = ? WHERE id = ?',
      JSON.stringify({ ...defaultSettings, foulPenalty: 99 }),
      id,
    );
    await setPlayerActive(database, id, match.players[0].id, false);
    await addPlayer(database, id, 'D');
    match = requireMatch(await getMatch(database, id));
    expect([...matchTotals(match).values()]).toEqual([-20, 10, 10, 0]);
    await saveRound(database, id, foul, match.rounds[0].id);
    expect([
      ...matchTotals(requireMatch(await getMatch(database, id))).values(),
    ]).toEqual([-20, 10, 10, 0]);
    await saveRound(database, id, {
      ...foul,
      offenderId: match.players[1].id,
      players: match.players
        .filter((player) => player.active)
        .map((player) => ({ playerId: player.id })),
    });
    match = requireMatch(await getMatch(database, id));
    expect([...matchTotals(match).values()].reduce((a, b) => a + b, 0)).toBe(0);
    await deleteRound(database, id, match.rounds[1].id);
    expect([
      ...matchTotals(requireMatch(await getMatch(database, id))).values(),
    ]).toEqual([-20, 10, 10, 0]);
  } finally {
    database.sqlite.close();
  }
});

test('preferences persist across closing and reopening the database', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'preferences-test-'));
  const filename = join(directory, 'matches.db');
  let database = new TestDatabase(filename);
  try {
    await migrateDatabase(database);
    expect(await readPreferences(database, 'ne')).toEqual({
      language: 'ne',
      numerals: 'latin',
      calendar: 'ad',
      keepAwake: true,
    });
    await writePreference(database, 'language', 'ne');
    await writePreference(database, 'numerals', 'devanagari');
    await writePreference(database, 'calendar', 'bs');
    await writePreference(database, 'keepAwake', false);
    database.sqlite.close();
    database = new TestDatabase(filename);
    await migrateDatabase(database);
    expect(await readPreferences(database, 'en')).toEqual({
      language: 'ne',
      numerals: 'devanagari',
      calendar: 'bs',
      keepAwake: false,
    });
  } finally {
    database.sqlite.close();
    unlinkSync(filename);
    rmdirSync(directory);
  }
});

test('removing an unplayed player deletes their row, seating gaps load and departed debts settle', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const id = await createMatch(database, ['A', 'B', 'C', 'D']);
    let match = requireMatch(await getMatch(database, id));
    await setPlayerActive(database, id, match.players[1].id, false);
    match = requireMatch(await getMatch(database, id));
    expect(match.players.map((player) => player.seat)).toEqual([0, 2, 3]);
    await saveRound(database, id, roundFor(match.players));
    const departed = match.players[2].id;
    await setPlayerActive(database, id, departed, false);
    match = requireMatch(await getMatch(database, id));
    const transfers = settleUp(
      [...matchTotals(match)].map(([playerId, points]) => ({
        playerId,
        paisa: points * 100,
      })),
    );
    expect(
      transfers.some(
        (transfer) => transfer.from === departed || transfer.to === departed,
      ),
    ).toBe(true);
  } finally {
    database.sqlite.close();
  }
});

test('v5 preference migration failure rolls back without changing v4 records', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const id = await createMatch(database, ['A', 'B']);
    await database.execAsync('PRAGMA user_version = 4;');
    await assert.rejects(migrateDatabase(database), /already exists/);
    expect(await database.getFirstAsync('PRAGMA user_version')).toEqual({
      user_version: 4,
    });
    expect(
      (await getMatch(database, id))?.players.map((player) => player.name),
    ).toEqual(['A', 'B']);
  } finally {
    database.sqlite.close();
  }
});

test('[4] roster limits and departed-name errors identify the required action', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const id = await createMatch(database, ['A', 'B', 'C', 'D', 'E']);
    let match = requireMatch(await getMatch(database, id));
    await saveRound(database, id, roundFor(match.players));
    await expect(addPlayer(database, id, 'F')).rejects.toMatchObject({
      code: 'ROSTER_FULL',
      message: '5 players are already at the table. Remove someone first.',
    });
    const departed = match.players[2].id;
    await setPlayerActive(database, id, departed, false);
    await expect(addPlayer(database, id, ' c ')).rejects.toMatchObject({
      code: 'PLAYER_DEPARTED',
      params: { name: 'C' },
    });
    await addPlayer(database, id, 'F');
    await expect(
      setPlayerActive(database, id, departed, true),
    ).rejects.toMatchObject({ code: 'ROSTER_FULL' });
    match = requireMatch(await getMatch(database, id));
    for (const player of match.players
      .filter((player) => player.active)
      .slice(2))
      await setPlayerActive(database, id, player.id, false);
    await expect(
      setPlayerActive(database, id, match.players[0].id, false),
    ).rejects.toMatchObject({
      code: 'ROSTER_MINIMUM',
      message: 'At least 2 players must stay in the match.',
    });
  } finally {
    database.sqlite.close();
  }
});

test('[5] undo removes orphaned departed players in the same transaction', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const id = await createMatch(database, ['A', 'B', 'C']);
    let match = requireMatch(await getMatch(database, id));
    const departed = match.players[2].id;
    await saveRound(database, id, roundFor(match.players));
    await saveRound(database, id, roundFor(match.players));
    await setPlayerActive(database, id, departed, false);
    match = requireMatch(await getMatch(database, id));
    await deleteRound(database, id, match.rounds[0].id);
    expect(
      (await getMatch(database, id))?.players.some(
        (player) => player.id === departed,
      ),
    ).toBe(true);
    await database.execAsync(
      "CREATE TRIGGER reject_cleanup BEFORE DELETE ON players BEGIN SELECT RAISE(ABORT, 'cleanup failed'); END;",
    );
    await expect(deleteRound(database, id, match.rounds[1].id)).rejects.toThrow(
      'cleanup failed',
    );
    expect((await getMatch(database, id))?.rounds).toHaveLength(1);
    await database.execAsync('DROP TRIGGER reject_cleanup;');
    await deleteRound(database, id, match.rounds[1].id);
    match = requireMatch(await getMatch(database, id));
    expect(match.rounds).toEqual([]);
    expect(match.players.map((player) => player.name)).toEqual(['A', 'B']);
    await addPlayer(database, id, 'C');
    const orphan = requireMatch(await getMatch(database, id)).players.find(
      (player) => player.name === 'C',
    )!;
    await database.runAsync(
      'UPDATE players SET active = 0 WHERE id = ?',
      orphan.id,
    );
    await setPlayerActive(database, id, orphan.id, false);
    expect(
      (await getMatch(database, id))?.players.map((player) => player.name),
    ).toEqual(['A', 'B']);
  } finally {
    database.sqlite.close();
  }
});

test('[6] failed writes keep preferences and readiness, expose a clearable error, and allow retry', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const configured: string[] = [];
    const store = new PreferenceStore(database, 'en', (preferences) =>
      configured.push(preferences.language),
    );
    await store.load();
    await database.execAsync(
      "CREATE TRIGGER reject_preference BEFORE INSERT ON app_preferences BEGIN SELECT RAISE(ABORT, 'disk full'); END;",
    );
    await expect(store.update('language', 'ne')).rejects.toThrow('disk full');
    expect(store.getSnapshot()).toMatchObject({
      ready: true,
      preferences: defaultPreferences,
      readError: null,
      preferenceError: expect.objectContaining({ message: 'disk full' }),
    });
    expect(configured).toEqual(['en']);
    store.clearPreferenceError();
    expect(store.getSnapshot().preferenceError).toBeNull();
    await database.execAsync('DROP TRIGGER reject_preference;');
    await store.update('language', 'ne');
    expect(store.getSnapshot()).toMatchObject({
      ready: true,
      preferences: { language: 'ne' },
      preferenceError: null,
    });
    expect((await readPreferences(database, 'en')).language).toBe('ne');
  } finally {
    database.sqlite.close();
  }
});

test('[6] initial read errors remain separate and retry loads the app', async () => {
  const database = new TestDatabase();
  try {
    const store = new PreferenceStore(database, 'ne', () => {});
    await store.load();
    expect(store.getSnapshot()).toMatchObject({
      ready: false,
      readError: expect.objectContaining({
        message: expect.stringContaining('no such table'),
      }),
      preferenceError: null,
    });
    await migrateDatabase(database);
    await store.load();
    expect(store.getSnapshot()).toMatchObject({
      ready: true,
      readError: null,
      preferences: { language: 'ne' },
    });
  } finally {
    database.sqlite.close();
  }
});

test('[9] v6 clears only exact historical auto titles and preserves custom titles and scores', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const date = new Date(2026, 10, 2, 12);
    const titles: string[] = [];
    for (const language of ['en', 'ne'] as const)
      for (const calendar of ['ad', 'bs'] as const)
        for (const numerals of ['latin', 'devanagari'] as const)
          titles.push(
            formatDate(date, {
              ...defaultPreferences,
              language,
              calendar,
              numerals,
            }),
          );
    titles.push(
      `${date.toLocaleDateString('en-GB', { weekday: 'short' })}, ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      'Family game',
      ' ' + titles[0],
    );
    const ids: number[] = [];
    for (const title of titles) {
      const id = await createMatch(database, ['A', 'B'], title);
      await database.runAsync(
        'UPDATE matches SET created_at = ?, title = ? WHERE id = ?',
        date.toISOString(),
        title,
        id,
      );
      const match = requireMatch(await getMatch(database, id));
      await saveRound(database, id, roundFor(match.players));
      ids.push(id);
    }
    await database.execAsync('PRAGMA user_version = 5;');
    await migrateDatabase(database);
    expect(await database.getFirstAsync('PRAGMA user_version')).toEqual({
      user_version: 6,
    });
    for (const [index, id] of ids.entries()) {
      const match = requireMatch(await getMatch(database, id));
      expect(match.title).toBe(index < titles.length - 2 ? '' : titles[index]);
      expect([...matchTotals(match).values()]).toEqual([6, -6]);
    }
    await migrateDatabase(database);
    expect((await getMatch(database, ids[0]))?.title).toBe('');
  } finally {
    database.sqlite.close();
  }
});

test('[9] untitled matches follow current language/calendar without rewriting stored titles', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    configureI18n(defaultPreferences);
    const id = await createMatch(database, ['A', 'B']);
    await database.runAsync(
      'UPDATE matches SET created_at = ? WHERE id = ?',
      new Date(2026, 10, 2, 12).toISOString(),
      id,
    );
    const match = requireMatch(await getMatch(database, id));
    expect(match.title).toBe('');
    expect(displayMatchTitle(match)).toBe('2 Nov 2026');
    configureI18n({
      ...defaultPreferences,
      language: 'ne',
      numerals: 'devanagari',
      calendar: 'bs',
    });
    expect(displayMatchTitle(match)).toBe('कार्तिक १६, २०८३');
    expect(displayMatchTitle({ ...match, title: 'My game' })).toBe('My game');
    expect((await getMatch(database, id))?.title).toBe('');
  } finally {
    database.sqlite.close();
  }
});

test('[9] failed v6 migration rolls title changes and schema version back', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const date = new Date(2026, 10, 2, 12);
    const title = formatDate(date, defaultPreferences);
    const first = await createMatch(database, ['A', 'B'], title);
    const second = await createMatch(database, ['C', 'D'], title);
    await database.runAsync(
      'UPDATE matches SET created_at = ?',
      date.toISOString(),
    );
    await database.execAsync(
      `CREATE TRIGGER reject_title BEFORE UPDATE ON matches WHEN OLD.id = ${second} BEGIN SELECT RAISE(ABORT, 'title update failed'); END; PRAGMA user_version = 5;`,
    );
    await expect(migrateDatabase(database)).rejects.toThrow(
      'title update failed',
    );
    expect(await database.getFirstAsync('PRAGMA user_version')).toEqual({
      user_version: 5,
    });
    expect((await getMatch(database, first))?.title).toBe(title);
  } finally {
    database.sqlite.close();
  }
});

test('[10] one corrupt match returns an unavailable entry without hiding healthy matches', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const healthy = await createMatch(database, ['A', 'B']);
    const corrupt = await createMatch(database, ['C', 'D']);
    const match = requireMatch(await getMatch(database, corrupt));
    await saveRound(database, corrupt, roundFor(match.players));
    await database.runAsync(
      'UPDATE rounds SET inputs_json = ? WHERE match_id = ?',
      '{broken',
      corrupt,
    );
    const result = await listMatches(database);
    expect(result.matches.map((match) => match.id)).toEqual([healthy]);
    expect(result.unavailable).toHaveLength(1);
    expect(result.unavailable[0].error).toBeInstanceOf(AppError);
    expect(result.unavailable[0]).toMatchObject({
      id: corrupt,
      error: expect.any(Error),
    });
    await expect(getMatch(database, corrupt)).rejects.toThrow();
  } finally {
    database.sqlite.close();
  }
});

test('[11] preference configuration precedes publication and queued writes merge values', async () => {
  const database = new TestDatabase();
  try {
    await migrateDatabase(database);
    const events: string[] = [];
    const store = new PreferenceStore(database, 'en', (preferences) =>
      events.push(`configure:${preferences.language}:${preferences.calendar}`),
    );
    await store.load();
    store.subscribe(() => {
      const { preferences } = store.getSnapshot();
      events.push(`publish:${preferences.language}:${preferences.calendar}`);
    });
    events.length = 0;
    await Promise.all([
      store.update('language', 'ne'),
      store.update('calendar', 'bs'),
    ]);
    expect(events).toEqual([
      'configure:ne:ad',
      'publish:ne:ad',
      'configure:ne:bs',
      'publish:ne:bs',
    ]);
    expect(store.getSnapshot().preferences).toMatchObject({
      language: 'ne',
      calendar: 'bs',
    });
  } finally {
    database.sqlite.close();
  }
});
