import { useState } from 'react';
import { Alert, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { styles } from '../../ui/Screen';
import { calculateMarriageRound, type MarriageRoundInput } from './scoring';
import type { SavedMatch, SavedRound } from './matches';

interface RoundEditorProps {
  match: SavedMatch;
  round?: SavedRound;
  onSave: (input: MarriageRoundInput) => Promise<void>;
  onCancel: () => void;
}

export function RoundEditor({
  match,
  round,
  onSave,
  onCancel,
}: RoundEditorProps) {
  const [players, setPlayers] = useState(
    match.players.map((player) => {
      const saved = round?.input.players.find(
        (entry) => entry.playerId === player.id,
      );
      return {
        playerId: player.id,
        name: player.name,
        maal: saved ? String(saved.maal) : '',
        seen: saved?.seen ?? true,
      };
    }),
  );
  const [winnerId, setWinnerId] = useState<number | null>(
    round?.input.winnerId ?? null,
  );
  const [dubleeWin, setDubleeWin] = useState(round?.input.dubleeWin ?? false);
  const [review, setReview] = useState<MarriageRoundInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reviewRound() {
    try {
      if (winnerId === null)
        throw new Error('Select the player who finished the round.');
      const input = {
        winnerId,
        dubleeWin,
        players: players.map((player) => {
          if (!/^\d+$/.test(player.maal.trim()))
            throw new Error(
              `Enter ${player.name}’s eligible maal as a nonnegative whole number, including 0.`,
            );
          return {
            playerId: player.playerId,
            maal: Number(player.maal.trim()),
            seen: player.seen,
          };
        }),
      };
      calculateMarriageRound(input);
      setError(null);
      setReview(input);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Check the round inputs.',
      );
    }
  }

  async function saveReviewedRound() {
    if (!review || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(review);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? `Could not save round: ${failure.message}`
          : 'Could not save round. Please try again.',
      );
      setSaving(false);
    }
  }

  function confirmSave() {
    if (round) {
      Alert.alert(
        'Replace this round?',
        'Its saved inputs will change and the scoreboard will be recalculated.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replace round', onPress: () => void saveReviewedRound() },
        ],
      );
    } else {
      void saveReviewedRound();
    }
  }

  return (
    <View style={{ gap: 20 }}>
      <Text accessibilityRole="header" style={styles.title}>
        {review ? 'Review round' : round ? 'Correct round' : 'Enter round'}
      </Text>
      <Text style={styles.body}>
        Pagat base v1 · points only. Enter eligible maal totals already counted
        by the table, including any eligible exposed tunnelas. Unseen status
        changes the finish payment; this preset does not apply Murder or Kidnap
        adjustments.
      </Text>
      {review ? (
        <>
          <Text style={styles.body}>
            Winner:{' '}
            {
              players.find((player) => player.playerId === review.winnerId)
                ?.name
            }{' '}
            · {review.dubleeWin ? 'Dublee finish' : 'Normal finish'}
          </Text>
          {calculateMarriageRound(review).map((score) => {
            const input = review.players.find(
              (player) => player.playerId === score.playerId,
            )!;
            return (
              <Text key={score.playerId} style={styles.body}>
                {
                  players.find((player) => player.playerId === score.playerId)
                    ?.name
                }
                : {input.maal} maal · {input.seen ? 'Seen' : 'Unseen'} ·{' '}
                {score.points > 0 ? '+' : ''}
                {score.points} points
              </Text>
            );
          })}
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            accessibilityState={{ disabled: saving }}
            style={styles.button}
            onPress={confirmSave}
          >
            <Text style={styles.buttonText}>
              {saving
                ? 'Saving round…'
                : round
                  ? 'Replace round'
                  : 'Save round'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            style={styles.button}
            onPress={() => setReview(null)}
          >
            <Text style={styles.buttonText}>Edit inputs</Text>
          </Pressable>
        </>
      ) : (
        <>
          {players.map((player) => (
            <View key={player.playerId} style={{ gap: 12 }}>
              <Text style={styles.label}>{player.name}</Text>
              <TextInput
                accessibilityLabel={`${player.name} eligible maal`}
                placeholder="Eligible maal, e.g. 0"
                placeholderTextColor="#64776d"
                keyboardType="number-pad"
                style={styles.input}
                value={player.maal}
                onChangeText={(maal) =>
                  setPlayers(
                    players.map((current) =>
                      current.playerId === player.playerId
                        ? { ...current, maal }
                        : current,
                    ),
                  )
                }
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 48,
                }}
              >
                <Text style={styles.body}>Seen the joker</Text>
                <Switch
                  accessibilityLabel={`${player.name} has seen the joker`}
                  value={player.seen}
                  onValueChange={(seen) =>
                    setPlayers(
                      players.map((current) =>
                        current.playerId === player.playerId
                          ? { ...current, seen }
                          : current,
                      ),
                    )
                  }
                />
              </View>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: winnerId === player.playerId }}
                style={styles.button}
                onPress={() => setWinnerId(player.playerId)}
              >
                <Text style={styles.buttonText}>
                  {winnerId === player.playerId ? '✓ ' : ''}
                  {player.name} finished
                </Text>
              </Pressable>
            </View>
          ))}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 48,
            }}
          >
            <Text style={styles.body}>Dublee win (+5 per opponent)</Text>
            <Switch
              accessibilityLabel="Winner finished with eight dublees"
              value={dubleeWin}
              onValueChange={setDubleeWin}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            style={styles.button}
            onPress={reviewRound}
          >
            <Text style={styles.buttonText}>Review calculation</Text>
          </Pressable>
        </>
      )}
      {error && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.error}
        >
          {error}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={saving}
        style={styles.button}
        onPress={onCancel}
      >
        <Text style={styles.buttonText}>Cancel round changes</Text>
      </Pressable>
    </View>
  );
}
