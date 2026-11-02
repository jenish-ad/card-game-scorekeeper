import { t } from '../../../i18n';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { useMatches } from '../../../features/marriage/useMatches';
import { RoundEditor } from '../../../features/marriage/RoundEditor';
import { Button } from '../../../ui/Primitives';
import { Screen, useStyles } from '../../../ui/Screen';

export default function AddRoundScreen() {
  const styles = useStyles();
  const { id, roundId } = useLocalSearchParams<{
    id: string;
    roundId?: string;
  }>();
  const { match, loading, error, reload } = useMatches(Number(id));
  const router = useRouter();
  if (loading)
    return (
      <Screen>
        <ActivityIndicator accessibilityLabel={t('Loading')} />
      </Screen>
    );
  if (!match || error)
    return (
      <Screen>
        <Text style={styles.error}>{error ?? t('Match not found.')}</Text>
        <Button label={t('Retry')} onPress={reload} />
      </Screen>
    );
  if (match.finishedAt)
    return (
      <Screen>
        <Text style={styles.body}>
          {t('Reopen the match before changing its rounds.')}
        </Text>
        <Button label={t('Back to Scoreboard')} onPress={() => router.back()} />
      </Screen>
    );
  const round = roundId
    ? match.rounds.find((entry) => entry.id === Number(roundId))
    : undefined;
  if (roundId && !round)
    return (
      <Screen>
        <Text style={styles.error}>{t('Round not found.')}</Text>
      </Screen>
    );
  return (
    <>
      <Stack.Screen
        options={{ title: round ? t('Edit round') : t('Add round') }}
      />
      <RoundEditor
        key={`${match.id}-${roundId ?? 'new'}`}
        match={match}
        round={round}
      />
    </>
  );
}
