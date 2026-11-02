import { UnavailableMatchCard } from '../../ui/UnavailableMatchCard';
import { t } from '../../i18n';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { useMatches } from '../../features/marriage/useMatches';
import { MatchCard } from '../../ui/MatchCard';
import { Button, SectionHeading } from '../../ui/Primitives';
import { Screen, useStyles } from '../../ui/Screen';
export default function HomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { matches, unavailable, loading, error, reload } = useMatches();
  const active = matches.filter((match) => !match.finishedAt);
  const recent = matches.filter((match) => match.finishedAt).slice(0, 3);
  return (
    <Screen topSafeArea>
      <Text style={styles.title}>{t('Marriage')}</Text>
      {loading ? (
        <ActivityIndicator accessibilityLabel={t('Loading')} />
      ) : error ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
          <Button label={t('Try again')} onPress={reload} />
        </>
      ) : (
        active.map((match) => (
          <MatchCard key={match.id} match={match} expanded />
        ))
      )}
      <Button
        label={t('New match')}
        onPress={() => router.push('/marriage/setup')}
      />
      {recent.length > 0 && <SectionHeading title={t('Recent')} />}
      {recent.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
      {unavailable.map((entry) => (
        <UnavailableMatchCard key={entry.id} />
      ))}
    </Screen>
  );
}
