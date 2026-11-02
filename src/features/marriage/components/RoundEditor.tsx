import { Crown } from '@/ui/Crown';
import Animated, {
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { PlayerAvatar } from '@/ui/PlayerAvatar';
import { useMotionEnabled } from '@/theme/useReducedMotion';
import { feedback } from '@/lib/feedback';
import { latinDigits } from '@/i18n/numbers';
import { t, translateError } from '@/i18n';
import { MatchKeepAwake } from '@/features/marriage/components/MatchKeepAwake';
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
import { Icon } from '@/ui/Icon';
import {
  nextSeenPlayerIndex,
  setPlayerSeen,
  savedRoundToken,
} from '@/features/marriage/domain/roundEntry';
import { useTheme } from '@/theme/useTheme';
import { Button } from '@/ui/Button';
import { Score } from '@/ui/Score';
import { Screen, useStyles } from '@/ui/Screen';
import { useMatchDatabase } from '@/storage/MatchStorageProvider';
import { useRoundDraft } from '@/features/marriage/data/RoundDraftProvider';
import { type FoulRoundInput } from '@/features/marriage/domain/scoring';
import {
  localizedFoulPreview,
  localizedRoundPreview,
} from './localizedRoundPreview';
import {
  saveRound,
  type SavedMatch,
  type SavedRound,
} from '@/features/marriage/data/matches';

export function RoundEditor({
  match,
  round,
  initialFoul = false,
}: {
  match: SavedMatch;
  round?: SavedRound;
  initialFoul?: boolean;
}) {
  const theme = useTheme();
  const reduced = !useMotionEnabled();
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
  const [foul, setFoul] = useState(
    initial?.kind === 'foul' || (!initial && initialFoul),
  );
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [saving, setSaving] = useState(false);
  const fields = useRef<(ComponentRef<typeof TextInput> | null)[]>([]);
  const number = round
    ? match.rounds.findIndex((entry) => entry.id === round.id) + 1
    : match.rounds.length + 1;
  const normalPreview = localizedRoundPreview(
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
      : localizedFoulPreview(foulInput)
    : normalPreview;
  async function save() {
    if (saving || !preview.ok) return;
    setSaving(true);
    setError(null);
    try {
      await saveRound(database, match.id, preview.input, round?.id);
      void feedback(foul ? 'warning' : 'success');
      setDraft(null);
      router.dismissTo({
        pathname: '/marriage/match/[id]',
        params: {
          id: match.id,
          savedRound: String(number),
          savedToken: savedRoundToken(),
        },
      });
    } catch (error) {
      setError(translateError(error, 'Could not save the round; try again.'));
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
            <Animated.View
              entering={reduced ? undefined : FadeInDown.duration(220)}
              layout={reduced ? undefined : LinearTransition.duration(220)}
              style={local.results}
            >
              {participants.map((player) => (
                <View
                  key={player.id}
                  accessibilityLabel={player.name}
                  style={[
                    local.result,
                    {
                      backgroundColor: theme.colors.surfaceSunken,
                      borderRadius: theme.radius.chip,
                    },
                  ]}
                >
                  <PlayerAvatar
                    name={player.name}
                    colorIndex={player.colorIndex ?? 0}
                    size={24}
                  />
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
            </Animated.View>
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
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {participants.map((player) => (
              <Pressable
                key={player.id}
                accessibilityRole="radio"
                accessibilityLabel={player.name}
                accessibilityState={{ checked: offenderId === player.id }}
                onPress={() => {
                  void feedback('selection');
                  setOffenderId(player.id);
                }}
                style={{
                  width: '30%',
                  minHeight: 92,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: 18,
                  backgroundColor:
                    offenderId === player.id
                      ? theme.colors.lossTint
                      : theme.colors.surface,
                }}
              >
                <View
                  style={{
                    borderRadius: 28,
                    padding: 4,
                    outlineWidth: offenderId === player.id ? 2 : 0,
                    outlineColor: theme.colors.loss,
                  }}
                >
                  <PlayerAvatar
                    name={player.name}
                    colorIndex={player.colorIndex ?? 0}
                    size={44}
                  />
                </View>
                <Text style={styles.label}>{player.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.label}>{t('finishType')}</Text>
          <SegmentedControl
            label={t('finishType')}
            value={dubleeWin}
            options={[
              { value: false, label: t('Normal') },
              { value: true, label: t('Dublee') },
            ]}
            onChange={setDubleeWin}
          />
          <View style={local.columnHeadings}>
            <Text style={[styles.caption, styles.flexible]}>{t('Player')}</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.caption, local.maalHeading]}
            >
              {t('Maal')}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.caption, local.seenHeading]}
            >
              {t('Status')}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.caption, local.winnerHeading]}
            >
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
                      borderBottomColor: theme.colors.hairline,
                      backgroundColor: selected
                        ? theme.colors.goldTint
                        : 'transparent',
                    },
                  ]}
                >
                  <PlayerAvatar
                    name={player.name}
                    colorIndex={player.colorIndex ?? 0}
                    size={36}
                  />
                  <Text
                    style={[
                      styles.label,
                      styles.flexible,
                      !entry.seen && { color: theme.colors.mutedText },
                    ]}
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
                    onBlur={() => setFocusedIndex(-1)}
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
                        borderColor:
                          focusedIndex === index
                            ? theme.colors.focus
                            : theme.colors.hairline,
                        borderWidth: focusedIndex === index ? 2 : 1,
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
                    onPress={() => {
                      void feedback('selection');
                      setPlayers((current) =>
                        current.map((item) =>
                          item.playerId === player.id
                            ? setPlayerSeen(item, !item.seen)
                            : item,
                        ),
                      );
                    }}
                    style={[
                      local.seen,
                      {
                        borderColor: theme.colors.hairline,
                        backgroundColor: entry.seen
                          ? theme.colors.surface
                          : theme.colors.surfaceSunken,
                        opacity: selected ? 0.55 : 1,
                      },
                    ]}
                  >
                    <Icon
                      name={entry.seen ? 'eye-outline' : 'eye-off-outline'}
                      color={
                        entry.seen ? theme.colors.ink : theme.colors.mutedText
                      }
                    />
                  </Pressable>
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityLabel={t('{p0} winner', { p0: player.name })}
                    accessibilityState={{ checked: selected }}
                    onPress={() => {
                      void feedback('selection');
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
                    <Crown selected={selected} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </>
      )}
      <View style={styles.spread}>
        <Pressable
          accessibilityRole="link"
          disabled={!preview.ok}
          onPress={details}
          style={local.details}
        >
          <Text style={[styles.label, { color: theme.colors.ink }]}>
            {t('Details')}
          </Text>
          <Icon name="chevron-forward" size={18} />
        </Pressable>
        <Button
          ghost
          icon={foul ? 'arrow-undo-outline' : 'warning-outline'}
          label={foul ? t('Normal round') : t('Record foul')}
          onPress={() => setFoul(!foul)}
        />
      </View>
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
  results: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  columnHeadings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 0,
  },
  maalHeading: { width: 56, textAlign: 'center' },
  seenHeading: { width: 44, textAlign: 'center' },
  winnerHeading: { width: 44, textAlign: 'center' },
  players: { gap: 6 },
  player: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  maal: {
    width: 56,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
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
    width: 44,
    borderRadius: 999,
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
