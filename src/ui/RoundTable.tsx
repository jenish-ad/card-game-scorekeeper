import Animated, { LinearTransition } from 'react-native-reanimated';
import { devanagariFonts } from '../theme';
import { useReducedMotion } from './useReducedMotion';
import { t, n } from '../i18n';
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
  const players = match.players.filter((player) =>
    match.rounds.some((round) =>
      round.input.players.some((entry) => entry.playerId === player.id),
    ),
  );
  const theme = useTheme();
  const reduced = useReducedMotion();
  const styles = useStyles();
  const { fontScale } = useWindowDimensions();
  const rowHeight = Math.ceil(48 * Math.max(1, fontScale));
  const rowSize = { height: rowHeight };
  const [width, setWidth] = useState(0);
  const { roundWidth, minimumPlayerWidth, fits } = roundTableLayout(
    width,
    players.length,
    fontScale,
  );
  const column: ViewStyle = fits ? { flex: 1 } : { width: minimumPlayerWidth };
  const totals = matchTotals(match);
  const totalStyle = {
    backgroundColor: theme.colors.surfaceSunken,
    borderColor: theme.colors.hairline,
  };
  const columns = (
    <View style={fits ? local.fill : undefined}>
      <View style={[local.row, rowSize]}>
        {players.map((player) => (
          <View key={player.id} style={[local.cell, rowSize, column]}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              accessibilityLabel={`${player.name}${!player.active ? `, ${t('Left')}` : ''}`}
              style={[
                styles.label,
                { textAlign: 'center' },
                /[\u0900-\u097f]/.test(player.name) && {
                  fontFamily: devanagariFonts.semibold,
                },
              ]}
            >
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
          <Animated.View
            key={round.id}
            layout={reduced ? undefined : LinearTransition.duration(260)}
          >
            <Pressable
              key={round.id}
              accessibilityRole="button"
              accessibilityLabel={t('Round {p0} details', { p0: index + 1 })}
              onPress={() => openRound(round.id)}
              style={({ pressed }) => [
                local.row,
                rowSize,
                {
                  backgroundColor: pressed
                    ? theme.colors.goldTint
                    : index % 2
                      ? theme.colors.surfaceSunken
                      : theme.colors.surface,
                  transform: [{ scale: pressed && !reduced ? 0.98 : 1 }],
                },
              ]}
            >
              {players.map((player) => (
                <View key={player.id} style={[local.cell, rowSize, column]}>
                  {round.input.kind === 'foul' &&
                    round.input.offenderId === player.id && (
                      <Text
                        style={[
                          styles.caption,
                          {
                            backgroundColor: theme.colors.lossTint,
                            color: theme.colors.scoreLoss,
                            borderRadius: 999,
                            paddingHorizontal: 5,
                          },
                        ]}
                      >
                        {t('foulMark')}
                      </Text>
                    )}
                  {scores.some((score) => score.playerId === player.id) ? (
                    <Score
                      compact
                      value={
                        scores.find((score) => score.playerId === player.id)!
                          .points
                      }
                    />
                  ) : (
                    <Text style={styles.caption}>–</Text>
                  )}
                </View>
              ))}
            </Pressable>
          </Animated.View>
        );
      })}
      <View style={[local.row, rowSize, local.total, totalStyle]}>
        {players.map((player) => (
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
      style={[
        local.table,
        theme.shadows.card,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <View
        style={[
          { width: roundWidth },
          { backgroundColor: theme.colors.surfaceSunken },
        ]}
      >
        <View style={[local.cell, rowSize, local.roundCell]}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.caption}>
            {t('Round')}
          </Text>
        </View>
        {match.rounds.map((round, index) => (
          <Pressable
            key={round.id}
            accessibilityRole="button"
            accessibilityLabel={t('Round {p0} details', { p0: index + 1 })}
            onPress={() => openRound(round.id)}
            style={[
              local.cell,
              rowSize,
              local.roundCell,
              {
                backgroundColor:
                  index % 2 ? theme.colors.surfaceSunken : theme.colors.surface,
              },
            ]}
          >
            <Text style={styles.caption}>
              {n(index + 1)}
              {round.input.kind === 'foul' ? ` ${t('foulMark')}` : ''}
            </Text>
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
            {t('Total')}
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
    borderRadius: 18,
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
  total: { borderTopWidth: StyleSheet.hairlineWidth },
});
