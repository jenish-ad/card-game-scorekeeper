import { useState, type ReactNode } from 'react';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import { t, translateError } from '@/i18n';
import { displayMatchTitle, resultSummary } from '@/i18n/matchText';
import {
  deleteMatch,
  deleteRound,
  setMatchFinished,
  type SavedMatch,
} from '@/features/marriage/data/matches';
import { useRoundDraft } from '@/features/marriage/data/RoundDraftProvider';
import { useMatchDatabase } from '@/storage/MatchStorageProvider';
import { useConfirm } from '@/ui/ConfirmDialog';
import { ScoreboardActions } from './ScoreboardActions';

export function MatchCardActions({
  match,
  reload,
  children,
}: {
  match: SavedMatch;
  reload: () => void;
  children: (showMenu: () => void) => ReactNode;
}) {
  const database = useMatchDatabase();
  const confirm = useConfirm();
  const router = useRouter();
  const { setDraft } = useRoundDraft();
  const [busy, setBusy] = useState(false);
  async function mutate(work: () => Promise<void>) {
    setBusy(true);
    try {
      await work();
      setDraft(null);
      reload();
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScoreboardActions
      title={displayMatchTitle(match)}
      renderTrigger={children}
      busy={busy}
      finished={Boolean(match.finishedAt)}
      canUndo={!match.finishedAt && match.rounds.length > 0}
      share={() => {
        void Share.share({ message: resultSummary(match) }).catch(
          (error: unknown) => {
            void confirm({
              title: translateError(
                error,
                'Could not share the result; try again.',
              ),
              confirmLabel: t('Done'),
            });
          },
        );
      }}
      changeStatus={() => {
        void confirm({
          title: match.finishedAt ? t('Reopen match?') : t('Finish match?'),
          body: match.finishedAt
            ? t(
                'It moves back to active matches so you can add or edit rounds.',
              )
            : t(
                'Final standings are saved to History. You can reopen it later.',
              ),
          confirmLabel: match.finishedAt ? t('Reopen') : t('Finish'),
          action: () =>
            mutate(() =>
              setMatchFinished(database, match.id, !match.finishedAt),
            ),
        });
      }}
      undo={() => {
        const last = match.rounds.at(-1);
        if (!last || match.finishedAt) return;
        void confirm({
          title: t('Undo last round?'),
          body: t('Round {n} will be deleted and totals recalculated.', {
            n: match.rounds.length,
          }),
          confirmLabel: t('Undo'),
          destructive: true,
          action: () => mutate(() => deleteRound(database, match.id, last.id)),
        });
      }}
      players={() => router.push(`/marriage/players/${match.id}`)}
      recordFoul={() => {
        setDraft(null);
        router.push({
          pathname: '/marriage/round/[id]',
          params: { id: match.id, foul: '1' },
        });
      }}
      removeMatch={() => {
        void confirm({
          title: t('Delete {name}?', { name: displayMatchTitle(match) }),
          body: t(
            'This permanently deletes the match, all players and all rounds. This cannot be undone.',
          ),
          confirmLabel: t('Delete match'),
          destructive: true,
          action: () => mutate(() => deleteMatch(database, match.id)),
        });
      }}
    />
  );
}
