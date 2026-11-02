import { expect, test } from '@jest/globals';
import {
  currentRuleVersion,
  defaultSettings,
} from '../src/features/marriage/scoring';
import type { SavedMatch } from '../src/features/marriage/matches';
import { matchStandings } from '../src/features/marriage/standings';
import { roundPreview } from '../src/features/marriage/roundPreview';

function table(winners: number[]): SavedMatch {
  const players = [
    'Sita',
    'Ram',
    'Hari',
    'Nirmala Chandrasekhar Shrestha',
    'Gita',
  ].map((name, seat) => ({ id: seat + 1, name, seat, active: true }));
  return {
    id: 1,
    settings: { ...defaultSettings },
    title: 'Sunday evening at the neighbourhood table',
    createdAt: '2026-11-01T10:00:00.000Z',
    finishedAt: null,
    ruleVersion: currentRuleVersion,
    players,
    rounds: winners.map((winnerId, index) => ({
      id: index + 1,
      createdAt: '2026-11-01T10:00:00.000Z',
      input: {
        winnerId,
        dubleeWin: false,
        players: players.map((player) => ({
          playerId: player.id,
          maal: 0,
          seen: true,
        })),
      },
    })),
  };
}
test('twelve rounds with five players share rank one fairly and keep negative totals', () => {
  const result = matchStandings(table([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4, 4]));
  expect(result.leaders.map((row) => row.player.name)).toEqual(['Sita', 'Ram']);
  expect(result.rows.map((row) => [row.rank, row.total])).toEqual([
    [1, 24],
    [1, 24],
    [3, -6],
    [3, -6],
    [5, -36],
  ]);
  expect(result.gap).toBe(0);
  expect(result.rows[3].player.name).toBe('Nirmala Chandrasekhar Shrestha');
});
test('a sole leader shows the exact gap to second place, including a finished match', () => {
  const match = table([1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4]);
  const before = JSON.stringify(match);
  const result = matchStandings({
    ...match,
    finishedAt: '2026-11-01T11:00:00.000Z',
  });
  expect(result.leaders.map((row) => row.player.name)).toEqual(['Sita']);
  expect(result.gap).toBe(45);
  expect(result.rows.map((row) => row.total)).toEqual([54, 9, -6, -21, -36]);
  expect(JSON.stringify(match)).toBe(before);
});
test('an unplayed match has no leader and keeps the seating order', () => {
  const result = matchStandings(table([]));
  expect(result.leaders).toEqual([]);
  expect(result.rows.map((row) => row.player.seat)).toEqual([0, 1, 2, 3, 4]);
  expect(result.rows.every((row) => row.total === 0)).toBe(true);
});
test('live preview agrees with saved scoring and rejects incomplete or undefined rounds', () => {
  const entries = [
    { playerId: 1, maal: '5', seen: true },
    { playerId: 2, maal: '2', seen: true },
    { playerId: 3, maal: '0', seen: false },
  ];
  const result = roundPreview(entries, 1, false, currentRuleVersion);
  expect(result.ok && result.scores.map((score) => score.points)).toEqual([
    21, -4, -17,
  ]);
  expect(roundPreview(entries, null, false, currentRuleVersion).ok).toBe(false);
  expect(
    roundPreview(
      entries.map((entry) => ({ ...entry, maal: '' })),
      1,
      false,
      currentRuleVersion,
    ).ok,
  ).toBe(false);
  const dublee = roundPreview(entries, 1, true, currentRuleVersion);
  expect(dublee.ok && dublee.scores.map((score) => score.points)).toEqual([
    31, -9, -22,
  ]);
  expect(entries[0].maal).toBe('5');
});
