import { SceneLandscape } from '@/ui/SceneLandscape';
import { sceneHeader } from '@/ui/sceneHeader';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/useTheme';
import { displayMatchTitle, formatMoney } from '@/i18n/matchText';
import { t, n } from '@/i18n';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useMatches } from '@/features/marriage/data/useMatches';
import { matchTotals } from '@/features/marriage/data/matches';
import { moneyAmount, settleUp } from '@/features/marriage/domain/settlement';
import { Button } from '@/ui/Button';
import { Screen, useStyles } from '@/ui/Screen';

export default function SettleScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const c = theme.colors;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { match, loading, error, reload } = useMatches(Number(id));
  if (loading)
    return (
      <Screen>
        <ActivityIndicator accessibilityLabel={t('Loading')} />
      </Screen>
    );
  if (!match || error)
    return (
      <Screen>
        <Text accessibilityRole="alert" style={styles.error}>
          {error ?? t('Match not found.')}
        </Text>
        <Button label={t('Retry')} onPress={reload} />
      </Screen>
    );
  const rate = match.settings.moneyRate;
  if (rate === null)
    return (
      <Screen>
        <Text style={styles.body}>
          {t('Money rate is off for this match.')}
        </Text>
      </Screen>
    );
  const totals = matchTotals(match);
  const balances = match.players.map((player) => ({
    player,
    paisa: moneyAmount(totals.get(player.id) ?? 0, rate),
  }));
  const transfers = settleUp(
    balances.map(({ player, paisa }) => ({ playerId: player.id, paisa })),
  );
  const changingHands = transfers.reduce(
    (sum, transfer) => sum + transfer.paisa,
    0,
  );
  const playerName = (playerId: number) =>
    match.players.find((player) => player.id === playerId)?.name ?? '';
  return (
    <Screen>
      <View style={[local.hero, { backgroundColor: c.sky }]}>
        <SceneLandscape />
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 360 190"
          preserveAspectRatio="xMidYMax slice"
          style={StyleSheet.absoluteFill}
          accessible={false}
        >
          <Circle cx="42" cy="35" r="22" fill={c.sun} />
          <Ellipse cx="284" cy="142" rx="40" ry="6" fill={c.hillFront} />
          <Rect x="252" y="119" width="66" height="20" rx="9" fill="#DEA515" />
          <Ellipse cx="285" cy="119" rx="33" ry="8" fill="#F7CE4D" />
          <Rect x="252" y="106" width="66" height="16" rx="8" fill="#E6AE1B" />
          <Ellipse cx="285" cy="106" rx="33" ry="8" fill="#FFD75B" />
          <Path
            d="M181 103 L223 94 L228 122 L186 131Z"
            fill={c.surface}
            stroke={c.ink}
            strokeWidth="1.5"
          />
          <Circle
            cx="205"
            cy="113"
            r="7"
            fill="none"
            stroke={c.ink}
            strokeWidth="1.5"
          />
        </Svg>
        <Text
          style={{ color: c.text, fontFamily: theme.fonts.heavy, fontSize: 34 }}
        >
          {formatMoney(changingHands)}
        </Text>
        <Text style={[styles.caption, { color: c.text, maxWidth: '60%' }]}>
          {displayMatchTitle(match)}
        </Text>
      </View>
      <View
        style={[
          styles.card,
          { marginTop: -36, marginHorizontal: 10, padding: 12, gap: 10 },
        ]}
      >
        <View style={local.tiles}>
          {balances.map(({ player, paisa }) => {
            const positive = paisa > 0;
            const color = positive
              ? c.scoreGain
              : paisa < 0
                ? c.scoreLoss
                : c.goldText;
            return (
              <View
                key={player.id}
                style={[
                  local.tile,
                  {
                    backgroundColor: positive
                      ? c.gainTint
                      : paisa < 0
                        ? c.lossTint
                        : c.goldTint,
                  },
                ]}
              >
                <Text style={[styles.caption, { color }]}>
                  {t(
                    positive
                      ? '{name} gets'
                      : paisa < 0
                        ? '{name} pays'
                        : '{name} is settled',
                    { name: player.name },
                  )}
                </Text>
                <Text
                  style={{ fontFamily: theme.fonts.heavy, fontSize: 20, color }}
                >
                  {formatMoney(Math.abs(paisa))}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.spread}>
        <Text style={styles.label}>{t('Payments')}</Text>
      </View>
      {transfers.length ? (
        <View style={[styles.card, { gap: 0, paddingVertical: 4 }]}>
          {transfers.map((transfer, index) => (
            <View
              key={`${transfer.from}-${transfer.to}`}
              style={[
                local.payment,
                {
                  borderTopWidth: index ? StyleSheet.hairlineWidth : 0,
                  borderTopColor: c.hairline,
                },
              ]}
            >
              <View style={styles.flexible}>
                <View style={[styles.row, { gap: 6 }]}>
                  <Text style={[styles.label, { flexShrink: 1 }]}>
                    {playerName(transfer.from)}
                  </Text>
                  <Svg
                    width={28}
                    height={16}
                    viewBox="0 0 28 16"
                    accessible={false}
                  >
                    <Path
                      d="M2 8 H25 M19 2 L25 8 L19 14"
                      stroke={c.ink}
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={[styles.label, { flexShrink: 1 }]}>
                    {playerName(transfer.to)}
                  </Text>
                </View>
                <Text style={styles.caption}>
                  {t('{points} points', {
                    points: n(transfer.paisa / Math.round(rate * 100)),
                  })}
                </Text>
              </View>
              <Text
                style={[
                  styles.label,
                  { fontFamily: theme.fonts.heavy, fontSize: 16 },
                ]}
              >
                {formatMoney(transfer.paisa)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.body}>{t('No payments needed.')}</Text>
      )}
    </Screen>
  );
}

const local = StyleSheet.create({
  hero: sceneHeader,
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    flexBasis: '46%',
    flexGrow: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
});
