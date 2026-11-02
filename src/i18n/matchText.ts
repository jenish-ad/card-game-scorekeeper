import { t, n } from '@/i18n';
import { formatDate } from '@/i18n/dates';
import { matchStandings } from '@/features/marriage/domain/standings';
import { moneyAmount } from '@/features/marriage/domain/settlement';
import type { SavedMatch } from '@/features/marriage/data/matches';
export function defaultMatchTitle(date = new Date()): string {
  return formatDate(date);
}

export function displayMatchTitle(
  match: Pick<SavedMatch, 'title' | 'createdAt'>,
) {
  return match.title || formatDate(new Date(match.createdAt));
}
export function matchSubtitle(
  match: Pick<SavedMatch, 'players' | 'rounds' | 'finishedAt' | 'settings'>,
): string {
  return [
    `${n(match.players.length)} ${t('players')}`,
    t('roundCount', { count: match.rounds.length }),
    match.finishedAt ? t('Finished') : t('Active'),
    ...(match.settings.moneyRate !== null
      ? [t('Rs {rate} per point', { rate: match.settings.moneyRate })]
      : []),
  ].join(' \u00b7 ');
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
