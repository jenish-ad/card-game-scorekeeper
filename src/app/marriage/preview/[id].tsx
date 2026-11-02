import { t, n } from '../../../i18n';
import { MatchKeepAwake } from '../../../ui/MatchKeepAwake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { deleteRound } from '../../../features/marriage/matches';
import { useRoundDraft } from '../../../features/marriage/RoundDraftProvider';
import { useMatches } from '../../../features/marriage/useMatches';
import { scoreRound } from '../../../features/marriage/scoring';
import { useMatchDatabase } from '../../../storage/MatchStorageProvider';
import { Avatar, Button, Score, formatScore } from '../../../ui/Primitives';
import { Screen, useStyles } from '../../../ui/Screen';
export default function RoundDetailsScreen() {
  const styles = useStyles();
  const params = useLocalSearchParams<{
    id: string;
    roundId?: string;
    draft?: string;
  }>();
  const router = useRouter();
  const database = useMatchDatabase();
  const { match, loading, error, reload } = useMatches(Number(params.id));
  const { draft, setDraft } = useRoundDraft();
  const [busy, setBusy] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  if (loading)
    return (
      <Screen>
        <ActivityIndicator accessibilityLabel={t('Loading')} />
      </Screen>
    );
  const saved = match?.rounds.find(
    (round) => round.id === Number(params.roundId),
  );
  const unsaved = params.draft === '1';
  const input =
    unsaved && draft?.matchId === match?.id ? draft?.input : saved?.input;
  if (!match || !input || error)
    return (
      <Screen>
        <Text style={styles.error}>
          {error ?? t('Round unavailable; return to the scoreboard.')}
        </Text>
        <Button label={t('Retry')} onPress={reload} />
      </Screen>
    );
  const scores = scoreRound(input, match.ruleVersion, match.settings);
  const totalMaal =
    input.kind === 'foul'
      ? 0
      : input.players.reduce(
          (sum, entry) => sum + (entry.seen ? entry.maal : 0),
          0,
        );
  function confirmDelete() {
    if (!match || !saved || busy) return;
    Alert.alert(
      t('Delete round?'),
      t('Delete this round and recalculate totals?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => {
            setBusy(true);
            void deleteRound(database, match.id, saved.id)
              .then(() => {
                setDraft(null);
                router.dismissTo(`/marriage/match/${match.id}`);
              })
              .catch(() => {
                setBusy(false);
                setWriteError(t('Could not delete the round; try again.'));
              });
          },
        },
      ],
    );
  }
  return (
    <Screen
      footer={
        unsaved ? (
          <Button label={t('Back to round')} onPress={() => router.back()} />
        ) : !match.finishedAt && saved ? (
          <>
            <Button
              secondary
              label={t('Edit round')}
              disabled={busy}
              onPress={() => {
                setDraft(null);
                router.push({
                  pathname: '/marriage/round/[id]',
                  params: { id: match.id, roundId: saved.id },
                });
              }}
            />
            <Button
              secondary
              destructive
              label={t('Delete round')}
              disabled={busy}
              onPress={confirmDelete}
            />
          </>
        ) : undefined
      }
    >
      <MatchKeepAwake active={!match.finishedAt} />
      <Stack.Screen options={{ title: t('Round details') }} />
      <Text style={styles.title}>
        {unsaved
          ? t('Round preview')
          : t('Round {p0}', {
              p0: match.rounds.findIndex((round) => round.id === saved?.id) + 1,
            })}
      </Text>
      <Text style={styles.body}>
        {input.kind === 'foul'
          ? t('{p0} fouled: pays {p1} {p2}', {
              p0: match.players.find((p) => p.id === input.offenderId)?.name,
              p1: input.penalty,
              p2:
                input.mode === 'perPlayer'
                  ? t('to each player')
                  : t('in total'),
            })
          : t('{p0} finish / Total Seen maal: {p1}', {
              p0: input.dubleeWin ? t('Dublee') : t('Normal'),
              p1: totalMaal,
            })}
      </Text>
      {match.players.map((player) => {
        const entry =
          input.kind === 'foul'
            ? undefined
            : input.players.find((item) => item.playerId === player.id);
        const points = scores.find(
          (score) => score.playerId === player.id,
        )?.points;
        if (points === undefined) return null;
        if (input.kind === 'foul')
          return (
            <View key={player.id} style={styles.spread}>
              <Text style={styles.label}>
                {player.name}
                {player.id === input.offenderId ? t(' (Foul)') : ''}
              </Text>
              <Score value={points} />
            </View>
          );
        if (!entry) return null;
        const winner = player.id === input.winnerId;
        const counted = entry.seen ? entry.maal : 0;
        const fee =
          (entry.seen ? match.settings.seenFee : match.settings.unseenFee) +
          (input.dubleeWin ? match.settings.dubleeExtra : 0);
        return (
          <View key={player.id} style={styles.card}>
            <View style={styles.row}>
              <Avatar name={player.name} />
              <View style={styles.flexible}>
                <Text style={styles.label}>
                  {player.name}
                  {winner ? t(' (Winner)') : ''}
                </Text>
                <Text style={styles.caption}>
                  {n(counted)} {t('maal /')}{' '}
                  {entry.seen ? t('Seen') : t('Unseen')}
                </Text>
              </View>
              <Score value={points} />
            </View>
            <Text style={styles.caption}>
              {winner
                ? t("Opposite of the other players' combined points: {p0}", {
                    p0: formatScore(points),
                  })
                : `${input.players.length} x ${n(counted)} - ${totalMaal} - ${fee} = ${formatScore(points)}`}
            </Text>
          </View>
        );
      })}
      <Text style={styles.label}>
        {t('Round total:')}{' '}
        {n(scores.reduce((sum, score) => sum + score.points, 0))}
      </Text>
      {writeError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {writeError}
        </Text>
      )}
    </Screen>
  );
}
