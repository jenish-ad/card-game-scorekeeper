import { useRef, useState, type ComponentRef } from 'react';
import { useRouter } from 'expo-router';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon } from '../../ui/Icon';
import { nextSeenPlayerIndex } from './roundEntry';
import { useTheme } from '../../useTheme';
import { Avatar, Button, Score } from '../../ui/Primitives';
import { Screen, useStyles } from '../../ui/Screen';
import { useMatchDatabase } from '../../storage/MatchStorageProvider';
import { useRoundDraft } from './RoundDraftProvider';
import { roundPreview } from './roundPreview';
import { saveRound, type SavedMatch, type SavedRound } from './matches';

export function RoundEditor({
  match,
  round,
}: {
  match: SavedMatch;
  round?: SavedRound;
}) {
  const theme = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const database = useMatchDatabase();
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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const fields = useRef<(ComponentRef<typeof TextInput> | null)[]>([]);
  const number = round
    ? match.rounds.findIndex((entry) => entry.id === round.id) + 1
    : match.rounds.length + 1;
  const preview = roundPreview(
    players,
    winnerId,
    dubleeWin,
    match.ruleVersion,
    match.settings,
  );
  async function save() {
    if (saving || !preview.ok) return;
    setSaving(true);
    setError(null);
    try {
      await saveRound(database, match.id, preview.input, round?.id);
      setDraft(null);
      router.dismissTo({
        pathname: '/marriage/match/[id]',
        params: {
          id: match.id,
          savedRound: String(number),
          savedToken: String(number),
        },
      });
    } catch {
      setError('Could not save the round; try again.');
      setSaving(false);
    }
  }
  function details() {
    if (!preview.ok) return;
    setDraft({ matchId: match.id, roundId: round?.id, input: preview.input });
    router.push({
      pathname: '/marriage/preview/[id]',
      params: { id: match.id, draft: '1' },
    });
  }
  return (
    <Screen
      compact
      footer={
        <View style={[styles.flexible, local.footer]}>
          {preview.ok ? (
            <View style={local.results}>
              {match.players.map((player) => (
                <View key={player.id} style={local.result}>
                  <Text numberOfLines={1} style={styles.caption}>
                    {player.name}
                  </Text>
                  <Score
                    compact
                    value={
                      preview.scores.find(
                        (score) => score.playerId === player.id,
                      )?.points ?? 0
                    }
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.caption}>{preview.message}</Text>
          )}
          <Button
            label="Save round"
            disabled={saving || !preview.ok}
            onPress={() => void save()}
          />
        </View>
      }
    >
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="maal-navigation">
          <View
            style={[
              styles.row,
              { backgroundColor: theme.colors.surface, padding: 8 },
            ]}
          >
            <Button
              secondary
              label="Next"
              disabled={nextSeenPlayerIndex(players, focusedIndex) < 0}
              onPress={() =>
                fields.current[
                  nextSeenPlayerIndex(players, focusedIndex)
                ]?.focus()
              }
            />
            <Button label="Done" onPress={() => Keyboard.dismiss()} />
          </View>
        </InputAccessoryView>
      )}
      <Text style={styles.subtitle}>Round {number}</Text>
      <View style={styles.spread}>
        <Text style={styles.label}>Finish</Text>
        <View style={styles.row}>
          {[false, true].map((dublee) => (
            <Pressable
              key={String(dublee)}
              accessibilityRole="radio"
              accessibilityState={{ checked: dubleeWin === dublee }}
              onPress={() => setDubleeWin(dublee)}
              style={[
                local.option,
                {
                  backgroundColor:
                    dubleeWin === dublee
                      ? theme.colors.primaryTint
                      : theme.colors.surface,
                },
              ]}
            >
              <Text style={styles.label}>{dublee ? 'Dublee' : 'Normal'}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={local.players}>
        {players.map((entry, index) => {
          const player = match.players[index];
          if (!player) return null;
          const selected = winnerId === player.id;
          return (
            <View
              key={player.id}
              style={[
                local.player,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: selected
                    ? theme.colors.primaryTint
                    : theme.colors.surface,
                },
              ]}
            >
              <Avatar name={player.name} size={28} />
              <Text style={[styles.label, styles.flexible]} numberOfLines={1}>
                {player.name}
              </Text>
              <TextInput
                ref={(field) => {
                  fields.current[index] = field;
                }}
                accessibilityLabel={`${player.name} maal`}
                keyboardType="number-pad"
                inputAccessoryViewID={
                  Platform.OS === 'ios' ? 'maal-navigation' : undefined
                }
                onFocus={() => setFocusedIndex(index)}
                selectTextOnFocus
                editable={entry.seen}
                returnKeyType={index === players.length - 1 ? 'done' : 'next'}
                submitBehavior={
                  index === players.length - 1 ? 'blurAndSubmit' : 'submit'
                }
                onSubmitEditing={() => {
                  const next = nextSeenPlayerIndex(players, index);
                  if (next >= 0) fields.current[next]?.focus();
                }}
                value={entry.seen ? entry.maal : '0'}
                onChangeText={(maal) => {
                  if (/^\d*$/.test(maal))
                    setPlayers((current) =>
                      current.map((item) =>
                        item.playerId === player.id ? { ...item, maal } : item,
                      ),
                    );
                }}
                style={[
                  local.maal,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                    opacity: entry.seen ? 1 : 0.5,
                  },
                ]}
              />
              <Pressable
                accessibilityRole="switch"
                accessibilityLabel={`${player.name} seen`}
                accessibilityState={{ checked: entry.seen, disabled: selected }}
                disabled={selected}
                onPress={() =>
                  setPlayers((current) =>
                    current.map((item) =>
                      item.playerId === player.id
                        ? { ...item, seen: !item.seen }
                        : item,
                    ),
                  )
                }
                style={local.seen}
              >
                <Text style={styles.caption}>
                  {entry.seen ? 'Seen' : 'Unseen'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={`${player.name} winner`}
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  setWinnerId(player.id);
                  setPlayers((current) =>
                    current.map((item) =>
                      item.playerId === player.id
                        ? { ...item, seen: true }
                        : item,
                    ),
                  );
                }}
                style={local.winner}
              >
                <Icon
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                />
                <Text style={styles.caption}>Winner</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="link"
        disabled={!preview.ok}
        onPress={details}
        style={local.details}
      >
        <Text style={styles.label}>Details</Text>
      </Pressable>
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </Screen>
  );
}
const local = StyleSheet.create({
  footer: { gap: 10 },
  results: { flexDirection: 'row', gap: 6 },
  result: { flex: 1, alignItems: 'center', gap: 4 },
  players: { gap: 6 },
  player: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  maal: {
    width: 48,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    textAlign: 'center',
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
  option: {
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 10,
  },
  seen: {
    minWidth: 50,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winner: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: { minHeight: 44, justifyContent: 'center' },
});
