import { t } from '../../../i18n';
import { useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Text, TextInput, View } from 'react-native';
import { addPlayer, setPlayerActive } from '../../../features/marriage/matches';
import { useMatches } from '../../../features/marriage/useMatches';
import { useMatchDatabase } from '../../../storage/MatchStorageProvider';
import { Button } from '../../../ui/Primitives';
import { Screen, useStyles } from '../../../ui/Screen';
export default function PlayersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { match, reload, error } = useMatches(Number(id));
  const database = useMatchDatabase();
  const styles = useStyles();
  const [name, setName] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function change(work: () => Promise<void>) {
    setBusy(true);
    setFailure(null);
    try {
      await work();
      setName('');
      reload();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : t('Could not update players.'),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Stack.Screen options={{ title: t('Players') }} />
      {match?.players
        .toSorted(
          (a, b) => Number(b.active) - Number(a.active) || a.seat - b.seat,
        )
        .map((player) => (
          <View key={player.id} style={styles.spread}>
            <View style={styles.flexible}>
              <Text style={styles.label}>{player.name}</Text>
              {!player.active && (
                <Text style={styles.caption}>{t('Left')}</Text>
              )}
            </View>
            <Button
              secondary
              label={player.active ? t('Remove') : t('Rejoin')}
              disabled={busy || Boolean(match.finishedAt)}
              onPress={() => {
                const update = () =>
                  void change(() =>
                    setPlayerActive(
                      database,
                      match.id,
                      player.id,
                      !player.active,
                    ),
                  );
                if (player.active)
                  Alert.alert(t('Remove player?'), player.name, [
                    { text: t('Cancel'), style: 'cancel' },
                    {
                      text: t('Remove'),
                      style: 'destructive',
                      onPress: update,
                    },
                  ]);
                else update();
              }}
            />
          </View>
        ))}
      <TextInput
        accessibilityLabel={t('Add player')}
        placeholder={t('Player name')}
        value={name}
        onChangeText={setName}
        style={styles.input}
        maxLength={40}
      />
      <Button
        label={t('Add player')}
        disabled={!match || busy || Boolean(match.finishedAt)}
        onPress={() => void change(() => addPlayer(database, Number(id), name))}
      />
      {(failure || error) && (
        <Text accessibilityRole="alert" style={styles.error}>
          {failure || error}
        </Text>
      )}
    </Screen>
  );
}
