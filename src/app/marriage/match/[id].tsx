import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import {
  deleteRound,
  getMatch,
  matchTotals,
  saveRound,
  setMatchFinished,
  type SavedMatch,
  type SavedRound,
} from '../../../features/marriage/matches';
import { RoundEditor } from '../../../features/marriage/RoundEditor';
import { calculateMarriageRound } from '../../../features/marriage/scoring';
import { useMatchDatabase } from '../../../storage/MatchStorageProvider';
import { Screen, styles } from '../../../ui/Screen';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const database = useMatchDatabase();
  const [match, setMatch] = useState<SavedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [editingRound, setEditingRound] = useState<SavedRound | 'new' | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const matchId =
      typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : NaN;
    getMatch(database, matchId)
      .then((saved) => {
        if (!cancelled) {
          setMatch(saved);
          setLoading(false);
        }
      })
      .catch((failure: unknown) => {
        if (!cancelled) {
          setError(
            failure instanceof Error
              ? failure.message
              : 'Could not read this match.',
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [database, id, revision]);

  function reload() {
    setLoading(true);
    setError(null);
    setMatch(null);
    setRevision((value) => value + 1);
  }

  async function changeMatch(operation: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await operation();
      reload();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Could not save changes. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete(round: SavedRound) {
    if (!match) return;
    Alert.alert(
      'Delete round?',
      'This removes its saved inputs and recalculates the scoreboard. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete round',
          style: 'destructive',
          onPress: () =>
            void changeMatch(() => deleteRound(database, match.id, round.id)),
        },
      ],
    );
  }

  function confirmStatusChange() {
    if (!match) return;
    Alert.alert(
      match.finishedAt ? 'Reopen match?' : 'Finish match?',
      match.finishedAt
        ? 'You will be able to add or correct rounds again.'
        : 'The match will remain in history. Reopen it if you need to change rounds.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: match.finishedAt ? 'Reopen' : 'Finish match',
          onPress: () =>
            void changeMatch(() =>
              setMatchFinished(database, match.id, !match.finishedAt),
            ),
        },
      ],
    );
  }

  if (loading)
    return (
      <Screen>
        <Text style={styles.body}>Loading match…</Text>
      </Screen>
    );
  if (!match)
    return (
      <Screen>
        <Text accessibilityRole="alert" style={styles.error}>
          {error ?? 'This match was not found.'}
        </Text>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={reload}
        >
          <Text style={styles.buttonText}>Retry match</Text>
        </Pressable>
        <Link href="/history">Return to saved matches</Link>
      </Screen>
    );
  if (editingRound)
    return (
      <Screen>
        <RoundEditor
          key={editingRound === 'new' ? 'new' : editingRound.id}
          match={match}
          round={editingRound === 'new' ? undefined : editingRound}
          onCancel={() => setEditingRound(null)}
          onSave={async (input) => {
            await saveRound(
              database,
              match.id,
              input,
              editingRound === 'new' ? undefined : editingRound.id,
            );
            setEditingRound(null);
            reload();
          }}
        />
      </Screen>
    );

  const totals = matchTotals(match);
  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        Match {match.id}
      </Text>
      <Text style={styles.body}>
        {match.finishedAt ? 'Finished' : 'In progress'} ·{' '}
        {new Date(match.createdAt).toLocaleDateString()} · Pagat base v1
      </Text>
      <Text accessibilityRole="header" style={styles.label}>
        Scoreboard · {match.rounds.length} rounds
      </Text>
      {match.players.map((player) => (
        <Text key={player.id} style={styles.body}>
          {player.name}: {totals.get(player.id)} points
        </Text>
      ))}
      {!match.finishedAt && (
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          style={styles.button}
          onPress={() => setEditingRound('new')}
        >
          <Text style={styles.buttonText}>Enter next round</Text>
        </Pressable>
      )}
      <Text accessibilityRole="header" style={styles.label}>
        Round history
      </Text>
      {match.rounds.length === 0 && (
        <Text style={styles.body}>
          No rounds saved yet. Enter a round to begin scoring.
        </Text>
      )}
      {match.rounds.map((round, index) => (
        <View key={round.id} style={{ gap: 12 }}>
          <Text style={styles.label}>
            Round {index + 1} · {round.input.dubleeWin ? 'Dublee' : 'Normal'}{' '}
            finish
          </Text>
          <Text style={styles.body}>
            Winner:{' '}
            {
              match.players.find((player) => player.id === round.input.winnerId)
                ?.name
            }
          </Text>
          {calculateMarriageRound(round.input).map((score) => {
            const input = round.input.players.find(
              (player) => player.playerId === score.playerId,
            )!;
            return (
              <Text key={score.playerId} style={styles.body}>
                {
                  match.players.find((player) => player.id === score.playerId)
                    ?.name
                }
                : {input.maal} maal · {input.seen ? 'Seen' : 'Unseen'} ·{' '}
                {score.points > 0 ? '+' : ''}
                {score.points} points
              </Text>
            );
          })}
          {!match.finishedAt && (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Correct round ${index + 1}`}
                disabled={busy}
                style={styles.button}
                onPress={() => setEditingRound(round)}
              >
                <Text style={styles.buttonText}>Correct round</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete round ${index + 1}`}
                disabled={busy}
                style={styles.button}
                onPress={() => confirmDelete(round)}
              >
                <Text style={styles.buttonText}>Delete round</Text>
              </Pressable>
            </>
          )}
        </View>
      ))}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        style={styles.button}
        onPress={confirmStatusChange}
      >
        <Text style={styles.buttonText}>
          {busy
            ? 'Saving changes…'
            : match.finishedAt
              ? 'Reopen match'
              : 'Finish match'}
        </Text>
      </Pressable>
      <Link href="/history" asChild>
        <Pressable accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>All saved matches</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}
