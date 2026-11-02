import { AppError } from '@/lib/errors';
import {
  scoreRound,
  currentRuleVersion,
  defaultSettings,
  type MatchSettings,
  type MarriageRoundInput,
} from './scoring';
import type { SavedPlayer } from './types';
export function matchTotals(match: {
  ruleVersion?: string;
  settings?: MatchSettings;
  players: readonly SavedPlayer[];
  rounds: readonly { input: MarriageRoundInput }[];
}) {
  const totals = new Map(match.players.map((player) => [player.id, 0]));
  for (const round of match.rounds) {
    for (const score of scoreRound(
      round.input,
      match.ruleVersion ?? currentRuleVersion,
      match.settings ?? defaultSettings,
    )) {
      const total = (totals.get(score.playerId) ?? 0) + score.points;
      if (!Number.isSafeInteger(total))
        throw new AppError('MATCH_TOTALS_ARE_TOO_LARGE_TO_CALCULATE_SAFELY');
      totals.set(score.playerId, total);
    }
  }
  const rate = match.settings?.moneyRate;
  if (
    rate !== null &&
    rate !== undefined &&
    [...totals.values()].some(
      (total) => !Number.isSafeInteger(total * Math.round(rate * 100)),
    )
  )
    throw new AppError('THE_RS_AMOUNT_IS_TOO_LARGE_USE_A_LOWER_RATE');
  return totals;
}
