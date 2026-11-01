import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useState } from 'react';
import type { SavedMatch } from '../features/marriage/matches';
import { matchTotals } from '../features/marriage/matches';
import { scoreRound } from '../features/marriage/scoring';
import { useTheme } from '../useTheme';
import { Score } from './Primitives';
import { useStyles } from './Screen';
export function RoundTable({
  match,
  openRound,
}: {
  match: SavedMatch;
  openRound: (id: number) => void;
}) {
  const theme = useTheme();
  const styles = useStyles();
  const [width, setWidth] = useState(0);
  const available = Math.max(0, width - 58);
  const fits = available / match.players.length >= 64;
  const column: ViewStyle = fits ? { flex: 1 } : { width: 80 };
  const totals = matchTotals(match);
  const totalStyle = {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
  };
  const columns = (
    <View style={fits ? local.fill : undefined}>
      <View style={local.row}>
        {match.players.map((player) => (
          <View key={player.id} style={[local.cell, column]}>
            <Text numberOfLines={1} style={styles.label}>
              {player.name}
            </Text>
          </View>
        ))}
      </View>
      {match.rounds.map((round, index) => {
        const scores = scoreRound(
          round.input,
          match.ruleVersion,
          match.settings,
        );
        return (
          <Pressable
            key={round.id}
            accessibilityRole="button"
            accessibilityLabel={`Round ${index + 1} details`}
            onPress={() => openRound(round.id)}
            style={[
              local.row,
              local.border,
              { borderColor: theme.colors.border },
            ]}
          >
            {match.players.map((player) => (
              <View key={player.id} style={[local.cell, column]}>
                <Score
                  compact
                  value={
                    scores.find((score) => score.playerId === player.id)
                      ?.points ?? 0
                  }
                />
              </View>
            ))}
          </Pressable>
        );
      })}
      <View style={[local.row, local.total, totalStyle]}>
        {match.players.map((player) => (
          <View key={player.id} style={[local.cell, column]}>
            <Score compact value={totals.get(player.id) ?? 0} />
          </View>
        ))}
      </View>
    </View>
  );
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[local.table, { borderColor: theme.colors.border }]}
    >
      <View
        style={[
          local.roundColumn,
          { backgroundColor: theme.colors.surfaceAlt },
        ]}
      >
        <View style={local.cell}>
          <Text style={styles.caption}>Round</Text>
        </View>
        {match.rounds.map((round, index) => (
          <Pressable
            key={round.id}
            accessibilityRole="button"
            accessibilityLabel={`Round ${index + 1} details`}
            onPress={() => openRound(round.id)}
            style={[
              local.cell,
              local.border,
              { borderColor: theme.colors.border },
            ]}
          >
            <Text style={styles.label}>{index + 1}</Text>
          </Pressable>
        ))}
        <View style={[local.cell, local.total, totalStyle]}>
          <Text style={styles.label}>Total</Text>
        </View>
      </View>
      {fits ? (
        columns
      ) : (
        <ScrollView horizontal style={local.fill}>
          {columns}
        </ScrollView>
      )}
    </View>
  );
}
const local = StyleSheet.create({
  table: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fill: { flex: 1 },
  roundColumn: { width: 58 },
  row: { flexDirection: 'row', height: 48 },
  cell: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  border: { borderTopWidth: 1 },
  total: { borderTopWidth: 2 },
});
