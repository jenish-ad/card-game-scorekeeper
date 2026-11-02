import { AppError } from '../../errors';

export function moneyAmount(points: number, rate: number): number {
  const amount = points * Math.round(rate * 100);
  if (!Number.isSafeInteger(amount))
    throw new AppError('THE_RS_AMOUNT_IS_TOO_LARGE_USE_A_LOWER_RATE');
  return amount;
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
    throw new AppError('BALANCES_MUST_TOTAL_0');
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
