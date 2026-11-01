import { nextSeenPlayerIndex } from '../src/features/marriage/roundEntry';
import { expect, test } from '@jest/globals';
import {
  calculateMarriageRound,
  defaultSettings,
  parseSettings,
} from '../src/features/marriage/scoring';
import { defaultMatchTitle } from '../src/features/marriage/matchTitle';
const input = {
  winnerId: 1,
  dubleeWin: true,
  players: [
    { playerId: 1, maal: 5, seen: true },
    { playerId: 2, maal: 2, seen: true },
    { playerId: 3, maal: 99, seen: false },
  ],
};
test('custom fees and zero fees apply independently and do not count unseen maal', () => {
  expect(
    calculateMarriageRound(input, {
      ...defaultSettings,
      seenFee: 0,
      unseenFee: 2,
      dubleeExtra: 7,
    }).map((score) => score.points),
  ).toEqual([24, -8, -16]);
  expect(
    calculateMarriageRound(input, {
      ...defaultSettings,
      seenFee: 0,
      unseenFee: 0,
      dubleeExtra: 0,
    }).map((score) => score.points),
  ).toEqual([8, -1, -7]);
  expect(defaultSettings).toEqual({
    seenFee: 3,
    unseenFee: 10,
    dubleeExtra: 5,
    moneyRate: null,
  });
});
test('invalid fees, rates and unsafe arithmetic are rejected', () => {
  for (const fee of [-1, 0.5, NaN, Infinity, '3', undefined])
    for (const key of ['seenFee', 'unseenFee', 'dubleeExtra'])
      expect(() => parseSettings({ ...defaultSettings, [key]: fee })).toThrow();
  for (const moneyRate of [0, -1, 0.001, NaN, Infinity, '2'])
    expect(() => parseSettings({ ...defaultSettings, moneyRate })).toThrow();
  expect(parseSettings({ ...defaultSettings, moneyRate: 1.25 }).moneyRate).toBe(
    1.25,
  );
  expect(() =>
    calculateMarriageRound(input, {
      ...defaultSettings,
      dubleeExtra: Number.MAX_SAFE_INTEGER,
    }),
  ).toThrow();
});
test('date-based title uses weekday, day and month', () => {
  expect(defaultMatchTitle(new Date(2025, 10, 1, 12))).toBe('Sat, 1 Nov');
});

test('numeric Next skips disabled unseen players and ends at the last field', () => {
  const players = [
    { seen: true },
    { seen: false },
    { seen: true },
    { seen: false },
  ];
  expect(nextSeenPlayerIndex(players, 0)).toBe(2);
  expect(nextSeenPlayerIndex(players, 2)).toBe(-1);
});
