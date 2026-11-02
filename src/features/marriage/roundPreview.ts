import { latinDigits } from '../../i18n/numbers';
import { t, translateError } from '../../i18n';
import { scoreRound } from './scoring';
import type {
  FoulRoundInput,
  MarriageRoundInput,
  PlayerScore,
  MatchSettings,
} from './scoring';

export function foulPreview(input: FoulRoundInput) {
  try {
    return { ok: true as const, input, scores: scoreRound(input) };
  } catch (error) {
    return {
      ok: false as const,
      message: translateError(error, 'Check the round inputs.'),
    };
  }
}

export function roundPreview(
  entries: { playerId: number; maal: string; seen: boolean }[],
  winnerId: number | null,
  dubleeWin: boolean,
  ruleVersion: string,
  settings?: MatchSettings,
):
  | { ok: true; input: MarriageRoundInput; scores: PlayerScore[] }
  | { ok: false; message: string } {
  try {
    if (winnerId === null)
      throw new Error(t('Choose the winner to see this round’s points.'));
    const input = {
      winnerId,
      dubleeWin,
      players: entries.map((original) => {
        const entry = { ...original, maal: latinDigits(original.maal) };
        if (entry.seen && !/^\d+$/.test(entry.maal))
          throw new Error(
            t('Enter a whole-number maal total for every player, including 0.'),
          );
        return { ...entry, maal: entry.seen ? Number(entry.maal) : 0 };
      }),
    };
    return {
      ok: true,
      input,
      scores: scoreRound(input, ruleVersion, settings),
    };
  } catch (failure) {
    return {
      ok: false,
      message: translateError(failure, 'Check the round inputs.'),
    };
  }
}
