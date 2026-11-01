import { expect, test } from '@jest/globals';
import {
  formatMoney,
  moneyAmount,
  resultSummary,
  settleUp,
} from '../src/features/marriage/settlement';
import {
  currentRuleVersion,
  defaultSettings,
} from '../src/features/marriage/scoring';
import type { SavedMatch } from '../src/features/marriage/matches';
test('worked example settles in two transfers using exact paisa', () => {
  const balances = [
    { playerId: 1, paisa: moneyAmount(21, 1.25) },
    { playerId: 2, paisa: moneyAmount(-4, 1.25) },
    { playerId: 3, paisa: moneyAmount(-17, 1.25) },
  ];
  const before = JSON.stringify(balances);
  expect(settleUp(balances)).toEqual([
    { from: 3, to: 1, paisa: 2125 },
    { from: 2, to: 1, paisa: 500 },
  ]);
  expect(JSON.stringify(balances)).toBe(before);
  expect(formatMoney(2125)).toBe('Rs 21.25');
});
test('greedy matching handles multiple creditors, ties and zero balances', () => {
  const balances = [
    { playerId: 1, paisa: 800 },
    { playerId: 2, paisa: 200 },
    { playerId: 3, paisa: -500 },
    { playerId: 4, paisa: -500 },
    { playerId: 5, paisa: 0 },
  ];
  const transfers = settleUp(balances);
  expect(transfers).toHaveLength(3);
  for (const balance of balances) {
    const received = transfers
      .filter((entry) => entry.to === balance.playerId)
      .reduce((sum, entry) => sum + entry.paisa, 0);
    const paid = transfers
      .filter((entry) => entry.from === balance.playerId)
      .reduce((sum, entry) => sum + entry.paisa, 0);
    expect(received - paid).toBe(balance.paisa);
  }
  expect(settleUp([])).toEqual([]);
  expect(settleUp([{ playerId: 1, paisa: 0 }])).toEqual([]);
  expect(() => settleUp([{ playerId: 1, paisa: 1 }])).toThrow();
  expect(() =>
    settleUp([
      { playerId: 1, paisa: 0.5 },
      { playerId: 2, paisa: -0.5 },
    ]),
  ).toThrow();
  expect(() => moneyAmount(Number.MAX_SAFE_INTEGER, 2)).toThrow();
});
test('share summary contains title, date, tied ranks, signed totals and optional Rs amounts', () => {
  const players = ['Sita', 'Ram', 'Hari'].map((name, seat) => ({
    id: seat + 1,
    name,
    seat,
  }));
  const match: SavedMatch = {
    id: 1,
    title: 'Saturday',
    createdAt: '2025-11-01T12:00:00Z',
    finishedAt: '2025-11-01T13:00:00Z',
    ruleVersion: currentRuleVersion,
    settings: { ...defaultSettings, moneyRate: 1.25 },
    players,
    rounds: [
      {
        id: 1,
        createdAt: '2025-11-01T12:30:00Z',
        input: {
          winnerId: 1,
          dubleeWin: false,
          players: players.map((player, index) => ({
            playerId: player.id,
            maal: [5, 2, 0][index] ?? 0,
            seen: index < 2,
          })),
        },
      },
    ],
  };
  expect(resultSummary(match)).toContain('1. Sita: +21 (Rs 26.25)');
  expect(resultSummary(match)).toContain('3. Hari: -17 (\u2212Rs 21.25)');
  expect(resultSummary(match)).toContain('1 Nov 2025');
  expect(
    resultSummary({ ...match, settings: { ...defaultSettings } }),
  ).not.toContain('Rs');
});

test('money formatting places the sign first and omits whole-rupee decimals', () => {
  expect(formatMoney(-1500)).toBe('\u2212Rs 15');
  expect(formatMoney(1500)).toBe('Rs 15');
  expect(formatMoney(0)).toBe('Rs 0');
  expect(formatMoney(-1525)).toBe('\u2212Rs 15.25');
});
