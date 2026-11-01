import {
  calculateMarriageRound,
  type MarriageRoundInput,
  type PlayerScore,
} from '../features/marriage/scoring';

// This revision is separate from the original pagat-base-v1 saved on devices.
export const currentRuleVersion = 'pagat-base-v1-seen-maal';

export function dubleeAdjustment(): never {
  // TODO: implement only after the table's Dublee adjustment is specified.
  throw new Error('Dublee rule not configured');
}

export function pagatBaseV1(input: MarriageRoundInput): PlayerScore[] {
  // Reuse the established boundary validation, including exact-integer limits.
  calculateMarriageRound(input);
  if (input.dubleeWin) return dubleeAdjustment();
  return calculateMarriageRound({
    ...input,
    players: input.players.map((player) => ({
      ...player,
      maal: player.seen ? player.maal : 0,
    })),
  });
}

export function scoreRound(
  input: MarriageRoundInput,
  ruleVersion: string,
): PlayerScore[] {
  if (ruleVersion === 'pagat-base-v1') return calculateMarriageRound(input);
  if (ruleVersion === currentRuleVersion) return pagatBaseV1(input);
  throw new Error('Saved round uses an unsupported scoring rule version.');
}
