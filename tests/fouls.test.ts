import { foulPreview } from '../src/features/marriage/roundPreview';
import { test, expect } from '@jest/globals';
import {
  calculateFoulRound,
  defaultSettings,
  parseSettings,
  parseRoundInput,
} from '../src/features/marriage/scoring';
test.each([2, 3, 4, 5])(
  'fouls with %i participants conserve points in both modes',
  (n) => {
    const players = Array.from({ length: n }, (_, i) => ({ playerId: i + 1 }));
    for (const mode of ['perPlayer', 'fixedTotal'] as const) {
      const scores = calculateFoulRound({
        kind: 'foul',
        offenderId: 2,
        players,
        penalty: 11,
        mode,
      });
      expect(scores.reduce((sum, score) => sum + score.points, 0)).toBe(0);
      expect(scores[1].points).toBe(mode === 'perPlayer' ? -11 * (n - 1) : -11);
    }
  },
);
test('fixed total remainder follows participant seat order and rejects foreign offender', () => {
  const input = {
    kind: 'foul' as const,
    offenderId: 2,
    players: [1, 2, 3, 4].map((playerId) => ({ playerId })),
    penalty: 11,
    mode: 'fixedTotal' as const,
  };
  expect(calculateFoulRound(input).map((score) => score.points)).toEqual([
    4, -11, 4, 3,
  ]);
  expect(() => calculateFoulRound({ ...input, offenderId: 99 })).toThrow(
    /offender/,
  );
});
test('legacy settings and normal round JSON fill defaults without changing inputs', () => {
  expect(
    parseSettings({
      seenFee: 3,
      unseenFee: 10,
      dubleeExtra: 5,
      moneyRate: null,
    }),
  ).toEqual(defaultSettings);
  const input = {
    winnerId: 1,
    dubleeWin: false,
    players: [1, 2].map((playerId) => ({ playerId, seen: true, maal: 0 })),
  };
  expect(parseRoundInput(input)).toEqual(input);
});

test('unsafe foul totals and malformed stored participants reject without crashing previews', () => {
  expect(
    foulPreview({
      kind: 'foul',
      offenderId: 1,
      players: [1, 2, 3].map((playerId) => ({ playerId })),
      penalty: Number.MAX_SAFE_INTEGER,
      mode: 'perPlayer',
    }).ok,
  ).toBe(false);
  expect(() =>
    parseRoundInput({
      kind: 'foul',
      offenderId: 1,
      players: [null, { playerId: 2 }],
      penalty: 10,
      mode: 'perPlayer',
    }),
  ).toThrow(/invalid/);
  for (const mode of ['perPlayer', 'fixedTotal'] as const)
    expect(
      calculateFoulRound({
        kind: 'foul',
        offenderId: 1,
        players: [{ playerId: 1 }, { playerId: 2 }],
        penalty: 0,
        mode,
      }).reduce((sum, score) => sum + score.points, 0),
    ).toBe(0);
});
