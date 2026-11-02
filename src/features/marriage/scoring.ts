import { t } from '../../i18n';
export const currentRuleVersion = 'marriage-v1';

export interface MatchSettings {
  seenFee: number;
  unseenFee: number;
  dubleeExtra: number;
  moneyRate: number | null;
  foulMode: 'perPlayer' | 'fixedTotal';
  foulPenalty: number;
}
export const defaultSettings: Readonly<MatchSettings> = {
  seenFee: 3,
  unseenFee: 10,
  dubleeExtra: 5,
  moneyRate: null,
  foulMode: 'perPlayer',
  foulPenalty: 10,
};
export function parseSettings(value: unknown): MatchSettings {
  if (typeof value !== 'object' || value === null)
    throw new Error(t('Enter valid match settings.'));
  const settings = value as Record<string, unknown>;
  for (const key of ['seenFee', 'unseenFee', 'dubleeExtra']) {
    const fee = settings[key];
    if (typeof fee !== 'number' || !Number.isSafeInteger(fee) || fee < 0)
      throw new Error(t('Enter fees as whole numbers of 0 or more.'));
  }
  const foulMode = settings.foulMode ?? 'perPlayer';
  const foulPenalty = settings.foulPenalty ?? 10;
  if (
    !['perPlayer', 'fixedTotal'].includes(String(foulMode)) ||
    typeof foulPenalty !== 'number' ||
    !Number.isSafeInteger(foulPenalty) ||
    foulPenalty < 0
  )
    throw new Error(
      t('Enter a valid foul mode and whole-number penalty of 0 or more.'),
    );
  const rate = settings.moneyRate;
  if (
    rate !== null &&
    (typeof rate !== 'number' ||
      !Number.isFinite(rate) ||
      rate <= 0 ||
      !Number.isSafeInteger(Math.round(rate * 100)) ||
      Math.abs(rate * 100 - Math.round(rate * 100)) > 0.000001)
  )
    throw new Error(
      t('Enter a positive Rs rate with up to two decimal places.'),
    );
  return {
    foulMode: foulMode as MatchSettings['foulMode'],
    foulPenalty,
    seenFee: Number(settings.seenFee),
    unseenFee: Number(settings.unseenFee),
    dubleeExtra: Number(settings.dubleeExtra),
    moneyRate: rate as number | null,
  };
}
export function scoreRound(
  input: MarriageRoundInput,
  ruleVersion = currentRuleVersion,
  settings: MatchSettings = defaultSettings,
): PlayerScore[] {
  if (ruleVersion !== currentRuleVersion)
    throw new Error(t('Update the app to open this match.'));
  return calculateMarriageRound(input, settings);
}

export type MarriageRoundInput = NormalRoundInput | FoulRoundInput;
export interface FoulRoundInput {
  kind: 'foul';
  offenderId: number;
  players: { playerId: number }[];
  penalty?: number;
  mode?: 'perPlayer' | 'fixedTotal';
}
export interface NormalRoundInput {
  kind?: 'normal';
  winnerId: number;
  dubleeWin: boolean;
  players: { playerId: number; maal: number; seen: boolean }[];
}

export interface PlayerScore {
  playerId: number;
  points: number;
}

export function validateMarriagePlayerCount(count: number) {
  if (!Number.isInteger(count) || count < 2 || count > 5) {
    throw new Error(t('Choose 2 to 5 players.'));
  }
}

