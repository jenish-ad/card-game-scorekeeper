import { test, expect } from '@jest/globals';
import {
  pagatBaseV1,
  scoreRound,
  currentRuleVersion,
} from '../src/scoring/pagatBaseV1';
import type { MarriageRoundInput } from '../src/features/marriage/scoring';

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
  const result = pagatBaseV1(example);
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
  expect(pagatBaseV1(input)).toEqual(pagatBaseV1(example));
  expect(input.players[2].maal).toBe(9);
  expect(scoreRound(input, 'pagat-base-v1')).not.toEqual(
    scoreRound(input, currentRuleVersion),
  );
});

test('new rules reject Dublee while historical Dublee remains reproducible', () => {
  const input = { ...example, dubleeWin: true };
  expect(() => pagatBaseV1(input)).toThrow('Dublee rule not configured');
  expect(
    scoreRound(input, 'pagat-base-v1').map((score) => score.points),
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
    expect(() => pagatBaseV1(input)).toThrow();
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
      const scores = pagatBaseV1(input);
      expect(scores.reduce((sum, score) => sum + score.points, 0)).toBe(0);
      expect(
        pagatBaseV1({
          ...input,
          players: [...input.players].reverse(),
        }).reverse(),
      ).toEqual(scores);
    }
  }
});

test('winner may lose points, zero maal settles finish payments, and zero results are supported', () => {
  expect(
    pagatBaseV1({
      winnerId: 1,
      dubleeWin: false,
      players: [
        { playerId: 1, maal: 0, seen: true },
        { playerId: 2, maal: 20, seen: true },
      ],
    }).map((entry) => entry.points),
  ).toEqual([-17, 17]);
  expect(
    pagatBaseV1({
      ...example,
      players: example.players.map((entry) => ({ ...entry, maal: 0 })),
    }).map((entry) => entry.points),
  ).toEqual([13, -3, -10]);
  expect(
    pagatBaseV1({
      winnerId: 1,
      dubleeWin: false,
      players: [
        { playerId: 1, maal: 0, seen: true },
        { playerId: 2, maal: 3, seen: true },
      ],
    }).every((entry) => entry.points === 0),
  ).toBe(true);
});
