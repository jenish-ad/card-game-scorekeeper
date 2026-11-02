import { AppError, type ErrorCode } from '../../errors';
import type { MatchConnection, MatchDatabase } from '../../storage/database';
import {
  currentRuleVersion,
  scoreRound,
  defaultSettings,
  parseSettings,
  type MatchSettings,
  parseRoundInput,
  validateMarriagePlayerCount,
  type MarriageRoundInput,
} from './scoring';
import { validatePlayerNames } from './playerNames';

export interface SavedPlayer {
  id: number;
  name: string;
  seat: number;
  active: boolean;
}
export interface SavedRound {
  id: number;
  createdAt: string;
  input: MarriageRoundInput;
}
export interface SavedMatch {
  id: number;
  title: string;
  settings: MatchSettings;
  ruleVersion: string;
  createdAt: string;
  finishedAt: string | null;
  players: SavedPlayer[];
  rounds: SavedRound[];
}

function parseSavedJson(value: string, code: ErrorCode): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new AppError(code);
  }
}
function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null)
    throw new AppError('SAVED_MATCH_RECORD_IS_INVALID');
  return value as Record<string, unknown>;
}
function positiveId(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1)
    throw new AppError('SAVED_MATCH_OR_PLAYER_ID_IS_INVALID');
  return value;
}
function timestamp(value: unknown): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)))
    throw new AppError('SAVED_MATCH_DATE_IS_INVALID');
  return value;
}

export async function createMatch(
  database: MatchDatabase,
  names: readonly string[],
  title = '',
  ruleVersion = currentRuleVersion,
  settings: MatchSettings = defaultSettings,
): Promise<number> {
  if (title.trim().length > 80)
    throw new AppError('ENTER_A_MATCH_TITLE_OF_1_TO_80_CHARACTERS');
  if (ruleVersion !== currentRuleVersion)
    throw new AppError('UPDATE_THE_APP_TO_OPEN_THIS_MATCH');
  const matchSettings = parseSettings(settings);
  const validation = validatePlayerNames(names);
  if (!validation.ok) throw validation.error;
  validateMarriagePlayerCount(validation.playerNames.length);
  let matchId = 0;
  await database.withExclusiveTransactionAsync(async (transaction) => {
    const result = await transaction.runAsync(
      'INSERT INTO matches (game, rule_version, created_at, title, settings_json) VALUES (?, ?, ?, ?, ?)',
      'marriage',
      ruleVersion,
      new Date().toISOString(),
      title.trim(),
      JSON.stringify(matchSettings),
    );
    matchId = result.lastInsertRowId;
    for (const [seat, name] of validation.playerNames.entries()) {
      await transaction.runAsync(
        'INSERT INTO players (match_id, name, seat) VALUES (?, ?, ?)',
        matchId,
        name,
        seat,
      );
    }
  });
  return matchId;
}

export async function getMatch(
  database: MatchConnection,
  id: number,
): Promise<SavedMatch | null> {
  positiveId(id);
  const storedMatch = await database.getFirstAsync<unknown>(
    'SELECT * FROM matches WHERE id = ?',
    id,
  );
  if (!storedMatch) return null;
  const match = record(storedMatch);
  if (match.game !== 'marriage' || match.rule_version !== currentRuleVersion)
    throw new AppError('UPDATE_THE_APP_TO_OPEN_THIS_MATCH');
  const settings = parseSettings(
    parseSavedJson(String(match.settings_json), 'ENTER_VALID_MATCH_SETTINGS'),
  );
  const playerRows = await database.getAllAsync<unknown>(
    'SELECT * FROM players WHERE match_id = ? ORDER BY seat',
    id,
  );
  const players = playerRows.map((row) => {
    const player = record(row);
    if (
      typeof player.name !== 'string' ||
      !Number.isSafeInteger(player.seat) ||
      Number(player.seat) < 0 ||
      ![0, 1].includes(Number(player.active))
    )
      throw new AppError('SAVED_PLAYER_NAMES_OR_SEATING_ORDER_ARE_INVALID');
    return {
      id: positiveId(player.id),
      name: player.name,
      seat: Number(player.seat),
      active: player.active === 1,
    };
  });
  validateMarriagePlayerCount(players.filter((player) => player.active).length);
  const validation = validatePlayerNames(players.map((player) => player.name));
  if (!validation.ok) throw validation.error;
  const roundRows = await database.getAllAsync<unknown>(
    'SELECT * FROM rounds WHERE match_id = ? ORDER BY id',
    id,
  );
  const rounds = roundRows.map((row) => {
    const round = record(row);
    if (
      round.rule_version !== match.rule_version ||
      typeof round.inputs_json !== 'string'
    )
      throw new AppError('UPDATE_THE_APP_TO_OPEN_THIS_MATCH');
    const input = parseRoundInput(
      parseSavedJson(round.inputs_json, 'SAVED_ROUND_INPUTS_ARE_INVALID'),
    );
    scoreRound(input, String(match.rule_version), settings);
    validateRoundPlayers(players, input, undefined, true);
    return {
      id: positiveId(round.id),
      createdAt: timestamp(round.created_at),
      input,
    };
  });
  const savedMatch = {
    id: positiveId(match.id),
    settings,
    title: typeof match.title === 'string' ? match.title : '',
    ruleVersion: String(match.rule_version),
    createdAt: timestamp(match.created_at),
    finishedAt:
      match.finished_at === null ? null : timestamp(match.finished_at),
    players,
    rounds,
  };
  matchTotals(savedMatch);
  return savedMatch;
}

