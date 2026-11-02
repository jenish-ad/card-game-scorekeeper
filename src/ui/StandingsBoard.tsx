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
import { useMotionEnabled } from './useReducedMotion';
import { useStyles } from './Screen';
export function StandingsBoard({ match }: { match: SavedMatch }) {
  const styles = useStyles();
  const theme = useTheme();
  const reduced = !useMotionEnabled();
  const { rows } = matchStandings(match);
  return (
    <Card style={{ gap: 0 }}>
      {rows.map((row, index) => (
        <Animated.View
          key={row.player.id}
          layout={reduced ? undefined : LinearTransition.duration(260)}
          style={[
            styles.row,
            {
              paddingVertical: 14,
              paddingHorizontal: theme.spacing.sm,
              borderRadius: theme.radius.button,
              backgroundColor:
                row.rank === 1 && match.rounds.length > 0
                  ? theme.colors.goldTint
                  : 'transparent',
            },
          ]}
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
            colorIndex={row.player.colorIndex ?? 0}
            size={36}
            leader={row.rank === 1 && match.rounds.length > 0}
            left={!row.player.active}
          />
          <View style={styles.flexible}>
            <Text style={styles.label}>{row.player.name}</Text>
            {!row.player.active && (
              <Text style={styles.caption}>{t('Left')}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
            <ScoreText animate value={row.total} size="lg" />
            {match.settings.moneyRate !== null && (
              <Text
                numberOfLines={1}
                style={[styles.caption, { lineHeight: undefined }]}
              >
                {formatMoney(moneyAmount(row.total, match.settings.moneyRate))}
              </Text>
            )}
          </View>
        </Animated.View>
      ))}
    </Card>
  );
}
