import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import {
  matchTotals,
  setMatchFinished,
} from '../../../features/marriage/matches';
import { useMatches } from '../../../features/marriage/useMatches';
import { useRoundDraft } from '../../../features/marriage/RoundDraftProvider';
import { scoreRound } from '../../../scoring/pagatBaseV1';
import { useMatchDatabase } from '../../../storage/MatchStorageProvider';
import { theme } from '../../../theme';
import { Avatar, Button, Chip, Score } from '../../../ui/Primitives';
import { Screen, styles } from '../../../ui/Screen';

export default function ScoreboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const database = useMatchDatabase();
  const { match, loading, error, reload } = useMatches(Number(id));
  const { setDraft } = useRoundDraft();
  const [busy, setBusy] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  if (loading)
    return (
      <Screen>
        <Text style={styles.body}>Loading match…</Text>
      </Screen>
    );
  if (!match || error)
    return (
      <Screen>
        <Text accessibilityRole="alert" style={styles.error}>
          {error ?? 'Match not found.'}
        </Text>
        <Button label="Retry" onPress={reload} />
      </Screen>
    );
  const totals = matchTotals(match);
  const ranked = [...match.players].sort(
    (a, b) => totals.get(b.id)! - totals.get(a.id)!,
  );
  function changeStatus() {
    if (!match || busy) return;
    Alert.alert(
      match.finishedAt ? 'Reopen match?' : 'Finish Match?',
      match.finishedAt
        ? 'You can add and edit rounds again.'
        : 'Your match will be saved in history. You can reopen it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: match.finishedAt ? 'Reopen Match' : 'Finish Match',
          onPress: () => {
            setBusy(true);
            setWriteError(null);
            void setMatchFinished(database, match.id, !match.finishedAt)
              .then(reload)
              .catch((failure: unknown) =>
                setWriteError(
                  failure instanceof Error
                    ? failure.message
                    : 'Could not update match.',
                ),
              )
              .finally(() => setBusy(false));
          },
        },
      ],
    );
  }
  const openRound = (roundId: number) =>
    router.push({
      pathname: '/marriage/preview/[id]',
      params: { id: match.id, roundId },
    });
  return (
    <Screen
      footer={
        <>
          <Button
            secondary
            label={match.finishedAt ? 'Reopen Match' : 'Finish Match'}
            disabled={busy}
            onPress={changeStatus}
          />
          {!match.finishedAt && (
            <Button
              label="＋ Add Round"
              disabled={busy}
              onPress={() => {
                setDraft(null);
                router.push(`/marriage/round/${match.id}`);
              }}
            />
          )}
        </>
      }
    >
      <Text style={styles.title}>{match.title}</Text>
      <View style={styles.row}>
        <Chip>{match.finishedAt ? 'Finished' : '● Active'}</Chip>
        <Text style={styles.body}>
          {match.rounds.length} rounds · Pagat base v1
        </Text>
      </View>
      <Text style={styles.eyebrow}>Standings</Text>
      <View style={styles.card}>
        {ranked.map((player, index) => (
          <View
            key={player.id}
            style={[styles.spread, { paddingVertical: theme.spacing.sm }]}
          >
            <View style={styles.row}>
              <Text style={styles.eyebrow}>{index + 1}</Text>
              <Avatar name={player.name} seat={player.seat} />
              <View>
                <Text style={styles.label}>{player.name}</Text>
                <Text style={styles.body}>
                  {index === 0 && match.rounds.length
                    ? 'Leading'
                    : `Seat ${player.seat + 1}`}
                </Text>
              </View>
            </View>
            <Score value={totals.get(player.id)!} />
          </View>
        ))}
      </View>
      <View style={styles.spread}>
        <Text style={styles.eyebrow}>Rounds</Text>
        <Text style={[styles.body, { fontSize: 11 }]}>
          Tap a round for details
        </Text>
      </View>
      {!match.rounds.length ? (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Let the first round begin</Text>
          <Text style={styles.body}>Add a round to start your scoreboard.</Text>
        </View>
      ) : (
        <View
          style={[
            styles.card,
            { padding: 0, overflow: 'hidden', flexDirection: 'row', gap: 0 },
          ]}
        >
          <View style={{ width: 68, backgroundColor: theme.colors.surfaceAlt }}>
            <View
              style={{
                height: 52,
                justifyContent: 'center',
                paddingHorizontal: theme.spacing.md,
              }}
            >
              <Text style={styles.eyebrow}>Round</Text>
            </View>
            {match.rounds.map((round, index) => (
              <Pressable
                key={round.id}
                accessibilityRole="button"
                accessibilityLabel={`Round ${index + 1} details`}
                onPress={() => openRound(round.id)}
                style={{
                  height: 72,
                  padding: theme.spacing.md,
                  justifyContent: 'center',
                  borderTopWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text style={styles.label}>{index + 1} ›</Text>
              </Pressable>
            ))}
            <View
              style={{
                height: 72,
                padding: theme.spacing.md,
                justifyContent: 'center',
              }}
            >
              <Text style={styles.label}>Total</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={match.players.length >= 4}
            style={{ flex: 1 }}
          >
            <View>
              <View style={{ flexDirection: 'row', height: 52 }}>
                {match.players.map((player) => (
                  <View
                    key={player.id}
                    style={{
                      width: 88,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={styles.label} numberOfLines={1}>
                      {player.name}
                    </Text>
                  </View>
                ))}
              </View>
              {match.rounds.map((round, index) => (
                <Pressable
                  key={round.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Round ${index + 1} details`}
                  onPress={() => openRound(round.id)}
                  style={{
                    flexDirection: 'row',
                    height: 72,
                    borderTopWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  {match.players.map((player) => (
                    <View
                      key={player.id}
                      style={{
                        width: 88,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Score
                        compact
                        value={
                          scoreRound(round.input, match.ruleVersion).find(
                            (entry) => entry.playerId === player.id,
                          )!.points
                        }
                      />
                    </View>
                  ))}
                </Pressable>
              ))}
              <View
                style={{
                  flexDirection: 'row',
                  height: 72,
                  backgroundColor: theme.colors.surfaceAlt,
                }}
              >
                {match.players.map((player) => (
                  <View
                    key={player.id}
                    style={{
                      width: 88,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Score compact value={totals.get(player.id)!} />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      )}
      <Text style={styles.body}>
        All points balance to 0. Scores are recalculated from saved rounds.
      </Text>
      {writeError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {writeError}
        </Text>
      )}
    </Screen>
  );
}
