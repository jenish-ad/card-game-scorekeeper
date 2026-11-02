import { t, n } from '../../i18n';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Icon } from '../../ui/Icon';
import { feedback } from '../../ui/feedback';
import { DraggableSeat } from '../../ui/DraggableSeat';
import { defaultMatchTitle } from '../../features/marriage/matchTitle';
import { validatePlayerNames } from '../../features/marriage/playerNames';
import { createMatch } from '../../features/marriage/matches';
import {
  parseSettings,
  currentRuleVersion,
} from '../../features/marriage/scoring';
import { useMatchDatabase } from '../../storage/MatchStorageProvider';
import { useTheme } from '../../useTheme';
import { Button } from '../../ui/Primitives';
import { Screen, useStyles } from '../../ui/Screen';

export default function MatchSetupScreen() {
  const theme = useTheme();
  const styles = useStyles();
  const database = useMatchDatabase();
  const router = useRouter();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [fees, setFees] = useState({
    seenFee: '3',
    unseenFee: '10',
    dubleeExtra: '5',
    foulPenalty: '10',
  });
  const [foulMode, setFoulMode] = useState<'perPlayer' | 'fixedTotal'>(
    'perPlayer',
  );
  const [moneyEnabled, setMoneyEnabled] = useState(false);
  const [moneyRate, setMoneyRate] = useState('1');
  const [title, setTitle] = useState(defaultMatchTitle());
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
      const names = validatePlayerNames(players.map((player) => player.name));
      if (!names.ok) throw new Error(names.message);
      if (!title.trim() || title.trim().length > 80)
        throw new Error(t('Enter a match title of 1 to 80 characters.'));
      const settings = parseSettings({
        foulMode,
        foulPenalty: /^\d+$/.test(fees.foulPenalty)
          ? Number(fees.foulPenalty)
          : NaN,
        seenFee: /^\d+$/.test(fees.seenFee) ? Number(fees.seenFee) : NaN,
        unseenFee: /^\d+$/.test(fees.unseenFee) ? Number(fees.unseenFee) : NaN,
        dubleeExtra: /^\d+$/.test(fees.dubleeExtra)
          ? Number(fees.dubleeExtra)
          : NaN,
        moneyRate: moneyEnabled ? Number(moneyRate) : null,
      });
      const id = await createMatch(
        database,
        players.map((player) => player.name),
        title,
        currentRuleVersion,
        settings,
      ).catch(() => {
        throw new Error(t('Could not save match; try again.'));
      });
      router.replace(`/marriage/match/${id}`);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : t('Could not save match.'),
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
    if (target !== index) void feedback('selection');
  }
  return (
    <Screen
      footer={
        <Button
          label={saving ? t('Starting…') : t('Start match')}
          icon="arrow-forward"
          disabled={saving}
          onPress={() => void start()}
        />
      }
    >
      <View style={{ gap: theme.spacing.sm }}>
        <Text style={styles.title}>{t('New match')}</Text>
      </View>
      <View style={{ gap: theme.spacing.sm }}>
        <Text style={styles.label}>{t('Match title')}</Text>
        <TextInput
          accessibilityLabel={t('Match title')}
          placeholder={t('Match title')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />
      </View>
      <View style={styles.spread}>
        <Text style={styles.label}>{t('Players & seating')}</Text>
        <Text style={styles.body}>
          {n(players.length)} {t('of 5')}
        </Text>
      </View>
      <Text style={styles.body}>{t('Drag a handle to reorder players.')}</Text>
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
                accessibilityLabel={t('Player {p0} name', { p0: index + 1 })}
                value={item.name}
                placeholder={t('Player {p0}', { p0: index + 1 })}
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
                accessibilityLabel={t('Remove player {p0}', { p0: index + 1 })}
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
                <Icon name="close" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </DraggableSeat>
          );
        })}
      </View>
      <Button
        label={t('Add player · {p0} seats left', { p0: 5 - players.length })}
        icon="add"
        secondary
        disabled={players.length >= 5}
        onPress={() => {
          setPlayers([...players, { id: String(nextId), name: '' }]);
          setNextId(nextId + 1);
        }}
      />
      <Text style={styles.body}>
        {t('Play order:')}{' '}
        {players
          .map(
            (player, index) =>
              player.name.trim() || t('Player {p0}', { p0: index + 1 }),
          )
          .join(' → ')}
      </Text>
      <Button
        secondary
        label={rulesOpen ? t('Hide rules') : t('Rules')}
        onPress={() => setRulesOpen(!rulesOpen)}
      />
      {rulesOpen && (
        <View style={styles.card}>
          {(
            ['seenFee', 'unseenFee', 'dubleeExtra', 'foulPenalty'] as const
          ).map((key) => (
            <View key={key} style={styles.spread}>
              <Text style={styles.label}>
                {key === 'seenFee'
                  ? t('Seen fee')
                  : key === 'unseenFee'
                    ? t('Unseen fee')
                    : key === 'foulPenalty'
                      ? t('Foul penalty')
                      : t('Dublee extra')}
              </Text>
              <TextInput
                accessibilityLabel={
                  key === 'seenFee'
                    ? t('Seen fee')
                    : key === 'unseenFee'
                      ? t('Unseen fee')
                      : key === 'foulPenalty'
                        ? t('Foul penalty')
                        : t('Dublee extra')
                }
                keyboardType="number-pad"
                selectTextOnFocus
                style={[styles.input, { width: 80 }]}
                value={fees[key]}
                onChangeText={(value) => {
                  if (/^\d*$/.test(value))
                    setFees((current) => ({ ...current, [key]: value }));
                }}
              />
            </View>
          ))}
          <View style={styles.row}>
            <Button
              secondary={foulMode !== 'perPlayer'}
              label={t('Per player')}
              onPress={() => setFoulMode('perPlayer')}
            />
            <Button
              secondary={foulMode !== 'fixedTotal'}
              label={t('Total')}
              onPress={() => setFoulMode('fixedTotal')}
            />
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={t('Money rate')}
            accessibilityState={{ checked: moneyEnabled }}
            onPress={() => setMoneyEnabled(!moneyEnabled)}
            style={styles.ruledRow}
          >
            <Text style={styles.label}>
              {t('Money rate:')}
              {moneyEnabled ? t('On') : t('Off')}
            </Text>
          </Pressable>
          {moneyEnabled && (
            <View style={styles.spread}>
              <Text style={styles.label}>{t('Rs per point')}</Text>
              <TextInput
                accessibilityLabel={t('Rs per point')}
                keyboardType="decimal-pad"
                selectTextOnFocus
                style={[styles.input, { width: 100 }]}
                value={moneyRate}
                onChangeText={setMoneyRate}
              />
            </View>
          )}
        </View>
      )}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </Screen>
  );
}
