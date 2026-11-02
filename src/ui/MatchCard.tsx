import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { displayMatchTitle } from '../i18n/matchText';
import { formatDate } from '../i18n/dates';
import { t, n } from '../i18n';
import type { SavedMatch } from '../features/marriage/matches';
import { matchStandings } from '../features/marriage/standings';
import { PlayerAvatar } from './PlayerAvatar';
import { ScoreText } from './ScoreText';
import { Button } from './Primitives';
import { Card } from './Card';
import { useStyles } from './Screen';
import { useMotionEnabled } from './useReducedMotion';
export function MatchCard({
  match,
  expanded = false,
  grouped = false,
}: {
  match: SavedMatch;
  expanded?: boolean;
  grouped?: boolean;
}) {
  const styles = useStyles();
  const router = useRouter();
  const reduced = !useMotionEnabled();
  const { rows, leaders } = matchStandings(match);
  const leader = leaders[0];
  const open = () => router.push(`/marriage/match/${match.id}`);
  if (expanded)
    return (
      <Card>
        <Text style={styles.subtitle}>{displayMatchTitle(match)}</Text>
        <Text style={styles.caption}>
          {t('roundCount', { count: match.rounds.length })} {'\u00b7'}{' '}
          {n(match.players.length)} {t('players')}
        </Text>
        {rows.slice(0, 3).map((row) => (
          <View
            key={row.player.id}
            style={[styles.spread, { paddingVertical: 6 }]}
          >
            <PlayerAvatar
              name={row.player.name}
              colorIndex={row.player.colorIndex ?? 0}
              size={28}
              leader={leaders.some((item) => item.player.id === row.player.id)}
              left={!row.player.active}
            />
            <Text style={[styles.label, styles.flexible]}>
              {row.player.name}
            </Text>
            <ScoreText value={row.total} size="md" />
          </View>
        ))}
        <Button label={t('Resume')} onPress={open} />
      </Card>
    );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t('Open')} ${displayMatchTitle(match)}`}
      onPress={open}
      style={({ pressed }) => [
        !grouped && styles.card,
        {
          gap: 8,
          paddingVertical: grouped ? 16 : 20,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed && !reduced ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.spread}>
        <View style={styles.flexible}>
          <Text style={styles.label}>{displayMatchTitle(match)}</Text>
          <Text style={styles.caption}>
            {formatDate(new Date(match.finishedAt ?? match.createdAt))}
          </Text>
        </View>
        {leader && (
          <PlayerAvatar
            name={leader.player.name}
            colorIndex={leader.player.colorIndex ?? 0}
            size={28}
          />
        )}
      </View>
      <View style={styles.spread}>
        <Text style={[styles.caption, styles.flexible]}>
          {leader
            ? `${leaders.length > 1 ? t('Tied') : t('Leader')} ${leaders.map((row) => row.player.name).join(', ')}`
            : `${n(match.players.length)} ${t('players')}`}
        </Text>
        {leader && <ScoreText value={leader.total} size="md" />}
      </View>
    </Pressable>
  );
}
