import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { displayMatchTitle } from '@/i18n/matchText';
import { formatDate } from '@/i18n/dates';
import { t, n, currentPreferences } from '@/i18n';
import { useTheme } from '@/theme/useTheme';
import type { SavedMatch } from '@/features/marriage/data/matches';
import { matchStandings } from '@/features/marriage/domain/standings';
import { ScoreText } from '@/ui/ScoreText';
import { Button } from '@/ui/Button';
import { MatchCardActions } from './MatchCardActions';
import { useStyles } from '@/ui/Screen';
import { useMotionEnabled } from '@/theme/useReducedMotion';
export function MatchCard({
  match,
  expanded = false,
  grouped = false,
  compact = false,
  reload,
}: {
  match: SavedMatch;
  expanded?: boolean;
  grouped?: boolean;
  compact?: boolean;
  reload: () => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  const router = useRouter();
  const reduced = !useMotionEnabled();
  const { leaders } = matchStandings(match);
  const leader = leaders[0];
  const stats = [
    {
      value: leader ? `${leader.total > 0 ? '+' : ''}${n(leader.total)}` : n(0),
      label:
        leaders.length > 1 ? t('Tied') : (leader?.player.name ?? t('Leader')),
      leader: true,
    },
    { value: n(match.rounds.length), label: t('Rounds'), leader: false },
    {
      value: n(match.players.filter((player) => player.active).length),
      label: t('Players'),
      leader: false,
    },
    {
      value:
        match.settings.moneyRate === null
          ? t('Off')
          : n(match.settings.moneyRate),
      label: t('Rs/pt'),
      leader: false,
    },
  ];
  const open = () => router.push(`/marriage/match/${match.id}`);
  return (
    <MatchCardActions match={match} reload={reload}>
      {(showMenu) =>
        expanded ? (
          <Pressable
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel={`${t('Open')} ${displayMatchTitle(match)}`}
            accessibilityActions={[
              { name: 'longpress', label: t('Match actions') },
            ]}
            onAccessibilityAction={({ nativeEvent }) => {
              if (nativeEvent.actionName === 'longpress') showMenu();
            }}
            onPress={open}
            onLongPress={showMenu}
          >
            <View style={styles.spread}>
              <View style={styles.flexible}>
                <Text
                  style={[
                    styles.label,
                    compact && {
                      fontSize: theme.type.label + 3,
                      lineHeight: 28,
                      fontFamily: theme.fonts.bold,
                    },
                  ]}
                >
                  {displayMatchTitle(match)}
                </Text>
                <Text
                  style={[
                    styles.caption,
                    compact && {
                      fontSize: theme.type.caption + 3,
                      lineHeight: 25,
                      marginTop: 5,
                    },
                  ]}
                >
                  {t('Active')} {'\u00b7'}{' '}
                  {t('Started {time}', {
                    time: new Date(match.createdAt).toLocaleTimeString(
                      currentPreferences().language === 'ne'
                        ? 'ne-NP'
                        : 'en-US',
                      { hour: 'numeric', minute: '2-digit' },
                    ),
                  })}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {stats.map((stat, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    minWidth: 48,
                    padding: 8,
                    borderRadius: 12,
                    gap: 2,
                    backgroundColor: stat.leader
                      ? theme.colors.ink
                      : theme.colors.goldTint,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{
                      fontFamily: theme.fonts.heavy,
                      fontSize: 18,
                      color: stat.leader
                        ? theme.colors.onInk
                        : theme.colors.text,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    numberOfLines={1}
                    accessibilityLabel={stat.label}
                    style={{
                      fontFamily: theme.fonts.medium,
                      fontSize: 12,
                      color: stat.leader
                        ? theme.colors.onInk
                        : theme.colors.goldText,
                    }}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
            <Button
              label={t('Resume match')}
              onPress={open}
              onLongPress={showMenu}
            />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('Open')} ${displayMatchTitle(match)}`}
            onPress={open}
            onLongPress={showMenu}
            accessibilityActions={[
              { name: 'longpress', label: t('Match actions') },
            ]}
            onAccessibilityAction={({ nativeEvent }) => {
              if (nativeEvent.actionName === 'longpress') showMenu();
            }}
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
                  {compact && leader
                    ? `${leaders.length > 1 ? t('Tied') : leader.player.name} · `
                    : ''}
                  {compact
                    ? `${t('roundCount', { count: match.rounds.length })} · `
                    : ''}
                  {formatDate(new Date(match.finishedAt ?? match.createdAt))}
                </Text>
              </View>
            </View>
            {!compact && (
              <View style={styles.spread}>
                <Text
                  style={[styles.caption, styles.flexible, { fontSize: 14 }]}
                >
                  {leader
                    ? `${leaders.length > 1 ? t('Tied') : t('Leader')} ${leaders.map((row) => row.player.name).join(', ')}`
                    : `${n(match.players.length)} ${t('players')}`}
                </Text>
                {leader && <ScoreText value={leader.total} size="md" />}
              </View>
            )}
          </Pressable>
        )
      }
    </MatchCardActions>
  );
}
