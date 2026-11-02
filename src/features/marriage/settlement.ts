import { formatDate } from '../../i18n/dates';
import { t, n } from '../../i18n';
import { matchStandings } from './standings';
import type { SavedMatch } from './matches';

export function moneyAmount(points: number, rate: number): number {
  const amount = points * Math.round(rate * 100);
  if (!Number.isSafeInteger(amount))
    throw new Error(t('The Rs amount is too large; use a lower rate.'));
  return amount;
}
export function formatMoney(paisa: number): string {
  const amount = Math.abs(paisa) / 100;
  return `${paisa < 0 ? '\u2212' : ''}${t('Rs')} ${n(Number.isInteger(amount) ? amount : amount.toFixed(2))}`;
}
export interface Transfer {
  from: number;
  to: number;
  paisa: number;
}
// Match the largest remaining debtor and creditor, clearing at least one each time.
export function settleUp(
  balances: readonly { playerId: number; paisa: number }[],
): Transfer[] {
  if (
    new Set(balances.map((entry) => entry.playerId)).size !== balances.length ||
    balances.some((entry) => !Number.isSafeInteger(entry.paisa)) ||
    balances.reduce((sum, entry) => sum + entry.paisa, 0) !== 0
  )
    throw new Error(t('Balances must total 0.'));
  const debtors = balances
    .filter((entry) => entry.paisa < 0)
    .map((entry) => ({ id: entry.playerId, remaining: -entry.paisa }));
  const creditors = balances
    .filter((entry) => entry.paisa > 0)
    .map((entry) => ({ id: entry.playerId, remaining: entry.paisa }));
  const transfers: Transfer[] = [];
  while (debtors.length && creditors.length) {
    debtors.sort((a, b) => b.remaining - a.remaining || a.id - b.id);
    creditors.sort((a, b) => b.remaining - a.remaining || a.id - b.id);
    const debtor = debtors[0];
    const creditor = creditors[0];
    if (!debtor || !creditor) break;
    const paisa = Math.min(debtor.remaining, creditor.remaining);
    transfers.push({ from: debtor.id, to: creditor.id, paisa });
    debtor.remaining -= paisa;
    creditor.remaining -= paisa;
    if (debtor.remaining === 0) debtors.shift();
    if (creditor.remaining === 0) creditors.shift();
  }
  return transfers;
}
export function resultSummary(match: SavedMatch): string {
  const { rows } = matchStandings(match);
  const rate = match.settings.moneyRate;
  return [
    match.title,
    formatDate(new Date(match.createdAt)),
    match.finishedAt ? t('Final standings') : t('Current standings'),
    ...rows.map(
      (row) =>
        `${n(row.rank)}. ${row.player.name}: ${row.total > 0 ? '+' : ''}${n(row.total)}${rate === null ? '' : ` (${formatMoney(moneyAmount(row.total, rate))})`}`,
    ),
  ].join('\n');
}
