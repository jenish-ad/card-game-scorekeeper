import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { DraggableSeat } from '../../ui/DraggableSeat';
import { createMatch } from '../../features/marriage/matches';
import { currentRuleVersion } from '../../scoring/pagatBaseV1';
import { useMatchDatabase } from '../../storage/MatchStorageProvider';
import { theme } from '../../theme';
import { Button, PresetCard } from '../../ui/Primitives';
import { Screen, styles } from '../../ui/Screen';

export default function MatchSetupScreen() {
  const database = useMatchDatabase();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [players, setPlayers] = useState([
    { id: '1', name: '' },
    { id: '2', name: '' },
  ]);
  const [nextId, setNextId] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function start() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const id = await createMatch(
        database,
        players.map((player) => player.name),
        title,
        currentRuleVersion,
      );
      router.replace(`/marriage/match/${id}`);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Could not save match.',
      );
      setSaving(false);
    }
  }
  function move(index: number, direction: number) {
    const target = Math.max(0, Math.min(players.length - 1, index + direction));
    if (target < 0 || target >= players.length) return;
    const next = [...players];
    const [player] = next.splice(index, 1);
    next.splice(target, 0, player);
    setPlayers(next);
  }
  return (
    <Screen
      footer={
        <Button
          label={saving ? 'Starting…' : 'Start Match →'}
          disabled={saving}
          onPress={() => void start()}
        />
      }
    >
      <Text style={styles.label}>Match title</Text>
      <TextInput
        accessibilityLabel="Match title"
        placeholder="Sunday Evening Game"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        maxLength={80}
      />
      <View style={styles.spread}>
        <Text style={styles.label}>Players & seating</Text>
        <Text style={styles.body}>{players.length} of 5</Text>
      </View>
      <Text style={styles.body}>
        Seat 1 plays first. Drag a handle to reorder.
      </Text>
      <View>
        {players.map((item, index) => {
          return (
            <DraggableSeat
              key={item.id}
              seat={index + 1}
              name={item.name}
              move={(offset) => move(index, offset)}
            >
              <TextInput
                accessibilityLabel={`Player ${index + 1} name`}
                value={item.name}
                placeholder={`Player ${index + 1}`}
                placeholderTextColor={theme.colors.textMuted}
                autoCorrect={false}
                maxLength={40}
                style={[
                  styles.input,
                  { flex: 1, borderWidth: 0, paddingHorizontal: 0 },
                ]}
                onChangeText={(name) =>
                  setPlayers((current) =>
                    current.map((player) =>
                      player.id === item.id ? { ...player, name } : player,
                    ),
                  )
                }
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove player ${index + 1}`}
                accessibilityState={{ disabled: players.length === 2 }}
                disabled={players.length === 2}
                onPress={() =>
                  setPlayers(players.filter((player) => player.id !== item.id))
                }
                style={{
                  minWidth: theme.touchTarget,
                  minHeight: theme.touchTarget,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: players.length === 2 ? 0.3 : 1,
                }}
              >
                <Text style={styles.body}>×</Text>
              </Pressable>
            </DraggableSeat>
          );
        })}
      </View>
      <Button
        label={`＋ Add player · ${5 - players.length} seats left`}
        secondary
        disabled={players.length >= 5}
        onPress={() => {
          setPlayers([...players, { id: String(nextId), name: '' }]);
          setNextId(nextId + 1);
        }}
      />
      <Text style={styles.body}>
        Play order:{' '}
        {players
          .map((player, index) => player.name.trim() || `Seat ${index + 1}`)
          .join(' → ')}
      </Text>
      <PresetCard />
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </Screen>
  );
}
