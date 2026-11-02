import { useConfirm } from '@/ui/ConfirmDialog';
import { displayMatchTitle, resultSummary } from '@/i18n/matchText';
import { t, n, translateError } from '@/i18n';
import { MatchKeepAwake } from '@/features/marriage/components/MatchKeepAwake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Share, Text } from 'react-native';
import {
  deleteRound,
  setMatchFinished,
} from '@/features/marriage/data/matches';

import { useMatches } from '@/features/marriage/data/useMatches';
import { useRoundDraft } from '@/features/marriage/data/RoundDraftProvider';
import { useMatchDatabase } from '@/storage/MatchStorageProvider';
import { ScoreboardActions } from '@/features/marriage/components/ScoreboardActions';
import { Button } from '@/ui/Button';
import { StandingsBoard } from '@/features/marriage/components/StandingsBoard';
import { RoundTable } from '@/features/marriage/components/RoundTable';
import { SavedRoundNotice } from '@/features/marriage/components/SavedRoundNotice';
import { Screen, useStyles } from '@/ui/Screen';
export default function ScoreboardScreen() {
  const styles = useStyles();
  const confirm = useConfirm();
  const { id, savedRound, savedToken } = useLocalSearchParams<{
    id: string;
    savedRound?: string;
    savedToken?: string;
  }>();
  const router = useRouter();
  const database = useMatchDatabase();
  const { match, loading, error, reload } = useMatches(Number(id));
  const { setDraft } = useRoundDraft();
  const [busy, setBusy] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const dismissNotice = useCallback(
    () => router.setParams({ savedRound: undefined, savedToken: undefined }),
    [router],
  );
  if (loading)
    return (
      <Screen>
        <ActivityIndicator accessibilityLabel={t('Loading')} />
      </Screen>
    );
  if (!match || error)
    return (
      <Screen>
        <Text accessibilityRole="alert" style={styles.error}>
          {error ?? t('Match not found.')}
        </Text>
        <Button label={t('Retry')} onPress={reload} />
      </Screen>
    );
  async function mutate(operation: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setWriteError(null);
    try {
      await operation();
      setDraft(null);
      reload();
    } finally {
      setBusy(false);
    }
  }
  function changeStatus() {
    if (!match) return;
    void confirm({
      title: match.finishedAt ? t('Reopen match?') : t('Finish match?'),
      body: match.finishedAt
        ? t('It moves back to active matches so you can add or edit rounds.')
        : t('Final standings are saved to History. You can reopen it later.'),
      confirmLabel: match.finishedAt ? t('Reopen') : t('Finish'),
      action: () =>
        mutate(() => setMatchFinished(database, match.id, !match.finishedAt)),
    });
  }
  function undo() {
    if (!match) return;
    const last = match.rounds.at(-1);
    if (!last) return;
    void confirm({
      title: t('Undo last round?'),
      body: t('Round {n} will be deleted and totals recalculated.', {
        n: match.rounds.length,
      }),
      confirmLabel: t('Undo'),
      destructive: true,
      action: () => mutate(() => deleteRound(database, match.id, last.id)),
    });
  }

  return (
    <Screen
      footer={
        !match.finishedAt ? (
          <>
            <Button
              label={t('Add round')}
              disabled={busy}
              onPress={() => {
                setDraft(null);
                router.push(`/marriage/round/${match.id}`);
              }}
            />
          </>
        ) : undefined
      }
    >
      <MatchKeepAwake active={!match.finishedAt} />
      <Stack.Screen
        options={{
          headerRight: () => (
            <ScoreboardActions
              finished={Boolean(match.finishedAt)}
              canUndo={!match.finishedAt && match.rounds.length > 0}
              busy={busy}
              share={() => {
                void Share.share({ message: resultSummary(match) }).catch(
                  (error: unknown) =>
                    setWriteError(
                      translateError(
                        error,
                        'Could not share the result; try again.',
                      ),
                    ),
                );
              }}
              changeStatus={changeStatus}
              undo={undo}
              players={() => router.push(`/marriage/players/${match.id}`)}
            />
          ),
        }}
      />
      {savedRound && (
        <SavedRoundNotice
          key={savedToken}
          round={savedRound}
          onDismiss={dismissNotice}
        />
      )}
      <Text style={styles.title}>{displayMatchTitle(match)}</Text>
      <Text style={styles.caption}>
        {[
          `${n(match.players.length)} ${t('players')}`,
          t('roundCount', { count: match.rounds.length }),
          match.finishedAt ? t('Finished') : t('Active'),
        ].join(' / ')}
      </Text>
      {match.settings.moneyRate !== null && (
        <Text style={styles.caption}>
          {t('Rs per point')}: {n(match.settings.moneyRate)}
        </Text>
      )}
      <StandingsBoard match={match} />
      <Text style={styles.label}>{t('Rounds')}</Text>
      {match.rounds.length ? (
        <RoundTable
          match={match}
          openRound={(roundId) =>
            router.push({
              pathname: '/marriage/preview/[id]',
              params: { id: match.id, roundId },
            })
          }
        />
      ) : (
        <Text style={styles.body}>{t('Add a round to start scoring.')}</Text>
      )}
      {match.settings.moneyRate !== null && (
        <Button
          secondary
          label={t('Settle up')}
          onPress={() => router.push(`/marriage/settle/${match.id}`)}
        />
      )}
      {writeError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {writeError}
        </Text>
      )}
    </Screen>
  );
}
