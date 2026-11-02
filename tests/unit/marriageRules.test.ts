import { test, expect } from '@jest/globals';
import {
  calculateMarriageRound,
  scoreRound,
  currentRuleVersion,
} from '@/features/marriage/domain/scoring';
import type { MarriageRoundInput } from '@/features/marriage/domain/scoring';

const example: MarriageRoundInput = {
  winnerId: 1,
  dubleeWin: false,
  players: [
    { playerId: 1, maal: 5, seen: true },
    { playerId: 2, maal: 2, seen: true },
    { playerId: 3, maal: 0, seen: false },
  ],
};

test('Sita +21, Ram −4, Hari −17; the normal round balances to zero', () => {
  const result = calculateMarriageRound(example);
  expect(result.map((score) => score.points)).toEqual([21, -4, -17]);
  expect(result.reduce((sum, score) => sum + score.points, 0)).toBe(0);
});

test('unseen maal is ignored without mutating canonical inputs', () => {
  const input = {
    ...example,
    players: example.players.map((player) => ({
      ...player,
      maal: player.seen ? player.maal : 9,
    })),
  };
  expect(calculateMarriageRound(input)).toEqual(
    calculateMarriageRound(example),
  );
  expect(input.players[2].maal).toBe(9);
  expect(scoreRound(input, currentRuleVersion)).toEqual(
    calculateMarriageRound(example),
  );
});

test('Dublee applies the default extra fee', () => {
  const input = { ...example, dubleeWin: true };
  expect(calculateMarriageRound(input).map((score) => score.points)).toEqual([
    31, -9, -22,
  ]);
  expect(
    scoreRound(input, currentRuleVersion).map((score) => score.points),
  ).toEqual([31, -9, -22]);
});

test('rejects invalid winners, negative/fractional maal, duplicates and unsafe inputs', () => {
  for (const input of [
    { ...example, winnerId: 3 },
    { ...example, winnerId: 99 },
    { ...example, players: [example.players[0], example.players[0]] },
    ...[-1, 1.2, NaN, Infinity, Number.MAX_SAFE_INTEGER].map((maal) => ({
      ...example,
      players: example.players.map((entry) => ({ ...entry, maal })),
    })),
  ])
    expect(() => calculateMarriageRound(input)).toThrow();
});

test('conserves points for every supported player count and winner position', () => {
  for (let count = 2; count <= 5; count++) {
    for (let winnerId = 1; winnerId <= count; winnerId++) {
      const input = {
        winnerId,
        dubleeWin: false,
        players: Array.from({ length: count }, (_, index) => ({
          playerId: index + 1,
          maal: index * 7,
          seen: index + 1 === winnerId || index % 2 === 0,
        })),
      };
      const scores = calculateMarriageRound(input);
      expect(scores.reduce((sum, score) => sum + score.points, 0)).toBe(0);
      expect(
        calculateMarriageRound({
          ...input,
          players: [...input.players].reverse(),
        }).reverse(),
      ).toEqual(scores);
    }
  }
});

test('winner may lose points, zero maal settles finish payments, and zero results are supported', () => {
  expect(
    calculateMarriageRound({
      winnerId: 1,
      dubleeWin: false,
      players: [
        { playerId: 1, maal: 0, seen: true },
        { playerId: 2, maal: 20, seen: true },
      ],
    }).map((entry) => entry.points),
  ).toEqual([-17, 17]);
  expect(
    calculateMarriageRound({
      ...example,
      players: example.players.map((entry) => ({ ...entry, maal: 0 })),
    }).map((entry) => entry.points),
  ).toEqual([13, -3, -10]);
  expect(
    calculateMarriageRound({
      winnerId: 1,
      dubleeWin: false,
      players: [
        { playerId: 1, maal: 0, seen: true },
        { playerId: 2, maal: 3, seen: true },
      ],
    }).every((entry) => entry.points === 0),
  ).toBe(true);
});
