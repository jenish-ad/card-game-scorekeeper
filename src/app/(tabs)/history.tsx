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
  const { matches, loading, error, reload } = useMatches();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Finished'>('All');
  const filtered = matches.filter(
    (match) =>
      filter === 'All' || Boolean(match.finishedAt) === (filter === 'Finished'),
  );
  return (
    <Screen topSafeArea>
      <Text style={styles.title}>History</Text>
      <View style={styles.row}>
        {(['All', 'Active', 'Finished'] as const).map((label) => (
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
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator accessibilityLabel="Loading" />
      ) : error ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
          <Button label="Try again" onPress={reload} />
        </>
      ) : filtered.length ? (
        filtered.map((match) => <MatchCard key={match.id} match={match} />)
      ) : (
        <Text style={styles.body}>
          No {filter === 'All' ? '' : filter.toLowerCase() + ' '}matches yet.
        </Text>
      )}
      <Button
        label="New match"
        onPress={() => router.push('/marriage/setup')}
      />
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
