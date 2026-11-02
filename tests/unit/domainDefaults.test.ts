import { expect, test } from '@jest/globals';
import { matchTotals } from '@/features/marriage/domain/totals';
import { defaultMatchTitle } from '@/features/marriage/domain/matchTitle';
import { parseSetupSettings } from '@/features/marriage/domain/setupSettings';

test('totals default to the current rule/settings and retain zero totals for non-participants', () => {
  const players = [
    { id: 1, name: 'Sita', seat: 0, active: true },
    { id: 2, name: 'Ram', seat: 4, active: true },
  ];
  const input = {
    winnerId: 3,
    dubleeWin: false,
    players: [
      { playerId: 2, seen: true, maal: 0 },
      { playerId: 3, seen: true, maal: 0 },
    ],
  };
  expect([...matchTotals({ players, rounds: [{ input }] })]).toEqual([
    [1, 0],
    [2, -3],
    [3, 3],
  ]);
  expect([...matchTotals({ players, rounds: [] })]).toEqual([
    [1, 0],
    [2, 0],
  ]);
});
test('the title formatter is injected instead of reading global preferences', () => {
  const date = new Date(2026, 10, 2);
  expect(defaultMatchTitle(date, (value) => `${value.getFullYear()}`)).toBe(
    '2026',
  );
});
test('setup accepts a disabled money rate without parsing its unused input', () => {
  expect(
    parseSetupSettings(
      { seenFee: '3', unseenFee: '10', dubleeExtra: '5', foulPenalty: '10' },
      'perPlayer',
      false,
      'not a rate',
    ).moneyRate,
  ).toBeNull();
  expect(() =>
    parseSetupSettings(
      { seenFee: '', unseenFee: '10', dubleeExtra: '5', foulPenalty: '10' },
      'perPlayer',
      false,
      '',
    ),
  ).toThrow();
});
