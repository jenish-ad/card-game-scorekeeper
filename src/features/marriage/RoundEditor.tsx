import { useRef, useState, type ComponentRef } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { scoreRound } from '../../scoring/pagatBaseV1';
import { theme } from '../../theme';
import { Avatar, Button } from '../../ui/Primitives';
import { Screen, styles } from '../../ui/Screen';
import { useRoundDraft } from './RoundDraftProvider';
import type { SavedMatch, SavedRound } from './matches';

export function RoundEditor({
  match,
  round,
}: {
  match: SavedMatch;
  round?: SavedRound;
}) {
  const router = useRouter();
  const { draft, setDraft } = useRoundDraft();
  const initial =
    draft?.matchId === match.id && draft.roundId === round?.id
      ? draft.input
      : round?.input;
  const [players, setPlayers] = useState(
    match.players.map((player) => {
      const entry = initial?.players.find(
        (item) => item.playerId === player.id,
      );
      return {
        playerId: player.id,
        maal: String(entry?.maal ?? 0),
        seen: entry?.seen ?? true,
      };
    }),
  );
  const [winnerId, setWinnerId] = useState<number | null>(
    initial?.winnerId ?? null,
  );
  const [dubleeWin, setDubleeWin] = useState(initial?.dubleeWin ?? false);
  const [error, setError] = useState<string | null>(null);
  const fields = useRef<(ComponentRef<typeof TextInput> | null)[]>([]);
  const number = round
    ? match.rounds.findIndex((entry) => entry.id === round.id) + 1
    : match.rounds.length + 1;
  function updateMaal(playerId: number, maal: string) {
    if (!/^\d*$/.test(maal)) return;
    setPlayers((current) =>
      current.map((entry) =>
        entry.playerId === playerId ? { ...entry, maal } : entry,
      ),
    );
  }
  function preview() {
    try {
      if (winnerId === null)
        throw new Error('Choose the winner before previewing.');
      const input = {
        winnerId,
        dubleeWin,
        players: players.map((entry) => {
          if (!/^\d+$/.test(entry.maal))
            throw new Error(
              'Enter a whole-number maal total for every player, including 0.',
            );
          return { ...entry, maal: Number(entry.maal) };
        }),
      };
      scoreRound(input, match.ruleVersion);
      setDraft({ matchId: match.id, roundId: round?.id, input });
      setError(null);
      router.push({
        pathname: '/marriage/preview/[id]',
        params: { id: match.id, draft: '1' },
      });
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Check the round inputs.',
      );
    }
  }
  return (
    <Screen footer={<Button label="Preview Points →" onPress={preview} />}>
      <View style={styles.spread}>
        <Text style={styles.title}>Round {number}</Text>
        <Text style={[styles.body, { flex: 1, textAlign: 'right' }]}>
          {match.title}
        </Text>
      </View>
      <View style={[styles.card, styles.spread]}>
        <Text style={styles.label}>Finish</Text>
        <View
          style={[
            styles.row,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.chip,
              padding: theme.spacing.xs,
              gap: theme.spacing.xs,
            },
          ]}
        >
          {[false, true].map((dublee) => (
            <Pressable
              key={String(dublee)}
              accessibilityRole="radio"
              accessibilityState={{ checked: dubleeWin === dublee }}
              onPress={() => setDubleeWin(dublee)}
              style={{
                minHeight: theme.touchTarget,
                paddingHorizontal: theme.spacing.lg,
                borderRadius: theme.radius.chip,
                justifyContent: 'center',
                backgroundColor:
                  dubleeWin === dublee
                    ? theme.colors.primary
                    : theme.colors.surfaceAlt,
              }}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color:
                      dubleeWin === dublee
                        ? theme.colors.surface
                        : theme.colors.textMuted,
                  },
                ]}
              >
                {dublee ? 'Dublee' : 'Normal'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {players.map((entry, index) => {
        const player = match.players.find(
          (item) => item.id === entry.playerId,
        )!;
        const winner = entry.playerId === winnerId;
        return (
          <View
            key={entry.playerId}
            style={[
              styles.card,
              winner && { borderColor: theme.colors.primary },
            ]}
          >
            <View style={styles.spread}>
              <View style={styles.row}>
                <Avatar name={player.name} seat={player.seat} />
                <View>
                  <Text style={styles.label}>{player.name}</Text>
                  <Text style={styles.body}>Seat {index + 1}</Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={`${player.name} is winner`}
                accessibilityState={{ checked: winner }}
                onPress={() => {
                  setWinnerId(entry.playerId);
                  setPlayers((current) =>
                    current.map((item) =>
                      item.playerId === entry.playerId
                        ? { ...item, seen: true }
                        : item,
                    ),
                  );
                }}
                style={{
                  minHeight: theme.touchTarget,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: theme.radius.chip,
                  backgroundColor: winner
                    ? theme.colors.primary
                    : theme.colors.surfaceAlt,
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={[
                    styles.label,
                    {
                      color: winner
                        ? theme.colors.surface
                        : theme.colors.textMuted,
                    },
                  ]}
                >
                  {winner ? '♛ Winner' : '○ Winner'}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.eyebrow}>Maal</Text>
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Decrease ${player.name} maal`}
                disabled={Number(entry.maal) === 0}
                onPress={() =>
                  updateMaal(
                    entry.playerId,
                    String(Math.max(0, Number(entry.maal) - 1)),
                  )
                }
                style={[
                  styles.input,
                  { minWidth: theme.touchTarget, alignItems: 'center' },
                ]}
              >
                <Text style={styles.label}>−</Text>
              </Pressable>
              <TextInput
                ref={(field) => {
                  fields.current[index] = field;
                }}
                accessibilityLabel={`${player.name} maal`}
                keyboardType="number-pad"
                returnKeyType={index === players.length - 1 ? 'done' : 'next'}
                submitBehavior={
                  index === players.length - 1 ? 'blurAndSubmit' : 'submit'
                }
                onSubmitEditing={() => fields.current[index + 1]?.focus()}
                value={entry.maal}
                onChangeText={(value) => updateMaal(entry.playerId, value)}
                style={[
                  styles.input,
                  {
                    flex: 1,
                    textAlign: 'center',
                    fontVariant: ['tabular-nums'],
                  },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Increase ${player.name} maal`}
                onPress={() =>
                  updateMaal(
                    entry.playerId,
                    String(Number(entry.maal || 0) + 1),
                  )
                }
                style={[
                  styles.input,
                  { minWidth: theme.touchTarget, alignItems: 'center' },
                ]}
              >
                <Text style={styles.label}>＋</Text>
              </Pressable>
            </View>
            <View style={styles.row}>
              {[true, false].map((seen) => (
                <Pressable
                  key={String(seen)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${player.name} ${seen ? 'Seen' : 'Unseen'}`}
                  accessibilityState={{
                    checked: entry.seen === seen,
                    disabled: winner && !seen,
                  }}
                  disabled={winner && !seen}
                  onPress={() =>
                    setPlayers((current) =>
                      current.map((item) =>
                        item.playerId === entry.playerId
                          ? { ...item, seen }
                          : item,
                      ),
                    )
                  }
                  style={{
                    flex: 1,
                    minHeight: theme.touchTarget,
                    borderRadius: theme.radius.chip,
                    backgroundColor:
                      entry.seen === seen
                        ? theme.colors.primaryTint
                        : theme.colors.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: winner && !seen ? 0.4 : 1,
                  }}
                >
                  <Text style={styles.label}>
                    {seen ? '● Seen' : '○ Unseen'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
      {dubleeWin && match.ruleVersion !== 'pagat-base-v1' && (
        <Text style={styles.body}>
          Dublee rule not configured. Choose Normal to score this round.
        </Text>
      )}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </Screen>
  );
}
