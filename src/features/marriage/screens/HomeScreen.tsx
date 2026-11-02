import { KQMark } from '@/ui/KQMark';
import { Card } from '@/ui/Card';
import { UnavailableMatchCard } from '@/features/marriage/components/UnavailableMatchCard';
import { t } from '@/i18n';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useMatches } from '@/features/marriage/data/useMatches';
import { MatchCard } from '@/features/marriage/components/MatchCard';
import { Button } from '@/ui/Button';
import { SectionHeading } from '@/ui/SectionHeading';
import { Screen, useStyles } from '@/ui/Screen';
export default function HomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { matches, unavailable, loading, error, reload } = useMatches();
  const active = matches.filter((match) => !match.finishedAt);
  const recent = matches.filter((match) => match.finishedAt).slice(0, 3);
  return (
    <Screen topSafeArea>
      <View style={styles.spread}>
        <View style={styles.row}>
          <KQMark />
          <Text style={styles.title}>{t('Marriage')}</Text>
        </View>
        <Button
          ghost
          iconOnly
          label={t('Settings')}
          icon="settings-outline"
          onPress={() => router.push('/(tabs)/rules')}
        />
      </View>
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
        active.map((match, index) => (
          <MatchCard key={match.id} match={match} expanded={index === 0} />
        ))
      )}
      {!loading && !error && active.length === 0 && (
        <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
          <KQMark size={120} />
          <Text style={styles.body}>{t('No active matches yet.')}</Text>
        </Card>
      )}
      <Button
        secondary={active.length > 0}
        label={t('New match')}
        onPress={() => router.push('/marriage/setup')}
      />
      {recent.length > 0 && <SectionHeading title={t('Recent')} />}
      {recent.length > 0 && (
        <Card style={{ gap: 0 }}>
          {recent.map((match, index) => (
            <View key={match.id}>
              {index > 0 && <View style={styles.divider} />}
              <MatchCard match={match} grouped />
            </View>
          ))}
        </Card>
      )}
      {unavailable.map((entry) => (
        <UnavailableMatchCard key={entry.id} />
      ))}
    </Screen>
  );
}
