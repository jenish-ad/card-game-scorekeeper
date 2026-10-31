import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { listMatches, type SavedMatch } from '../features/marriage/matches';
import { useMatchDatabase } from '../storage/MatchStorageProvider';
import { Screen, styles } from '../ui/Screen';

export default function MatchHistoryScreen() {
  const [attempt, setAttempt] = useState(0);
  return (
    <MatchHistory
      key={attempt}
      onRetry={() => setAttempt((value) => value + 1)}
    />
  );
}

function MatchHistory({ onRetry }: { onRetry: () => void }) {
  const database = useMatchDatabase();
  const [matches, setMatches] = useState<SavedMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setError(null);
      setMatches(null);
      listMatches(database)
        .then((saved) => {
          if (!cancelled) setMatches(saved);
        })
        .catch((failure: unknown) => {
          if (!cancelled)
            setError(
              failure instanceof Error
                ? failure.message
                : 'Could not read saved matches.',
            );
        });
      return () => {
        cancelled = true;
      };
    }, [database]),
  );

  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        Your table, saved
      </Text>
      <Text style={styles.body}>
        Matches are stored on this device. Select an unfinished match to resume.
      </Text>
      {error ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            Could not load history: {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.button}
            onPress={onRetry}
          >
            <Text style={styles.buttonText}>Retry history</Text>
          </Pressable>
        </>
      ) : matches === null ? (
        <Text style={styles.body}>Loading matches…</Text>
      ) : matches.length === 0 ? (
        <Text style={styles.body}>
          No saved matches yet. Set up Marriage to start your first one.
        </Text>
      ) : (
        <>
          {(['active', 'finished'] as const).map((status) => (
            <View key={status} style={{ gap: 16 }}>
              <Text accessibilityRole="header" style={styles.label}>
                {status === 'active'
                  ? 'Unfinished matches'
                  : 'Finished matches'}
              </Text>
              {matches
                .filter(
                  (match) =>
                    Boolean(match.finishedAt) === (status === 'finished'),
                )
                .map((match) => (
                  <Link
                    key={match.id}
                    href={`/marriage/match/${match.id}`}
                    asChild
                  >
                    <Pressable accessibilityRole="button" style={styles.button}>
                      <Text style={styles.buttonText}>
                        Match {match.id} ·{' '}
                        {new Date(match.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={styles.buttonText}>
                        {match.players.map((player) => player.name).join(', ')}
                      </Text>
                      <Text style={styles.buttonText}>
                        {match.rounds.length} rounds ·{' '}
                        {match.finishedAt ? 'View result' : 'Resume'}
                      </Text>
                    </Pressable>
                  </Link>
                ))}
              {!matches.some(
                (match) =>
                  Boolean(match.finishedAt) === (status === 'finished'),
              ) && (
                <Text style={styles.body}>
                  No {status === 'active' ? 'unfinished' : 'finished'} matches.
                </Text>
              )}
            </View>
          ))}
        </>
      )}
      <Link href="/marriage/setup" asChild>
        <Pressable accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>Set up another match</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}
