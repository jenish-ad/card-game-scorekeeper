import { useRef, useState, type ComponentRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { t, n } from '@/i18n';
import { devanagariFonts } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useStyles } from '@/ui/Screen';
import { matchTotals, type SavedMatch } from '@/features/marriage/data/matches';
import { scoreRound } from '@/features/marriage/domain/scoring';
import { roundTableLayout } from './roundTableLayout';
import { usePreferences } from '@/storage/PreferencesContext';

export function RoundTable({
  match,
  openRound,
}: {
  match: SavedMatch;
  openRound: (id: number) => void;
}) {
  const theme = useTheme();
  const { preferences } = usePreferences();
  const numberStyle = {
    fontSize: Math.max(
      theme.type.caption,
      preferences.numerals === 'devanagari' ? 15 : 12,
    ),
  };
  const styles = useStyles();
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const roundsScroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const showLatestRound = () =>
    roundsScroll.current?.scrollToEnd({ animated: false });
  const { nameWidth, totalWidth, roundWidth, fits } = roundTableLayout(
    width,
    match.rounds.length,
    fontScale,
  );
  const height = Math.ceil(44 * Math.max(1, fontScale));
  const players = match.players.filter((player) =>
    match.rounds.some((round) =>
      round.input.players.some((entry) => entry.playerId === player.id),
    ),
  );
  const totals = matchTotals(match);
  const header = {
    backgroundColor: theme.dark ? theme.colors.gainTint : theme.colors.gain,
  };
  const headerText = {
    color: theme.dark ? theme.colors.text : '#FFFFFF',
    fontFamily: theme.fonts.bold,
    fontSize: 12,
  };
  const cell = [local.cell, { height }];
  const stripe = (index: number) => ({
    backgroundColor:
      index % 2 ? theme.colors.surfaceSunken : theme.colors.surface,
    borderBottomColor: theme.colors.hairline,
    borderBottomWidth: StyleSheet.hairlineWidth,
  });
  const maalStyle = { backgroundColor: theme.colors.gainTint };
  const rounds = (
    <View style={local.row}>
      {match.rounds.map((round, index) => {
        const scores = scoreRound(
          round.input,
          match.ruleVersion,
          match.settings,
        );
        const maal =
          round.input.kind === 'foul'
            ? null
            : round.input.players.reduce(
                (sum, player) => sum + (player.seen ? player.maal : 0),
                0,
              );
        return (
          <View key={round.id} style={{ width: roundWidth }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Round {p0} details', { p0: index + 1 })}
              onPress={() => openRound(round.id)}
              style={[cell, header]}
            >
              <Text style={[headerText, numberStyle]}>{n(index + 1)}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('Maal')}, ${t('Round {p0}', { p0: index + 1 })}`}
              onPress={() => openRound(round.id)}
              style={[cell, maalStyle]}
            >
              <Text
                style={[
                  styles.caption,
                  numberStyle,
                  { color: theme.colors.scoreGain },
                ]}
              >
                {maal === null ? '–' : n(maal)}
              </Text>
            </Pressable>
            {players.map((player, row) => {
              const score = scores.find(
                (entry) => entry.playerId === player.id,
              );
              const winner =
                round.input.kind !== 'foul' &&
                round.input.winnerId === player.id;
              const foul =
                round.input.kind === 'foul' &&
                round.input.offenderId === player.id;
              const color =
                score && score.points < 0
                  ? theme.colors.scoreLoss
                  : theme.colors.text;
              return (
                <Pressable
                  key={player.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${player.name}, ${t('Round {p0} details', { p0: index + 1 })}, ${score ? n(score.points) : '–'}${winner ? `, ${t('Won the round')}` : ''}${foul ? `, ${t('Fouled')}` : ''}`}
                  onPress={() => openRound(round.id)}
                  style={({ pressed }) => [
                    cell,
                    stripe(row),
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <View
                    style={[
                      local.mark,
                      winner && {
                        borderWidth: 1,
                        borderColor: theme.colors.scoreGain,
                        borderRadius: 999,
                      },
                      foul && {
                        borderWidth: 1,
                        borderColor: theme.colors.scoreLoss,
                        borderRadius: 4,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.caption,
                        numberStyle,
                        { color, fontVariant: ['tabular-nums'] },
                      ]}
                    >
                      {score ? n(score.points) : '–'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
  return (
    <View style={[styles.card, { padding: 8, gap: 10 }]}>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={local.table}
      >
        <View style={{ width: nameWidth }}>
          <View style={[cell, header, local.name]}>
            <Text style={headerText}>{t('Round')}</Text>
          </View>
          <View style={[cell, maalStyle, local.name]}>
            <Text style={[styles.caption, { color: theme.colors.scoreGain }]}>
              {t('Maal')}
            </Text>
          </View>
          {players.map((player, index) => (
            <View key={player.id} style={[cell, stripe(index), local.name]}>
              <Text
                numberOfLines={1}
                accessibilityLabel={`${player.name}${!player.active ? `, ${t('Left')}` : ''}`}
                style={[
                  styles.caption,
                  {
                    color: theme.colors.text,
                    fontSize: theme.type.label,
                    fontFamily: /[\u0900-\u097f]/.test(player.name)
                      ? devanagariFonts.semibold
                      : theme.fonts.bold,
                  },
                ]}
              >
                {player.name}
              </Text>
            </View>
          ))}
        </View>
        {fits ? (
          rounds
        ) : (
          <ScrollView
            ref={roundsScroll}
            horizontal
            onLayout={showLatestRound}
            onContentSizeChange={showLatestRound}
            showsHorizontalScrollIndicator
            persistentScrollbar
            style={local.fill}
          >
            {rounds}
          </ScrollView>
        )}
        <View style={{ width: totalWidth }}>
          <View style={[cell, header]}>
            <Text style={headerText}>{t('Total')}</Text>
          </View>
          <View style={[cell, maalStyle]} />
          {players.map((player, index) => {
            const total = totals.get(player.id) ?? 0;
            return (
              <View key={player.id} style={[cell, stripe(index)]}>
                <Text
                  style={[
                    styles.caption,
                    numberStyle,
                    {
                      fontFamily: theme.fonts.bold,
                      color:
                        total < 0 ? theme.colors.scoreLoss : theme.colors.text,
                      fontVariant: ['tabular-nums'],
                    },
                  ]}
                >
                  {n(total)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={[local.row, { gap: 16, flexWrap: 'wrap' }]}>
        <View style={local.legend}>
          <View
            style={[
              local.symbol,
              { borderRadius: 999, borderColor: theme.colors.scoreGain },
            ]}
          />
          <Text style={styles.caption}>{t('Won the round')}</Text>
        </View>
        <View style={local.legend}>
          <View
            style={[
              local.symbol,
              { borderRadius: 3, borderColor: theme.colors.scoreLoss },
            ]}
          />
          <Text style={styles.caption}>{t('Fouled')}</Text>
        </View>
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  table: { flexDirection: 'row', overflow: 'hidden', borderRadius: 8 },
  row: { flexDirection: 'row' },
  fill: { flex: 1 },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  name: { alignItems: 'flex-start', paddingHorizontal: 6 },
  mark: {
    minWidth: 30,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  symbol: { width: 14, height: 14, borderWidth: 1 },
});
