import assert from 'node:assert/strict';
import { test } from '@jest/globals';
import {
  calculateMarriageRound,
  parseRoundInput,
  type MarriageRoundInput,
} from '../src/features/marriage/scoring';

const normalRound: MarriageRoundInput = {
  winnerId: 1,
  dubleeWin: false,
  players: [
    { playerId: 1, maal: 5, seen: true },
    { playerId: 2, maal: 2, seen: true },
    { playerId: 3, maal: 0, seen: false },
  ],
};

test('settles entered maal with seen/unseen finish payments', () => {
  assert.deepEqual(calculateMarriageRound(normalRound), [
    { playerId: 1, points: 21 },
    { playerId: 2, points: -4 },
    { playerId: 3, points: -17 },
  ]);
});

test('a dublee finish adds five per opponent without changing the input', () => {
  assert.deepEqual(
    calculateMarriageRound({ ...normalRound, dubleeWin: true }).map(
      (score) => score.points,
    ),
    [31, -9, -22],
  );
  assert.equal(normalRound.dubleeWin, false);
});

test('the finishing player can lose points when another player has more maal', () => {
  const scores = calculateMarriageRound({
    winnerId: 1,
    dubleeWin: false,
    players: [
      { playerId: 1, maal: 0, seen: true },
      { playerId: 2, maal: 20, seen: true },
    ],
  });
  assert.deepEqual(
    scores.map((score) => score.points),
    [-17, 17],
  );
});

test('all-zero maal still settles the finish payments', () => {
  assert.deepEqual(
    calculateMarriageRound({
      ...normalRound,
      players: normalRound.players.map((player) => ({ ...player, maal: 0 })),
    }).map((score) => score.points),
    [13, -3, -10],
  );
});

test('rounds conserve points across supported player counts and seating orders', () => {
  for (let count = 2; count <= 5; count++) {
    for (let winner = 1; winner <= count; winner++) {
      const input = {
        winnerId: winner,
        dubleeWin: winner % 2 === 0,
        players: Array.from({ length: count }, (_, index) => ({
          playerId: index + 1,
          maal: index * 3,
          seen: index + 1 === winner || index % 2 === 0,
        })),
      };
      const result = calculateMarriageRound(input);
      assert.equal(
        result.reduce((sum, score) => sum + score.points, 0),
        0,
      );
      assert.deepEqual(
        calculateMarriageRound({
          ...input,
          players: [...input.players].reverse(),
        }).reverse(),
        result,
      );
    }
  }
});

test('rejects malformed, incomplete, unsafe and ineligible round inputs', () => {
  for (const invalid of [
    null,
    {},
    { ...normalRound, winnerId: 99 },
    { ...normalRound, winnerId: 3 },
    { ...normalRound, players: [normalRound.players[0]] },
    {
      ...normalRound,
      players: [normalRound.players[0], normalRound.players[0]],
    },
    ...[-1, 0.5, Number.MAX_SAFE_INTEGER].map((maal) => ({
      ...normalRound,
      players: normalRound.players.map((player) => ({ ...player, maal })),
    })),
    { ...normalRound, dubleeWin: 'yes' },
    { ...normalRound, players: [{ playerId: 1, maal: '5', seen: true }] },
  ])
    assert.throws(() => parseRoundInput(invalid));
});
