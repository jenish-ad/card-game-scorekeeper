export const currentRuleVersion = 'marriage-v1';

export interface MatchSettings {
  seenFee: number;
  unseenFee: number;
  dubleeExtra: number;
  moneyRate: number | null;
}
export const defaultSettings: Readonly<MatchSettings> = {
  seenFee: 3,
  unseenFee: 10,
  dubleeExtra: 5,
  moneyRate: null,
};
export function parseSettings(value: unknown): MatchSettings {
  if (typeof value !== 'object' || value === null)
    throw new Error('Enter valid match settings.');
  const settings = value as Record<string, unknown>;
  for (const key of ['seenFee', 'unseenFee', 'dubleeExtra']) {
    const fee = settings[key];
    if (typeof fee !== 'number' || !Number.isSafeInteger(fee) || fee < 0)
      throw new Error('Enter fees as whole numbers of 0 or more.');
  }
  const rate = settings.moneyRate;
  if (
    rate !== null &&
    (typeof rate !== 'number' ||
      !Number.isFinite(rate) ||
      rate <= 0 ||
      !Number.isSafeInteger(Math.round(rate * 100)) ||
      Math.abs(rate * 100 - Math.round(rate * 100)) > 0.000001)
  )
    throw new Error('Enter a positive Rs rate with up to two decimal places.');
  return {
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
    throw new Error('Update the app to open this match.');
  return calculateMarriageRound(input, settings);
}

export interface MarriageRoundInput {
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
    throw new Error('Choose 2 to 5 players.');
  }
}

// Apply the user-approved Seen-only maal exchange and per-match finish fees.
// Maal is the eligible total entered by the table, not a count of individual cards.
export function calculateMarriageRound(
  input: MarriageRoundInput,
  settings: MatchSettings = defaultSettings,
): PlayerScore[] {
  const fees = parseSettings(settings);
  validateMarriagePlayerCount(input.players.length);
  const ids = new Set(input.players.map((player) => player.playerId));
  if (ids.size !== input.players.length || !ids.has(input.winnerId)) {
    throw new Error('Choose one winner from the round’s distinct players.');
  }
  for (const player of input.players) {
    if (
      !Number.isSafeInteger(player.playerId) ||
      player.playerId < 1 ||
      !Number.isSafeInteger(player.maal) ||
      player.maal < 0 ||
      typeof player.seen !== 'boolean'
    ) {
      throw new Error('Enter maal as a whole number of 0 or more.');
    }
  }
  if (
    typeof input.dubleeWin !== 'boolean' ||
    !input.players.find((player) => player.playerId === input.winnerId)?.seen
  ) {
    throw new Error('The winner must be Seen.');
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
    throw new Error('Maal totals are too large to calculate safely.');
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
    throw new Error('Maal totals are too large to calculate safely.');
  }
  return result;
}

export function parseRoundInput(value: unknown): MarriageRoundInput {
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
    throw new Error('Saved round inputs are invalid.');
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
      throw new Error('Saved player round inputs are invalid.');
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
