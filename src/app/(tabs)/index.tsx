import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useMatches } from '../../features/marriage/useMatches';
import { theme } from '../../theme';
import { MatchCard } from '../../ui/MatchCard';
import { Button } from '../../ui/Primitives';
import { Screen, styles } from '../../ui/Screen';

export default function HomeScreen() {
  const router = useRouter();
  const { matches, loading, error, reload } = useMatches();
  const active = matches.find((match) => !match.finishedAt);
  const recent = matches.find((match) => match.finishedAt);
  return (
    <Screen topSafeArea>
      <View style={styles.row}>
        <View
          style={{
            transform: [{ rotate: '-10deg' }],
            borderRadius: theme.radius.button,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.primary,
          }}
        >
          <Text style={{ color: theme.colors.goldLight, fontSize: 24 }}>♦</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
            Marriage Scorekeeper
          </Text>
          <Text style={[styles.body, { fontSize: 11 }]}>
            Play a round, record a round.
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/marriage/setup')}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ fontSize: 32, color: theme.colors.goldLight }}>＋</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { color: theme.colors.surface, fontSize: 18 },
            ]}
          >
            New Match
          </Text>
          <Text style={[styles.body, { color: theme.colors.surface }]}>
            Set up 2–5 players
          </Text>
        </View>
        <Text style={{ color: theme.colors.surface, fontSize: 24 }}>›</Text>
      </Pressable>
      <Text style={styles.eyebrow}>Active match</Text>
      {loading ? (
        <Text style={styles.body}>Loading matches…</Text>
      ) : error ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
          <Button label="Retry" onPress={reload} />
        </>
      ) : active ? (
        <MatchCard match={active} expanded />
      ) : (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Your table is ready</Text>
          <Text style={styles.body}>
            Start a new match to keep every round together.
          </Text>
        </View>
      )}
      <View style={styles.spread}>
        <Text style={styles.eyebrow}>Recent</Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/history')}
          style={{ minHeight: theme.touchTarget, justifyContent: 'center' }}
        >
          <Text style={[styles.label, { color: theme.colors.primary }]}>
            Match history ›
          </Text>
        </Pressable>
      </View>
      {recent ? (
        <MatchCard match={recent} />
      ) : (
        <Text style={styles.body}>Finished matches will appear here.</Text>
      )}
    </Screen>
  );
}
