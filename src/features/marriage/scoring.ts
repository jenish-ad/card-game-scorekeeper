export const marriageRuleVersion = 'pagat-base-v1';

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
    throw new Error('This Marriage preset requires 2 to 5 players.');
  }
}

// Settlement follows https://www.pagat.com/rummy/marriage.html#scoring.
// Maal is the eligible total entered by the table, not a count of individual cards.
export function calculateMarriageRound(
  input: MarriageRoundInput,
): PlayerScore[] {
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
      throw new Error(
        'Each player needs a valid ID, a nonnegative whole-number maal total, and seen status.',
      );
    }
  }
  if (
    typeof input.dubleeWin !== 'boolean' ||
    !input.players.find((player) => player.playerId === input.winnerId)?.seen
  ) {
    throw new Error(
      'The winner must have seen the joker. Choose a normal or dublee finish.',
    );
  }
  const totalMaal = input.players.reduce((sum, player) => sum + player.maal, 0);
  // Keep intermediate multiplication and accumulated payments exact as well.
  const maximumFinishPayments = input.players.length * 15;
  const safeTotal = Math.floor(
    (Number.MAX_SAFE_INTEGER - maximumFinishPayments) / input.players.length,
  );
  if (!Number.isSafeInteger(totalMaal) || totalMaal > safeTotal) {
    throw new Error('Maal totals are too large to calculate safely.');
  }
  let winnerPoints = 0;
  const scores = input.players.map((player) => {
    if (player.playerId === input.winnerId)
      return { playerId: player.playerId, points: 0 };
    const payment =
      totalMaal +
      (player.seen ? 3 : 10) +
      (input.dubleeWin ? 5 : 0) -
      input.players.length * player.maal;
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
