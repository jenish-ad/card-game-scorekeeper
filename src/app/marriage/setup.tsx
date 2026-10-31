import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { validatePlayerNames } from '../../features/marriage/playerNames';
import { Screen, styles } from '../../ui/Screen';
import { useMatchDatabase } from '../../storage/MatchStorageProvider';
import { createMatch } from '../../features/marriage/matches';
import { validateMarriagePlayerCount } from '../../features/marriage/scoring';

export default function MatchSetupScreen() {
  const database = useMatchDatabase();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [players, setPlayers] = useState([
    { id: 1, name: '' },
    { id: 2, name: '' },
  ]);
  const [nextPlayerId, setNextPlayerId] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [reviewedNames, setReviewedNames] = useState<string[] | null>(null);

  function reviewPlayers() {
    try {
      validateMarriagePlayerCount(players.length);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Choose 2 to 5 players.',
      );
      return;
    }
    const result = validatePlayerNames(players.map((player) => player.name));
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    setReviewedNames(result.playerNames);
  }

  async function saveMatch() {
    if (!reviewedNames || saving) return;
    setSaving(true);
    setError(null);
    try {
      const id = await createMatch(database, reviewedNames);
      router.replace(`/marriage/match/${id}`);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? `Could not save match: ${failure.message}`
          : 'Could not save match. Please try again.',
      );
      setSaving(false);
    }
  }

  if (reviewedNames) {
    return (
      <Screen>
        <Text accessibilityRole="header" style={styles.title}>
          Review your players
        </Text>
        {reviewedNames.map((name, index) => (
          <Text key={name} style={styles.body}>
            {index + 1}. {name}
          </Text>
        ))}
        <Text style={styles.body}>
          Save these players to start a match. Saved matches and rounds stay on
          this device after restarting.
        </Text>
        <Text style={styles.body}>
          Preset: Pagat base. Enter eligible maal totals; normal seen/unseen
          payments are 3/10, with 5 extra for a dublee win.
        </Text>
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: saving }}
          disabled={saving}
          style={styles.button}
          onPress={() => void saveMatch()}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving match…' : 'Save match'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          disabled={saving}
          onPress={() => setReviewedNames(null)}
        >
          <Text style={styles.buttonText}>Edit players</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        Who’s playing?
      </Text>
      <Text style={styles.body}>
        Add 2 to 5 players in seating order. Review and save to keep this match.
        Unsaved setup is lost when you leave or restart.
      </Text>
      {players.map((player, index) => (
        <View key={player.id} style={{ gap: 8 }}>
          <Text style={styles.label}>Player {index + 1}</Text>
          <TextInput
            accessibilityLabel={`Player ${index + 1} name`}
            style={styles.input}
            value={player.name}
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={(name) => {
              setPlayers(
                players.map((current) =>
                  current.id === player.id ? { ...current, name } : current,
                ),
              );
              setError(null);
            }}
          />
          {players.length > 1 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove player ${index + 1}`}
              style={{ minHeight: 48, justifyContent: 'center' }}
              onPress={() => {
                setPlayers(
                  players.filter((current) => current.id !== player.id),
                );
                setError(null);
              }}
            >
              <Text style={styles.label}>Remove player {index + 1}</Text>
            </Pressable>
          )}
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={() => {
          setPlayers([...players, { id: nextPlayerId, name: '' }]);
          setNextPlayerId(nextPlayerId + 1);
          setError(null);
        }}
      >
        <Text style={styles.buttonText}>Add player</Text>
      </Pressable>
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
        style={styles.button}
        onPress={reviewPlayers}
      >
        <Text style={styles.buttonText}>Review players</Text>
      </Pressable>
    </Screen>
  );
}
