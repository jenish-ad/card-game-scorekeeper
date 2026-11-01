import { StyleSheet, Text, View } from 'react-native';
import type { SavedMatch } from '../features/marriage/matches';
import { matchStandings } from '../features/marriage/standings';
import { formatMoney, moneyAmount } from '../features/marriage/settlement';
import { useTheme } from '../useTheme';
import { Avatar, Score } from './Primitives';
import { useStyles } from './Screen';
export function StandingsBoard({ match }: { match: SavedMatch }) {
  const styles = useStyles();
  const theme = useTheme();
  const { rows, leaders, gap } = matchStandings(match);
  return (
    <View>
      {rows.map((row) => (
        <View
          key={row.player.id}
          style={[
            styles.ruledRow,
            local.row,
            row.rank === 1 &&
              match.rounds.length > 0 && {
                backgroundColor: theme.colors.primaryTint,
              },
          ]}
        >
          <Text style={[styles.caption, local.rank]}>{row.rank}</Text>
          <Avatar name={row.player.name} />
          <View style={styles.flexible}>
            <Text style={styles.label}>{row.player.name}</Text>
            {row.rank === 1 && leaders.length === 1 && gap > 0 && (
              <Text style={styles.caption}>+{gap} vs 2nd</Text>
            )}
          </View>
          <View>
            <Score value={row.total} />
            {match.settings.moneyRate !== null && (
              <Text style={styles.caption}>
                {formatMoney(moneyAmount(row.total, match.settings.moneyRate))}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
const local = StyleSheet.create({
  row: { paddingHorizontal: 8, borderRadius: 12 },
  rank: { width: 20, textAlign: 'center' },
});
