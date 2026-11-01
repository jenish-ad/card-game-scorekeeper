import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { useMatches } from '../../../features/marriage/useMatches';
import { RoundEditor } from '../../../features/marriage/RoundEditor';
import { Button } from '../../../ui/Primitives';
import { Screen, styles } from '../../../ui/Screen';

export default function AddRoundScreen() {
  const { id, roundId } = useLocalSearchParams<{
    id: string;
    roundId?: string;
  }>();
  const { match, loading, error, reload } = useMatches(Number(id));
  const router = useRouter();
  if (loading)
    return (
      <Screen>
        <Text style={styles.body}>Loading round…</Text>
      </Screen>
    );
  if (!match || error)
    return (
      <Screen>
        <Text style={styles.error}>{error ?? 'Match not found.'}</Text>
        <Button label="Retry" onPress={reload} />
      </Screen>
    );
  if (match.finishedAt)
    return (
      <Screen>
        <Text style={styles.body}>
          Reopen the match before changing its rounds.
        </Text>
        <Button label="Back to Scoreboard" onPress={() => router.back()} />
      </Screen>
    );
  const round = roundId
    ? match.rounds.find((entry) => entry.id === Number(roundId))
    : undefined;
  if (roundId && !round)
    return (
      <Screen>
        <Text style={styles.error}>Round not found.</Text>
      </Screen>
    );
  return (
    <>
      <Stack.Screen options={{ title: round ? 'Edit Round' : 'Add Round' }} />
      <RoundEditor
        key={`${match.id}-${roundId ?? 'new'}`}
        match={match}
        round={round}
      />
    </>
  );
}