// Apply the user-approved Seen-only maal exchange and per-match finish fees.
// Maal is the eligible total entered by the table, not a count of individual cards.
export function calculateMarriageRound(
  input: MarriageRoundInput,
  settings: MatchSettings = defaultSettings,
): PlayerScore[] {
  if (input.kind === 'foul') return calculateFoulRound(input);
  const fees = parseSettings(settings);
  validateMarriagePlayerCount(input.players.length);
  const ids = new Set(input.players.map((player) => player.playerId));
  if (ids.size !== input.players.length || !ids.has(input.winnerId)) {
    throw new Error(t('Choose one winner from the round’s distinct players.'));
  }
  for (const player of input.players) {
    if (
      !Number.isSafeInteger(player.playerId) ||
      player.playerId < 1 ||
      !Number.isSafeInteger(player.maal) ||
      player.maal < 0 ||
      typeof player.seen !== 'boolean'
    ) {
      throw new Error(t('Enter maal as a whole number of 0 or more.'));
    }
  }
  if (
    typeof input.dubleeWin !== 'boolean' ||
    !input.players.find((player) => player.playerId === input.winnerId)?.seen
  ) {
    throw new Error(t('The winner must be Seen.'));
  }
  const totalMaal = input.players.reduce(
    (sum, player) => sum + (player.seen ? player.maal : 0),
    0,
  );
  // Keep intermediate multiplication and accumulated payments exact as well.
  const maximumFinishPayments =
    input.players.length *
    (Math.max(fees.seenFee, fees.unseenFee) + fees.dubleeExtra);
  const safeTotal = Math.floor(
    (Number.MAX_SAFE_INTEGER - maximumFinishPayments) / input.players.length,
  );
  if (
    !Number.isSafeInteger(maximumFinishPayments) ||
    !Number.isSafeInteger(totalMaal) ||
    totalMaal > safeTotal
  ) {
    throw new Error(t('Maal totals are too large to calculate safely.'));
  }
  let winnerPoints = 0;
  const scores = input.players.map((player) => {
    if (player.playerId === input.winnerId)
      return { playerId: player.playerId, points: 0 };
    const payment =
      totalMaal +
      (player.seen ? fees.seenFee : fees.unseenFee) +
      (input.dubleeWin ? fees.dubleeExtra : 0) -
      input.players.length * (player.seen ? player.maal : 0);
    winnerPoints += payment;
    return { playerId: player.playerId, points: -payment };
  });
  const result = scores.map((score) =>
    score.playerId === input.winnerId
      ? { ...score, points: winnerPoints }
      : score,
  );
  if (
    !Number.isSafeInteger(totalMaal) ||
    result.some((score) => !Number.isSafeInteger(score.points))
  ) {
    throw new Error(t('Maal totals are too large to calculate safely.'));
  }
  return result;
}

export function calculateFoulRound(input: FoulRoundInput): PlayerScore[] {
  validateMarriagePlayerCount(input.players.length);
  const ids = input.players.map((player) => player.playerId);
  if (
    new Set(ids).size !== ids.length ||
    ids.some((id) => !Number.isSafeInteger(id) || id < 1) ||
    !ids.includes(input.offenderId)
  )
    throw new Error(
      t('Choose an offender from the round’s distinct participants.'),
    );
  const { penalty, mode } = input;
  if (
    typeof penalty !== 'number' ||
    !Number.isSafeInteger(penalty) ||
    penalty < 0 ||
    !['perPlayer', 'fixedTotal'].includes(String(mode))
  )
    throw new Error(t('Saved foul penalty or mode is invalid.'));
  const others = ids.filter((id) => id !== input.offenderId);
  const total = mode === 'perPlayer' ? penalty * others.length : penalty;
  if (!Number.isSafeInteger(total))
    throw new Error(t('Foul penalty is too large to calculate safely.'));
  return ids.map((playerId) => ({
    playerId,
    points:
      playerId === input.offenderId
        ? -total
        : mode === 'perPlayer'
          ? penalty
          : Math.floor(penalty / others.length) +
            (others.indexOf(playerId) < penalty % others.length ? 1 : 0),
  }));
}

export function parseRoundInput(value: unknown): MarriageRoundInput {
  if (typeof value === 'object' && value !== null && 'kind' in value) {
    if (value.kind === 'foul') {
      const foul = value as FoulRoundInput;
      if (!Array.isArray(foul.players))
        throw new Error(t('Saved round inputs are invalid.'));
      const input: FoulRoundInput = {
        kind: 'foul',
        offenderId: foul.offenderId,
        players: foul.players.map((player: unknown) => {
          if (
            typeof player !== 'object' ||
            player === null ||
            !('playerId' in player) ||
            typeof player.playerId !== 'number'
          )
            throw new Error(t('Saved player round inputs are invalid.'));
          return { playerId: player.playerId };
        }),
        penalty: foul.penalty,
        mode: foul.mode,
      };
      calculateFoulRound(input);
      return input;
    }
    if (value.kind !== 'normal')
      throw new Error(t('Saved round kind is invalid.'));
  }
  if (
    typeof value !== 'object' ||
    value === null ||
    !('players' in value) ||
    !Array.isArray(value.players) ||
    !('winnerId' in value) ||
    typeof value.winnerId !== 'number' ||
    !('dubleeWin' in value) ||
    typeof value.dubleeWin !== 'boolean'
  ) {
    throw new Error(t('Saved round inputs are invalid.'));
  }
  const players = value.players.map((player: unknown) => {
    if (
      typeof player !== 'object' ||
      player === null ||
      !('playerId' in player) ||
      typeof player.playerId !== 'number' ||
      !('maal' in player) ||
      typeof player.maal !== 'number' ||
      !('seen' in player) ||
      typeof player.seen !== 'boolean'
    ) {
      throw new Error(t('Saved player round inputs are invalid.'));
    }
    return { playerId: player.playerId, maal: player.maal, seen: player.seen };
  });
  const input = {
    winnerId: value.winnerId,
    dubleeWin: value.dubleeWin,
    players,
  };
  calculateMarriageRound(input);
  return input;
}
