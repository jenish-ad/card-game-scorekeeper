import { LinearGradient } from 'expo-linear-gradient';
import { roundTableLayout } from './roundTableLayout';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
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
  const { fontScale } = useWindowDimensions();
  const rowHeight = Math.ceil(48 * Math.max(1, fontScale));
  const rowSize = { height: rowHeight };
  const [width, setWidth] = useState(0);
  const { roundWidth, minimumPlayerWidth, fits } = roundTableLayout(
    width,
    match.players.length,
    fontScale,
  );
  const column: ViewStyle = fits ? { flex: 1 } : { width: minimumPlayerWidth };
  const totals = matchTotals(match);
  const totalStyle = {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
  };
  const columns = (
    <View style={fits ? local.fill : undefined}>
      <View style={[local.row, rowSize]}>
        {match.players.map((player) => (
          <View key={player.id} style={[local.cell, rowSize, column]}>
            <Text
              numberOfLines={1}
              accessibilityLabel={player.name}
              style={styles.label}
            >
              {player.name.slice(0, 6)}
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
              rowSize,
              local.border,
              { borderColor: theme.colors.border },
            ]}
          >
            {match.players.map((player) => (
              <View key={player.id} style={[local.cell, rowSize, column]}>
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
      <View style={[local.row, rowSize, local.total, totalStyle]}>
        {match.players.map((player) => (
          <View key={player.id} style={[local.cell, rowSize, column]}>
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
          { width: roundWidth },
          { backgroundColor: theme.colors.surfaceAlt },
        ]}
      >
        <View style={[local.cell, rowSize, local.roundCell]}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.caption}>
            Round
          </Text>
        </View>
        {match.rounds.map((round, index) => (
          <Pressable
            key={round.id}
            accessibilityRole="button"
            accessibilityLabel={`Round ${index + 1} details`}
            onPress={() => openRound(round.id)}
            style={[
              local.cell,
              rowSize,
              local.roundCell,
              local.border,
              { borderColor: theme.colors.border },
            ]}
          >
            <Text style={styles.label}>{index + 1}</Text>
          </Pressable>
        ))}
        <View
          style={[
            local.cell,
            rowSize,
            local.roundCell,
            local.total,
            totalStyle,
          ]}
        >
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.label}>
            Total
          </Text>
        </View>
      </View>
      {fits ? (
        columns
      ) : (
        <ScrollView
          horizontal
          persistentScrollbar
          showsHorizontalScrollIndicator
          style={local.fill}
        >
          {columns}
        </ScrollView>
      )}
      {!fits && (
        <LinearGradient
          pointerEvents="none"
          colors={[`${theme.colors.surface}00`, theme.colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={local.fade}
        />
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
  fade: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 20 },
  fill: { flex: 1 },
  row: { flexDirection: 'row', height: 48 },
  cell: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  roundCell: { paddingHorizontal: 0 },
  border: { borderTopWidth: 1 },
  total: { borderTopWidth: 2 },
});
