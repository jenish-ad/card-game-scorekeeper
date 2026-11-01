import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { SavedMatch } from '../features/marriage/matches';
import { matchStandings } from '../features/marriage/standings';
import { Icon } from './Icon';
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
        {match.players.length} players {'\u00b7'} {match.rounds.length} rounds
      </Text>
      {leader && (
        <View style={styles.spread}>
          <Text style={[styles.label, styles.flexible]}>
            {leaders.length > 1 ? 'Tied' : 'Leader'} {'\u00b7'}{' '}
            {leaders.map((row) => row.player.name).join(', ')}
          </Text>
          <Score compact value={leader.total} />
        </View>
      )}
      {expanded && (
        <View style={styles.spread}>
          <Text style={styles.label}>Resume</Text>
          <Icon name="chevron-forward" />
        </View>
      )}
    </Pressable>
  );
}
