import { scoreRound } from './scoring';
import type { MarriageRoundInput, PlayerScore, MatchSettings } from './scoring';

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
      throw new Error('Choose the winner to see this round’s points.');
    const input = {
      winnerId,
      dubleeWin,
      players: entries.map((entry) => {
        if (entry.seen && !/^\d+$/.test(entry.maal))
          throw new Error(
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
      message:
        failure instanceof Error ? failure.message : 'Check the round inputs.',
    };
  }
}
