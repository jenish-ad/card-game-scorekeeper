import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { deleteRound, saveRound } from '../../../features/marriage/matches';
import { useRoundDraft } from '../../../features/marriage/RoundDraftProvider';
import { useMatches } from '../../../features/marriage/useMatches';
import { scoreRound } from '../../../scoring/pagatBaseV1';
import { useMatchDatabase } from '../../../storage/MatchStorageProvider';
import { theme } from '../../../theme';
import {
  Avatar,
  Button,
  Chip,
  Score,
  formatScore,
} from '../../../ui/Primitives';
import { Screen, styles } from '../../../ui/Screen';

export default function RoundPreviewScreen() {
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
  const unsaved = params.draft === '1';
  const saved = match?.rounds.find(
    (round) => round.id === Number(params.roundId),
  );
  const activeDraft = draft?.matchId === match?.id ? draft : null;
  const input = unsaved ? activeDraft?.input : saved?.input;
  if (loading)
    return (
      <Screen>
        <Text style={styles.body}>Loading preview…</Text>
      </Screen>
    );
  if (!match || !input || error)
    return (
      <Screen>
        <Text accessibilityRole="alert" style={styles.error}>
          {error ?? 'This round is unavailable. Unsaved drafts are temporary.'}
        </Text>
        <Button label="Retry" onPress={reload} />
        <Button
          label="Back to Scoreboard"
          secondary
          onPress={() => router.dismissTo(`/marriage/match/${params.id}`)}
        />
      </Screen>
    );
  const roundId = unsaved ? activeDraft?.roundId : saved?.id;
  const number = roundId
    ? match.rounds.findIndex((round) => round.id === roundId) + 1
    : match.rounds.length + 1;
  const scores = scoreRound(input, match.ruleVersion);
  const winner = match.players.find((player) => player.id === input.winnerId)!;
  const totalMaal = input.players.reduce(
    (sum, entry) =>
      sum +
      (match.ruleVersion === 'pagat-base-v1' || entry.seen ? entry.maal : 0),
    0,
  );
  async function mutate(operation: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setWriteError(null);
    try {
      await operation();
      setDraft(null);
      router.dismissTo(`/marriage/match/${params.id}`);
    } catch (failure) {
      setWriteError(
        failure instanceof Error ? failure.message : 'Could not save changes.',
      );
      setBusy(false);
    }
  }
  function confirmDelete() {
    if (!match || !saved) return;
    Alert.alert(
      'Delete Round?',
      'This cannot be undone. The scoreboard will be recalculated.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Round',
          style: 'destructive',
          onPress: () =>
            void mutate(() => deleteRound(database, match.id, saved.id)),
        },
      ],
    );
  }
  const footer = unsaved ? (
    <>
      <Button
        secondary
        label="‹ Back to Edit"
        disabled={busy}
        onPress={() => router.back()}
      />
      <Button
        label={busy ? 'Saving…' : '✓ Save Round'}
        disabled={busy || Boolean(match.finishedAt)}
        onPress={() =>
          void mutate(() => saveRound(database, match.id, input, roundId))
        }
      />
    </>
  ) : !match.finishedAt ? (
    <>
      <Button
        secondary
        label="Edit Round"
        disabled={busy}
        onPress={() => {
          setDraft(null);
          router.push({
            pathname: '/marriage/round/[id]',
            params: { id: match.id, roundId: saved!.id },
          });
        }}
      />
      <Button
        secondary
        destructive
        label="Delete Round"
        disabled={busy}
        onPress={confirmDelete}
      />
    </>
  ) : undefined;
  return (
    <Screen footer={footer}>
      <Stack.Screen
        options={{ title: unsaved ? 'Preview Points' : 'Round Details' }}
      />
      <View style={styles.spread}>
        <Text style={styles.title}>Round {number}</Text>
        <Chip gold>{unsaved ? 'Not saved yet' : 'Saved round'}</Chip>
      </View>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <View style={styles.spread}>
          <View style={styles.row}>
            <Avatar name={winner.name} />
            <View>
              <Text style={[styles.eyebrow, { color: theme.colors.goldLight }]}>
                Winner
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.surface }]}>
                {winner.name}
              </Text>
            </View>
          </View>
          <Text style={[styles.label, { color: theme.colors.surface }]}>
            {input.dubleeWin ? 'Dublee' : 'Normal'}
          </Text>
        </View>
        <Text style={[styles.body, { color: theme.colors.surface }]}>
          Total counted maal: {totalMaal} ·{' '}
          {input.dubleeWin ? 'Dublee' : 'Normal'} finish
        </Text>
      </View>
      <View style={styles.card}>
        {match.players.map((player) => {
          const entry = input.players.find(
            (item) => item.playerId === player.id,
          )!;
          const points = scores.find(
            (item) => item.playerId === player.id,
          )!.points;
          return (
            <View
              key={player.id}
              style={[styles.spread, { paddingVertical: theme.spacing.sm }]}
            >
              <View style={styles.row}>
                <Avatar name={player.name} seat={player.seat} />
                <View style={{ gap: theme.spacing.xs }}>
                  <Text style={styles.label}>{player.name}</Text>
                  <Text style={styles.body}>
                    {entry.maal} maal · {entry.seen ? 'Seen' : 'Unseen'}
                  </Text>
                  {player.id === input.winnerId && <Chip gold>Winner</Chip>}
                </View>
              </View>
              <Score value={points} />
            </View>
          );
        })}
      </View>
      <Text style={styles.body}>✓ Gains − Pays = No change</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Text style={styles.eyebrow}>How it was calculated</Text>
        <Text style={styles.body}>
          {match.players.length} players · {totalMaal} counted maal ·{' '}
          {match.ruleVersion === 'pagat-base-v1'
            ? 'Original saved rules'
            : 'Unseen maal counts as 0'}
        </Text>
        {match.players
          .filter((player) => player.id !== input.winnerId)
          .map((player) => {
            const entry = input.players.find(
              (item) => item.playerId === player.id,
            )!;
            const counted =
              match.ruleVersion === 'pagat-base-v1' || entry.seen
                ? entry.maal
                : 0;
            const finishPayment =
              (entry.seen ? 3 : 10) + (input.dubleeWin ? 5 : 0);
            return (
              <Text
                key={player.id}
                style={[styles.body, { fontVariant: ['tabular-nums'] }]}
              >
                {player.name}: {match.players.length} × {counted} − {totalMaal}{' '}
                − {finishPayment} ={' '}
                {formatScore(
                  scores.find((score) => score.playerId === player.id)!.points,
                )}
              </Text>
            );
          })}
        <Text style={styles.body}>
          {winner.name}: opposite of the other players’ combined points ={' '}
          {formatScore(
            scores.find((score) => score.playerId === winner.id)!.points,
          )}
        </Text>
        <View style={styles.divider} />
        <Text style={[styles.label, { color: theme.colors.primary }]}>
          ✓ Round balances to{' '}
          {scores.reduce((sum, score) => sum + score.points, 0)}
        </Text>
      </View>
      {writeError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {writeError}
        </Text>
      )}
    </Screen>
  );
}
