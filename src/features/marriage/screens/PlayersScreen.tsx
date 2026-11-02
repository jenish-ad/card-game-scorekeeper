import { TextField as TextInput } from '@/ui/TextField';
import { useConfirm } from '@/ui/ConfirmDialog';
import { t, translateError } from '@/i18n';
import { useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { addPlayer, setPlayerActive } from '@/features/marriage/data/matches';
import { useMatches } from '@/features/marriage/data/useMatches';
import { useMatchDatabase } from '@/storage/MatchStorageProvider';
import { Button } from '@/ui/Button';
import { Screen, useStyles } from '@/ui/Screen';
export default function PlayersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { match, reload, error } = useMatches(Number(id));
  const database = useMatchDatabase();
  const styles = useStyles();
  const confirm = useConfirm();
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
      setFailure(translateError(error, 'Could not update players.'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Stack.Screen options={{ title: t('Players') }} />
      {match?.players
        .slice()
        .sort((a, b) => Number(b.active) - Number(a.active) || a.seat - b.seat)
        .map((player) => (
          <View key={player.id} style={styles.ruledRow}>
            <View style={styles.flexible}>
              <Text style={[styles.label, { fontSize: 16 }]}>
                {player.name}
              </Text>
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
                  setPlayerActive(
                    database,
                    match.id,
                    player.id,
                    !player.active,
                  );
                if (player.active) {
                  void confirm({
                    title: t('Remove {name}?', { name: player.name }),
                    body: match.rounds.some((round) =>
                      round.input.players.some(
                        (entry) => entry.playerId === player.id,
                      ),
                    )
                      ? t('Their past rounds and points stay in the match.')
                      : t("They haven't played yet and will be removed."),
                    confirmLabel: t('Remove'),
                    destructive: true,
                    action: async () => {
                      await update();
                      reload();
                    },
                  });
                } else void change(update);
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
