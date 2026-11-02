import { latinDigits } from '../../i18n/numbers';
import { t } from '../../i18n';
import { MatchKeepAwake } from '../../ui/MatchKeepAwake';
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
import {
  nextSeenPlayerIndex,
  setPlayerSeen,
  savedRoundToken,
} from './roundEntry';
import { useTheme } from '../../useTheme';
import { Button, Score } from '../../ui/Primitives';
import { Screen, useStyles } from '../../ui/Screen';
import { useMatchDatabase } from '../../storage/MatchStorageProvider';
import { useRoundDraft } from './RoundDraftProvider';
import { type FoulRoundInput } from './scoring';
import { foulPreview, roundPreview } from './roundPreview';
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
  const participants = match.players.filter((player) =>
    round
      ? round.input.players.some((entry) => entry.playerId === player.id)
      : player.active,
  );
  const [foul, setFoul] = useState(initial?.kind === 'foul');
  const [offenderId, setOffenderId] = useState<number | null>(
    initial?.kind === 'foul' ? initial.offenderId : null,
  );
  const normalInitial = initial?.kind === 'foul' ? undefined : initial;
  const [players, setPlayers] = useState(
    participants.map((player) => {
      const entry = normalInitial?.players.find(
        (item) => item.playerId === player.id,
      );
      return {
        playerId: player.id,
        maal: String(entry?.seen === false ? 0 : (entry?.maal ?? 0)),
        seen: entry?.seen ?? true,
      };
    }),
  );
  const [winnerId, setWinnerId] = useState<number | null>(
    normalInitial?.winnerId ?? null,
  );
  const [dubleeWin, setDubleeWin] = useState(normalInitial?.dubleeWin ?? false);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const fields = useRef<(ComponentRef<typeof TextInput> | null)[]>([]);
  const number = round
    ? match.rounds.findIndex((entry) => entry.id === round.id) + 1
    : match.rounds.length + 1;
  const normalPreview = roundPreview(
    players,
    winnerId,
    dubleeWin,
    match.ruleVersion,
    match.settings,
  );
  const foulInput: FoulRoundInput = {
    kind: 'foul',
    offenderId: offenderId ?? 0,
    players: participants.map((player) => ({ playerId: player.id })),
    penalty:
      initial?.kind === 'foul' ? initial.penalty : match.settings.foulPenalty,
    mode: initial?.kind === 'foul' ? initial.mode : match.settings.foulMode,
  };
  const preview = foul
    ? offenderId === null
      ? { ok: false as const, message: t('Choose the player who fouled.') }
      : foulPreview(foulInput)
    : normalPreview;
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
          savedToken: savedRoundToken(),
        },
      });
    } catch {
      setError(t('Could not save the round; try again.'));
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
              {participants.map((player) => (
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
            label={t('Save round')}
            disabled={saving || !preview.ok}
            onPress={() => void save()}
          />
        </View>
      }
    >
      <MatchKeepAwake active={!match.finishedAt} />
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
              label={t('Next')}
              disabled={nextSeenPlayerIndex(players, focusedIndex) < 0}
              onPress={() =>
                fields.current[
                  nextSeenPlayerIndex(players, focusedIndex)
                ]?.focus()
              }
            />
            <Button label={t('Done')} onPress={() => Keyboard.dismiss()} />
          </View>
        </InputAccessoryView>
      )}
      <Text style={styles.subtitle}>{t('Round {p0}', { p0: number })}</Text>
      <Button
        secondary
        label={foul ? t('Normal round') : t('Record foul')}
        onPress={() => setFoul(!foul)}
      />
      {foul ? (
        <View style={local.players}>
          <Text style={styles.body}>
            {offenderId === null
              ? t('Choose the player who fouled.')
              : t('{p0} fouled: pays {p1} {p2}', {
                  p0: participants.find((player) => player.id === offenderId)
                    ?.name,
                  p1: foulInput.penalty,
                  p2:
                    foulInput.mode === 'perPlayer'
                      ? t('to each player')
                      : t('in total'),
                })}
          </Text>
          {participants.map((player) => (
            <Button
              key={player.id}
              secondary={offenderId !== player.id}
              label={player.name}
              onPress={() => setOffenderId(player.id)}
            />
          ))}
        </View>
      ) : (
        <>
          <View style={styles.spread}>
            <Text style={styles.label}>{t('finishType')}</Text>
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
                  <Text style={styles.label}>
                    {dublee ? t('Dublee') : t('Normal')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={local.columnHeadings}>
            <Text style={[styles.caption, styles.flexible]}>{t('Player')}</Text>
            <Text style={[styles.caption, local.maalHeading]}>{t('Maal')}</Text>
            <Text style={[styles.caption, local.seenHeading]}>
              {t('Status')}
            </Text>
            <Text style={[styles.caption, local.winnerHeading]}>
              {t('Winner')}
            </Text>
          </View>
          <View style={local.players}>
            {players.map((entry, index) => {
              const player = participants[index];
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
                  <Text
                    style={[styles.label, styles.flexible]}
                    numberOfLines={1}
                  >
                    {player.name}
                  </Text>
                  <TextInput
                    ref={(field) => {
                      fields.current[index] = field;
                    }}
                    accessibilityLabel={t('{p0} maal', { p0: player.name })}
                    keyboardType="number-pad"
                    inputAccessoryViewID={
                      Platform.OS === 'ios' ? 'maal-navigation' : undefined
                    }
                    onFocus={() => setFocusedIndex(index)}
                    selectTextOnFocus
                    editable={entry.seen}
                    returnKeyType={
                      index === players.length - 1 ? 'done' : 'next'
                    }
                    submitBehavior={
                      index === players.length - 1 ? 'blurAndSubmit' : 'submit'
                    }
                    onSubmitEditing={() => {
                      const next = nextSeenPlayerIndex(players, index);
                      if (next >= 0) fields.current[next]?.focus();
                    }}
                    value={entry.seen ? entry.maal : '0'}
                    onChangeText={(raw) => {
                      const maal = latinDigits(raw);
                      if (/^\d*$/.test(maal))
                        setPlayers((current) =>
                          current.map((item) =>
                            item.playerId === player.id
                              ? { ...item, maal }
                              : item,
                          ),
                        );
                    }}
                    style={[
                      local.maal,
                      { fontFamily: theme.fonts.body },
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
                    accessibilityLabel={t('{p0} seen', { p0: player.name })}
                    accessibilityState={{
                      checked: entry.seen,
                      disabled: selected,
                    }}
                    disabled={selected}
                    onPress={() =>
                      setPlayers((current) =>
                        current.map((item) =>
                          item.playerId === player.id
                            ? setPlayerSeen(item, !item.seen)
                            : item,
                        ),
                      )
                    }
                    style={[
                      local.seen,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: entry.seen
                          ? theme.colors.surface
                          : theme.colors.surfaceAlt,
                        opacity: selected ? 0.55 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.caption}>
                      {entry.seen ? t('Seen') : t('Unseen')}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityLabel={t('{p0} winner', { p0: player.name })}
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
                  </Pressable>
                </View>
              );
            })}
          </View>
        </>
      )}
      <Pressable
        accessibilityRole="link"
        disabled={!preview.ok}
        onPress={details}
        style={local.details}
      >
        <Text style={[styles.label, { color: theme.colors.primary }]}>
          {t('Details')}
        </Text>
        <Icon name="chevron-forward" size={18} />
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
  columnHeadings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
  },
  maalHeading: { width: 44, textAlign: 'center' },
  seenHeading: { width: 60, textAlign: 'center' },
  winnerHeading: { width: 44, textAlign: 'center' },
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
    width: 44,
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
    width: 60,
    borderWidth: 1,
    borderRadius: 8,
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
  details: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
});
