import { t, n } from '../../../i18n';
import { MatchKeepAwake } from '../../../ui/MatchKeepAwake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Share, Text } from 'react-native';
import {
  deleteRound,
  setMatchFinished,
} from '../../../features/marriage/matches';
import { resultSummary } from '../../../features/marriage/settlement';
import { useMatches } from '../../../features/marriage/useMatches';
import { useRoundDraft } from '../../../features/marriage/RoundDraftProvider';
import { useMatchDatabase } from '../../../storage/MatchStorageProvider';
import { ScoreboardActions } from '../../../ui/ScoreboardActions';
import { Button } from '../../../ui/Primitives';
import { StandingsBoard } from '../../../ui/StandingsBoard';
import { RoundTable } from '../../../ui/RoundTable';
import { SavedRoundNotice } from '../../../ui/SavedRoundNotice';
import { Screen, useStyles } from '../../../ui/Screen';
export default function ScoreboardScreen() {
  const styles = useStyles();
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
    } catch {
      setWriteError(t('Could not update the match; try again.'));
    } finally {
      setBusy(false);
    }
  }
  function changeStatus() {
    if (!match) return;
    Alert.alert(
      match.finishedAt ? t('Reopen match?') : t('Finish match?'),
      match.finishedAt
        ? t('Allow changes to rounds?')
        : t('Move this match to history?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: match.finishedAt ? t('Reopen') : t('Finish'),
          onPress: () =>
            void mutate(() =>
              setMatchFinished(database, match.id, !match.finishedAt),
            ),
        },
      ],
    );
  }
  function undo() {
    if (!match) return;
    const last = match.rounds.at(-1);
    if (!last) return;
    Alert.alert(
      t('Undo last round?'),
      t('Delete round {p0} and recalculate totals?', {
        p0: match.rounds.length,
      }),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Undo'),
          style: 'destructive',
          onPress: () =>
            void mutate(() => deleteRound(database, match.id, last.id)),
        },
      ],
    );
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
                void Share.share({ message: resultSummary(match) }).catch(() =>
                  setWriteError(t('Could not share the result; try again.')),
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
      <Text style={styles.title}>{match.title}</Text>
      <Text style={styles.caption}>
        {[
          `${n(match.players.length)} ${t('players')}`,
          t('roundCount', { count: match.rounds.length }),
          match.finishedAt ? t('Finished') : t('Active'),
        ].join(' / ')}
      </Text>
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
