import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { matchTotals, type SavedMatch } from '../features/marriage/matches';
import { theme } from '../theme';
import { Avatar, Button, Chip, Score } from './Primitives';
import { styles } from './Screen';

export function MatchCard({
  match,
  expanded = false,
}: {
  match: SavedMatch;
  expanded?: boolean;
}) {
  const router = useRouter();
  const totals = matchTotals(match);
  const leader = [...match.players].sort(
    (a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0),
  )[0];
  const open = () => router.push(`/marriage/match/${match.id}`);
  return (
    <Pressable
      accessibilityRole="button"
      accessible={!expanded}
      accessibilityLabel={`Open ${match.title}, ${match.players.map((player) => player.name).join(', ')}, ${match.rounds.length} rounds, ${match.finishedAt ? 'Finished' : 'In progress'}`}
      onPress={open}
      style={[
        styles.card,
        !match.finishedAt && { backgroundColor: theme.colors.primaryTint },
      ]}
    >
      <View style={styles.spread}>
        <Text style={[styles.subtitle, { flex: 1 }]}>{match.title}</Text>
        <Chip>{match.finishedAt ? 'Finished' : 'In progress'}</Chip>
      </View>
      <Text style={styles.body}>
        {match.players.map((player) => player.name).join(', ')}
      </Text>
      <Text style={styles.body}>
        {new Date(match.createdAt).toLocaleDateString()} · {match.rounds.length}{' '}
        rounds
      </Text>
      {expanded && (
        <>
          <View style={styles.row}>
            {match.players.map((player) => (
              <Avatar key={player.id} name={player.name} seat={player.seat} />
            ))}
          </View>
          <View
            style={[styles.card, { backgroundColor: theme.colors.surfaceAlt }]}
          >
            <Text style={styles.eyebrow}>Leading</Text>
            {match.rounds.length ? (
              <View style={styles.spread}>
                <Text style={styles.label}>{leader.name}</Text>
                <Score compact value={totals.get(leader.id) ?? 0} />
              </View>
            ) : (
              <Text style={styles.label}>Ready for the first round</Text>
            )}
          </View>
          <Button label="Resume Match →" secondary onPress={open} />
        </>
      )}
    </Pressable>
  );
}
