import { matchTotals, type SavedMatch } from './matches';

export function matchStandings(match: SavedMatch) {
  const totals = matchTotals(match);
  const ordered = [...match.players].sort(
    (a, b) =>
      (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0) || a.seat - b.seat,
  );
  const rows = ordered.map((player) => {
    const total = totals.get(player.id) ?? 0;
    const rank =
      ordered.findIndex((other) => totals.get(other.id) === total) + 1;
    return { player, total, rank };
  });
  const leaders = match.rounds.length
    ? rows.filter((row) => row.rank === 1)
    : [];
  const gap =
    leaders.length === 1 && rows.length > 1 ? rows[0].total - rows[1].total : 0;
  return { rows, leaders, gap };
}
