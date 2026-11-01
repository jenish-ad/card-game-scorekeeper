import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { useMatches } from '../../../features/marriage/useMatches';
import { matchTotals } from '../../../features/marriage/matches';
import {
  formatMoney,
  moneyAmount,
  settleUp,
} from '../../../features/marriage/settlement';
import { Button } from '../../../ui/Primitives';
import { Screen, useStyles } from '../../../ui/Screen';
export default function SettleScreen() {
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { match, loading, error, reload } = useMatches(Number(id));
  if (loading)
    return (
      <Screen>
        <ActivityIndicator accessibilityLabel="Loading" />
      </Screen>
    );
  if (!match || error)
    return (
      <Screen>
        <Text style={styles.error}>{error ?? 'Match not found.'}</Text>
        <Button label="Retry" onPress={reload} />
      </Screen>
    );
  const rate = match.settings.moneyRate;
  if (rate === null)
    return (
      <Screen>
        <Text style={styles.body}>Money rate is off for this match.</Text>
      </Screen>
    );
  const transfers = settleUp(
    [...matchTotals(match)].map(([playerId, points]) => ({
      playerId,
      paisa: moneyAmount(points, rate),
    })),
  );
  return (
    <Screen>
      <Text style={styles.title}>Settle up</Text>
      <Text style={styles.body}>{match.title}</Text>
      {!match.finishedAt && (
        <Text style={styles.caption}>
          Based on current totals; this match is still active.
        </Text>
      )}
      {transfers.length ? (
        transfers.map((transfer) => (
          <Text key={`${transfer.from}-${transfer.to}`} style={styles.label}>
            {match.players.find((player) => player.id === transfer.from)?.name}{' '}
            pays{' '}
            {match.players.find((player) => player.id === transfer.to)?.name}{' '}
            {formatMoney(transfer.paisa)}
          </Text>
        ))
      ) : (
        <Text style={styles.body}>No payments needed.</Text>
      )}
    </Screen>
  );
}
