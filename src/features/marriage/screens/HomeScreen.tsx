import { KQMark } from '@/ui/KQMark';
import { Card } from '@/ui/Card';
import { UnavailableMatchCard } from '@/features/marriage/components/UnavailableMatchCard';
import { t } from '@/i18n';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useMatches } from '@/features/marriage/data/useMatches';
import { MatchCard } from '@/features/marriage/components/MatchCard';
import { Button } from '@/ui/Button';
import { HomeHero } from '@/features/marriage/components/HomeHero';
import { Screen, useStyles } from '@/ui/Screen';
export default function HomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { matches, unavailable, loading, error, reload } = useMatches();
  const active = matches.filter((match) => !match.finishedAt);
  const recent = matches.filter((match) => match.finishedAt).slice(0, 3);
  return (
    <Screen topSafeArea>
      <View
        style={{
          marginBottom: !loading && !error && active.length > 0 ? -76 : 0,
        }}
      >
        <HomeHero />
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
          <View
            key={match.id}
            style={index === 0 ? { marginHorizontal: 0 } : undefined}
          >
            <MatchCard match={match} expanded={index === 0} reload={reload} />
          </View>
        ))
      )}
      {!loading && !error && active.length === 0 && (
        <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
          <KQMark size={120} />
          <Text style={styles.body}>{t('No active matches yet.')}</Text>
        </Card>
      )}
      {recent.length > 0 && (
        <View style={styles.spread}>
          <Text style={styles.label}>{t('Recent')}</Text>
          <View>
            <Button
              ghost
              label={t('See all')}
              onPress={() => router.push('/(tabs)/history')}
            />
          </View>
        </View>
      )}
      {recent.length > 0 && (
        <Card style={{ gap: 0 }}>
          {recent.map((match, index) => (
            <View key={match.id}>
              {index > 0 && <View style={styles.divider} />}
              <MatchCard match={match} grouped reload={reload} />
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