export interface UnavailableMatch {
  id: number;
  error: unknown;
}
export async function listMatches(
  database: MatchConnection,
): Promise<{ matches: SavedMatch[]; unavailable: UnavailableMatch[] }> {
  const rows = await database.getAllAsync<{ id: number }>(
    'SELECT id FROM matches ORDER BY id DESC',
  );
  const matches: SavedMatch[] = [];
  const unavailable: UnavailableMatch[] = [];
  for (const row of rows) {
    try {
      const match = await getMatch(database, row.id);
      if (match) matches.push(match);
    } catch (error) {
      unavailable.push({ id: row.id, error });
    }
  }
  return { matches, unavailable };
}

export function validateRoundPlayers(
  players: SavedPlayer[],
  input: MarriageRoundInput,
  original?: MarriageRoundInput,
  historical = false,
) {
  validateMarriagePlayerCount(input.players.length);
  if (
    input.players.some(
      (entry) => !players.some((player) => player.id === entry.playerId),
    )
  )
    throw new AppError('EVERY_PLAYER_IN_THE_ROUND_MUST_BELONG_TO_THIS_MATCH');
  if (original) {
    const ids = new Set(original.players.map((entry) => entry.playerId));
    if (
      ids.size !== input.players.length ||
      input.players.some((entry) => !ids.has(entry.playerId))
    )
      throw new AppError('KEEP_THE_ORIGINAL_PARTICIPANTS_WHEN_EDITING_A_ROUND');
  } else if (
    !historical &&
    input.players.some(
      (entry) =>
        !players.find((player) => player.id === entry.playerId)?.active,
    )
  ) {
    throw new AppError('NEW_ROUNDS_MAY_ONLY_INCLUDE_ACTIVE_PLAYERS');
  }
}

