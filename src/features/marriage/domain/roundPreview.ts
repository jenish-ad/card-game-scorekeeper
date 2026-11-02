import { latinDigits } from '@/lib/numbers';
import { AppError } from '@/lib/errors';
import { scoreRound } from '@/features/marriage/domain/scoring';
import type {
  FoulRoundInput,
  MarriageRoundInput,
  PlayerScore,
  MatchSettings,
} from '@/features/marriage/domain/scoring';

export function foulPreview(input: FoulRoundInput) {
  try {
    return { ok: true as const, input, scores: scoreRound(input) };
  } catch (error) {
    return {
      ok: false as const,
      error,
      message:
        error instanceof Error ? error.message : 'Check the round inputs.',
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
  | { ok: false; message: string; error: unknown } {
  try {
    if (winnerId === null)
      throw new AppError('Choose the winner to see this round’s points.');
    const input = {
      winnerId,
      dubleeWin,
      players: entries.map((original) => {
        const entry = { ...original, maal: latinDigits(original.maal) };
        if (entry.seen && !/^\d+$/.test(entry.maal))
          throw new AppError(
            'Enter a whole-number maal total for every player, including 0.',
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
      error: failure,
      message:
        failure instanceof Error ? failure.message : 'Check the round inputs.',
    };
  }
}
