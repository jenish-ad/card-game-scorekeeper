import { t, n } from './index';
import { formatDate } from './dates';
import { matchStandings } from '../features/marriage/standings';
import { moneyAmount } from '../features/marriage/settlement';
import type { SavedMatch } from '../features/marriage/matches';
export function displayMatchTitle(
  match: Pick<SavedMatch, 'title' | 'createdAt'>,
) {
  return match.title || formatDate(new Date(match.createdAt));
}
export function formatMoney(paisa: number): string {
  const amount = Math.abs(paisa) / 100;
  return `${paisa < 0 ? '\u2212' : ''}${t('Rs')} ${n(Number.isInteger(amount) ? amount : amount.toFixed(2))}`;
}
export function resultSummary(match: SavedMatch): string {
  const { rows } = matchStandings(match);
  const rate = match.settings.moneyRate;
  return [
    displayMatchTitle(match),
    formatDate(new Date(match.createdAt)),
    match.finishedAt ? t('Final standings') : t('Current standings'),
    ...rows.map(
      (row) =>
        `${n(row.rank)}. ${row.player.name}: ${row.total > 0 ? '+' : ''}${n(row.total)}${rate === null ? '' : ` (${formatMoney(moneyAmount(row.total, rate))})`}`,
    ),
  ].join('\n');
}
