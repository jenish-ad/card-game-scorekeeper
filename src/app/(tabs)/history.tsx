import { Card } from '../../ui/Card';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { UnavailableMatchCard } from '../../ui/UnavailableMatchCard';
import { t } from '../../i18n';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useMatches } from '../../features/marriage/useMatches';
import { MatchCard } from '../../ui/MatchCard';
import { Button } from '../../ui/Primitives';
import { Screen, useStyles } from '../../ui/Screen';
export default function HistoryScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { matches, unavailable, loading, error, reload } = useMatches();
  const [filter, setFilter] = useState<'all' | 'active' | 'finished'>('all');
  const filtered = matches.filter(
    (match) =>
      filter === 'all' || Boolean(match.finishedAt) === (filter === 'finished'),
  );
  return (
    <Screen topSafeArea>
      <Text style={styles.title}>{t('History')}</Text>
      <SegmentedControl
        label={t('History')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('All') },
          { value: 'active', label: t('Active') },
          { value: 'finished', label: t('Finished') },
        ]}
      />
      {loading ? (
        <ActivityIndicator accessibilityLabel={t('Loading')} />
      ) : error ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
          <Button label={t('Try again')} onPress={reload} />
        </>
      ) : filtered.length ? (
        <Card style={{ gap: 0 }}>
          {filtered.map((match, index) => (
            <View key={match.id}>
              {index > 0 && <View style={styles.divider} />}
              <MatchCard match={match} grouped />
            </View>
          ))}
        </Card>
      ) : unavailable.length ? null : (
        <Text style={styles.body}>
          {filter === 'all'
            ? t('No matches yet.')
            : filter === 'active'
              ? t('No active matches yet.')
              : t('No finished matches yet.')}
        </Text>
      )}
      <Button
        label={t('New match')}
        onPress={() => router.push('/marriage/setup')}
      />
      {unavailable.map((entry) => (
        <UnavailableMatchCard key={entry.id} />
      ))}
    </Screen>
  );
}
