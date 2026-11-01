import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useMatches } from '../../features/marriage/useMatches';
import { theme } from '../../theme';
import { MatchCard } from '../../ui/MatchCard';
import { Button } from '../../ui/Primitives';
import { Screen, styles } from '../../ui/Screen';

export default function HistoryScreen() {
  const router = useRouter();
  const { matches, loading, error, reload } = useMatches();
  return (
    <Screen topSafeArea>
      <View style={styles.spread}>
        <Text style={styles.title}>Matches</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New Match"
          onPress={() => router.push('/marriage/setup')}
          style={{
            width: theme.touchTarget,
            height: theme.touchTarget,
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.button,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={styles.buttonText}>＋</Text>
        </Pressable>
      </View>
      {loading ? (
        <Text style={styles.body}>Loading matches…</Text>
      ) : error ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
          <Button label="Retry History" onPress={reload} />
        </>
      ) : !matches.length ? (
        <View
          style={[
            styles.card,
            { alignItems: 'center', paddingVertical: theme.spacing.xxl },
          ]}
        >
          <View
            accessible={false}
            style={{ flexDirection: 'row', padding: theme.spacing.xxl }}
          >
            <View
              style={{
                backgroundColor: theme.colors.goldLight,
                borderRadius: theme.radius.button,
                padding: theme.spacing.xl,
                transform: [{ rotate: '-12deg' }],
              }}
            >
              <Text style={[styles.title, { color: theme.colors.primary }]}>
                ♧
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.primaryTint,
                borderRadius: theme.radius.button,
                padding: theme.spacing.xl,
                transform: [{ rotate: '12deg' }],
              }}
            >
              <Text style={[styles.title, { color: theme.colors.primary }]}>
                ♦
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Every table has a first round</Text>
          <Text style={styles.body}>Your saved matches will appear here.</Text>
          <Button
            label="Start your first match"
            onPress={() => router.push('/marriage/setup')}
          />
        </View>
      ) : (
        <>
          {[false, true].map((finished) => (
            <View key={String(finished)} style={{ gap: theme.spacing.md }}>
              <Text style={styles.eyebrow}>
                {finished ? 'Finished' : 'In progress'}
              </Text>
              {matches
                .filter((match) => Boolean(match.finishedAt) === finished)
                .map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              {!matches.some(
                (match) => Boolean(match.finishedAt) === finished,
              ) && (
                <Text style={styles.body}>
                  No {finished ? 'finished' : 'active'} matches yet.
                </Text>
              )}
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}
