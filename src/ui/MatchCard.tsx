import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { SavedMatch } from '../features/marriage/matches';
import { matchStandings } from '../features/marriage/standings';
import { Score } from './Primitives';
import { useStyles } from './Screen';
export function MatchCard({
  match,
  expanded = false,
}: {
  match: SavedMatch;
  expanded?: boolean;
}) {
  const styles = useStyles();
  const router = useRouter();
  const { leaders } = matchStandings(match);
  const leader = leaders[0];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${expanded ? 'Resume' : 'Open'} ${match.title}`}
      onPress={() => router.push(`/marriage/match/${match.id}`)}
      style={styles.card}
    >
      <Text style={styles.subtitle}>{match.title}</Text>
      <Text style={styles.caption}>
        {match.players.map((player) => player.name).join(', ')}
      </Text>
      <Text style={styles.caption}>
        {match.players.length} players / {match.rounds.length} rounds
      </Text>
      {leader && (
        <View style={styles.spread}>
          <Text style={[styles.label, styles.flexible]}>
            {leaders.map((row) => row.player.name).join(', ')}
          </Text>
          <Score compact value={leader.total} />
        </View>
      )}
      {expanded && <Text style={styles.label}>Resume</Text>}
    </Pressable>
  );
}