export async function addPlayer(
  database: MatchDatabase,
  matchId: number,
  name: string,
) {
  await database.withExclusiveTransactionAsync(async (transaction) => {
    const match = await requireActiveMatch(transaction, matchId);
    const departed = match.players.find(
      (player) =>
        !player.active &&
        player.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (departed)
      throw new AppError('PLAYER_DEPARTED', { name: departed.name });
    if (match.players.filter((player) => player.active).length >= 5)
      throw new AppError('ROSTER_FULL');
    const validation = validatePlayerNames([
      ...match.players.map((player) => player.name),
      name,
    ]);
    if (!validation.ok) throw validation.error;
    const seat = Math.max(...match.players.map((player) => player.seat)) + 1;
    await transaction.runAsync(
      'INSERT INTO players (match_id, name, seat, active, joined_at) VALUES (?, ?, ?, 1, ?)',
      matchId,
      name.trim(),
      seat,
      new Date().toISOString(),
    );
  });
}

export async function setPlayerActive(
  database: MatchDatabase,
  matchId: number,
  playerId: number,
  active: boolean,
) {
  await database.withExclusiveTransactionAsync(async (transaction) => {
    const match = await requireActiveMatch(transaction, matchId);
    const player = match.players.find((entry) => entry.id === playerId);
    if (!player) throw new AppError('THIS_PLAYER_DOES_NOT_BELONG_TO_THE_MATCH');
    const played = match.rounds.some((round) =>
      round.input.players.some((entry) => entry.playerId === playerId),
    );
    if (player.active === active && (active || played)) return;
    const activeCount = match.players.filter((entry) => entry.active).length;
    if (active && activeCount >= 5) throw new AppError('ROSTER_FULL');
    if (!active && player.active && activeCount <= 2)
      throw new AppError('ROSTER_MINIMUM');
    if (!active && !played) {
      await transaction.runAsync(
        'DELETE FROM players WHERE match_id = ? AND id = ?',
        matchId,
        playerId,
      );
    } else {
      await transaction.runAsync(
        'UPDATE players SET active = ? WHERE match_id = ? AND id = ?',
        active ? 1 : 0,
        matchId,
        playerId,
      );
    }
  });
}

async function requireActiveMatch(database: MatchConnection, matchId: number) {
  const match = await getMatch(database, matchId);
  if (!match) throw new AppError('THIS_MATCH_NO_LONGER_EXISTS');
  if (match.finishedAt)
    throw new AppError('REOPEN_THE_MATCH_BEFORE_CHANGING_ITS_ROUNDS');
  return match;
}

export async function saveRound(
  database: MatchDatabase,
  matchId: number,
  input: MarriageRoundInput,
  roundId?: number,
) {
  // Capture canonical values before awaiting so UI edits cannot change an in-flight save.
  const captured = JSON.parse(JSON.stringify(input)) as MarriageRoundInput;
  await database.withExclusiveTransactionAsync(async (transaction) => {
    const match = await requireActiveMatch(transaction, matchId);
    const originalFoul =
      roundId === undefined
        ? undefined
        : match.rounds.find((round) => round.id === roundId)?.input;
    const canonicalInput = parseRoundInput(
      captured.kind === 'foul'
        ? {
            ...captured,
            players: [...captured.players].sort(
              (a, b) =>
                (match.players.find((p) => p.id === a.playerId)?.seat ?? 0) -
                (match.players.find((p) => p.id === b.playerId)?.seat ?? 0),
            ),
            penalty:
              originalFoul?.kind === 'foul'
                ? originalFoul.penalty
                : match.settings.foulPenalty,
            mode:
              originalFoul?.kind === 'foul'
                ? originalFoul.mode
                : match.settings.foulMode,
          }
        : captured,
    );
    scoreRound(canonicalInput, match.ruleVersion, match.settings);
    const original =
      roundId === undefined
        ? undefined
        : match.rounds.find((round) => round.id === roundId);
    if (roundId !== undefined && !original)
      throw new AppError('THIS_ROUND_NO_LONGER_EXISTS_RELOAD_THE_MATCH');
    validateRoundPlayers(match.players, canonicalInput, original?.input);
    const nextRounds =
      roundId === undefined
        ? [...match.rounds, { input: canonicalInput }]
        : match.rounds.map((round) =>
            round.id === roundId ? { ...round, input: canonicalInput } : round,
          );
    matchTotals({ ...match, rounds: nextRounds });
    if (roundId !== undefined) {
      const result = await transaction.runAsync(
        'UPDATE rounds SET inputs_json = ?, rule_version = ? WHERE id = ? AND match_id = ?',
        JSON.stringify(canonicalInput),
        match.ruleVersion,
        positiveId(roundId),
        matchId,
      );
      if (result.changes !== 1)
        throw new AppError('THIS_ROUND_NO_LONGER_EXISTS_RELOAD_THE_MATCH');
    } else {
      await transaction.runAsync(
        'INSERT INTO rounds (match_id, rule_version, inputs_json, created_at) VALUES (?, ?, ?, ?)',
        matchId,
        match.ruleVersion,
        JSON.stringify(canonicalInput),
        new Date().toISOString(),
      );
    }
  });
}

export async function deleteRound(
  database: MatchDatabase,
  matchId: number,
  roundId: number,
) {
  await database.withExclusiveTransactionAsync(async (transaction) => {
    const match = await requireActiveMatch(transaction, matchId);
    const result = await transaction.runAsync(
      'DELETE FROM rounds WHERE id = ? AND match_id = ?',
      positiveId(roundId),
      matchId,
    );
    if (result.changes !== 1)
      throw new AppError('THIS_ROUND_NO_LONGER_EXISTS_RELOAD_THE_MATCH');
    const remainingIds = new Set(
      match.rounds
        .filter((round) => round.id !== roundId)
        .flatMap((round) =>
          round.input.players.map((player) => player.playerId),
        ),
    );
    for (const player of match.players) {
      if (!player.active && !remainingIds.has(player.id))
        await transaction.runAsync(
          'DELETE FROM players WHERE match_id = ? AND id = ?',
          matchId,
          player.id,
        );
    }
  });
}

export async function setMatchFinished(
  database: MatchDatabase,
  matchId: number,
  finished: boolean,
) {
  await database.withExclusiveTransactionAsync(async (transaction) => {
    const match = await getMatch(transaction, matchId);
    if (!match) throw new AppError('THIS_MATCH_NO_LONGER_EXISTS');
    await transaction.runAsync(
      'UPDATE matches SET finished_at = ? WHERE id = ?',
      finished ? new Date().toISOString() : null,
      matchId,
    );
  });
}

export function matchTotals(match: {
  ruleVersion?: string;
  settings?: MatchSettings;
  players: readonly SavedPlayer[];
  rounds: readonly { input: MarriageRoundInput }[];
}) {
  const totals = new Map(match.players.map((player) => [player.id, 0]));
  for (const round of match.rounds) {
    for (const score of scoreRound(
      round.input,
      match.ruleVersion ?? currentRuleVersion,
      match.settings ?? defaultSettings,
    )) {
      const total = (totals.get(score.playerId) ?? 0) + score.points;
      if (!Number.isSafeInteger(total))
        throw new AppError('MATCH_TOTALS_ARE_TOO_LARGE_TO_CALCULATE_SAFELY');
      totals.set(score.playerId, total);
    }
  }
  const rate = match.settings?.moneyRate;
  if (
    rate !== null &&
    rate !== undefined &&
    [...totals.values()].some(
      (total) => !Number.isSafeInteger(total * Math.round(rate * 100)),
    )
  )
    throw new AppError('THE_RS_AMOUNT_IS_TOO_LARGE_USE_A_LOWER_RATE');
  return totals;
}
