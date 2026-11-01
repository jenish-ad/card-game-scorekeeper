import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Share, Text, View } from 'react-native';
import {
  deleteRound,
  setMatchFinished,
} from '../../../features/marriage/matches';
import { resultSummary } from '../../../features/marriage/settlement';
import { useMatches } from '../../../features/marriage/useMatches';
import { useRoundDraft } from '../../../features/marriage/RoundDraftProvider';
import { useMatchDatabase } from '../../../storage/MatchStorageProvider';
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
        <ActivityIndicator accessibilityLabel="Loading" />
      </Screen>
    );
  if (!match || error)
    return (
      <Screen>
        <Text accessibilityRole="alert" style={styles.error}>
          {error ?? 'Match not found.'}
        </Text>
        <Button label="Retry" onPress={reload} />
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
      setWriteError('Could not update the match; try again.');
    } finally {
      setBusy(false);
    }
  }
  function changeStatus() {
    if (!match) return;
    Alert.alert(
      match.finishedAt ? 'Reopen match?' : 'Finish match?',
      match.finishedAt
        ? 'Allow changes to rounds?'
        : 'Move this match to history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: match.finishedAt ? 'Reopen' : 'Finish',
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
      'Undo last round?',
      `Delete round ${match.rounds.length} and recalculate totals?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
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
              secondary
              label="Undo last round"
              disabled={busy || !match.rounds.length}
              onPress={undo}
            />
            <Button
              label="Add round"
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
      {savedRound && (
        <SavedRoundNotice
          key={savedToken}
          round={savedRound}
          onDismiss={dismissNotice}
        />
      )}
      <Text style={styles.title}>{match.title}</Text>
      <Text style={styles.caption}>
        {match.players.length} players / {match.rounds.length} rounds /{' '}
        {match.finishedAt ? 'Finished' : 'Active'}
      </Text>
      <StandingsBoard match={match} />
      <Text style={styles.label}>Rounds</Text>
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
        <Text style={styles.body}>Add a round to start scoring.</Text>
      )}
      <View style={styles.row}>
        <Button
          secondary
          label={match.finishedAt ? 'Reopen match' : 'Finish match'}
          disabled={busy}
          onPress={changeStatus}
        />
      </View>
      {match.settings.moneyRate !== null && (
        <Button
          secondary
          label="Settle up"
          onPress={() => router.push(`/marriage/settle/${match.id}`)}
        />
      )}
      <Button
        secondary
        label="Share result"
        onPress={() => {
          void Share.share({ message: resultSummary(match) }).catch(() =>
            setWriteError('Could not share the result; try again.'),
          );
        }}
      />
      {writeError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {writeError}
        </Text>
      )}
    </Screen>
  );
}
