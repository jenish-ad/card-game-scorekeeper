import { Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { t, n } from '../i18n';
import type { SavedMatch } from '../features/marriage/matches';
import { matchStandings } from '../features/marriage/standings';
import { moneyAmount } from '../features/marriage/settlement';
import { formatMoney } from '../i18n/matchText';
import { useTheme } from '../useTheme';
import { PlayerAvatar } from './PlayerAvatar';
import { ScoreText } from './ScoreText';
import { Card } from './Card';
import { useReducedMotion } from './useReducedMotion';
import { useStyles } from './Screen';
export function StandingsBoard({ match }: { match: SavedMatch }) {
  const styles = useStyles();
  const theme = useTheme();
  const reduced = useReducedMotion();
  const { rows, leaders, gap } = matchStandings(match);
  const leader = leaders[0];
  return (
    <View style={{ gap: theme.spacing.lg }}>
      {leader && (
        <Card style={{ backgroundColor: theme.colors.goldTint }}>
          <Text style={[styles.caption, { color: theme.colors.goldText }]}>
            {leaders.length > 1 ? t('Tied') : t('Leader')}
          </Text>
          {leaders.map((row) => (
            <View key={row.player.id} style={styles.spread}>
              <PlayerAvatar
                name={row.player.name}
                seat={row.player.seat}
                size={44}
                leader
                left={!row.player.active}
              />
              <Text style={[styles.subtitle, styles.flexible]}>
                {row.player.name}
              </Text>
              <ScoreText value={row.total} size="xl" />
            </View>
          ))}
          {gap > 0 && (
            <Text style={[styles.caption, { color: theme.colors.goldText }]}>
              +{n(gap)} {t('vs 2nd')} {'\u00b7'} {rows[1]?.player.name}
            </Text>
          )}
        </Card>
      )}
      <Card style={{ gap: 0 }}>
        {rows.map((row, index) => (
          <Animated.View
            key={row.player.id}
            layout={reduced ? undefined : LinearTransition.duration(260)}
            style={[styles.row, { paddingVertical: 14 }]}
          >
            {index > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: theme.colors.hairline,
                }}
              />
            )}
            <Text style={[styles.caption, { width: 14 }]}>{n(row.rank)}</Text>
            <PlayerAvatar
              name={row.player.name}
              seat={row.player.seat}
              size={36}
              left={!row.player.active}
            />
            <View style={styles.flexible}>
              <Text style={styles.label}>{row.player.name}</Text>
              {!row.player.active && (
                <Text style={styles.caption}>{t('Left')}</Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
              <ScoreText value={row.total} size="lg" />
              {match.settings.moneyRate !== null && (
                <Text
                  numberOfLines={1}
                  style={[styles.caption, { lineHeight: undefined }]}
                >
                  {formatMoney(
                    moneyAmount(row.total, match.settings.moneyRate),
                  )}
                </Text>
              )}
            </View>
          </Animated.View>
        ))}
      </Card>
    </View>
  );
}
