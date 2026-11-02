import { UnavailableMatchCard } from '../../ui/UnavailableMatchCard';
import { t } from '../../i18n';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMatches } from '../../features/marriage/useMatches';
import { useTheme } from '../../useTheme';
import { MatchCard } from '../../ui/MatchCard';
import { Button } from '../../ui/Primitives';
import { Screen, useStyles } from '../../ui/Screen';
export default function HistoryScreen() {
  const theme = useTheme();
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
      <View style={styles.row}>
        {(['all', 'active', 'finished'] as const).map((label) => (
          <Pressable
            key={label}
            accessibilityRole="radio"
            accessibilityState={{ checked: filter === label }}
            onPress={() => setFilter(label)}
            style={[
              local.filter,
              {
                backgroundColor:
                  filter === label
                    ? theme.colors.primary
                    : theme.colors.surfaceAlt,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    filter === label
                      ? theme.colors.onPrimary
                      : theme.colors.textMuted,
                },
              ]}
            >
              {label === 'all'
                ? t('All')
                : label === 'active'
                  ? t('Active')
                  : t('Finished')}
            </Text>
          </Pressable>
        ))}
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
      ) : filtered.length ? (
        filtered.map((match) => <MatchCard key={match.id} match={match} />)
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
const local = StyleSheet.create({
  filter: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
