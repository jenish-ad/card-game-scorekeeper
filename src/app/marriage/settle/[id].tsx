import { t } from '../../../i18n';
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
        <ActivityIndicator accessibilityLabel={t('Loading')} />
      </Screen>
    );
  if (!match || error)
    return (
      <Screen>
        <Text style={styles.error}>{error ?? t('Match not found.')}</Text>
        <Button label={t('Retry')} onPress={reload} />
      </Screen>
    );
  const rate = match.settings.moneyRate;
  if (rate === null)
    return (
      <Screen>
        <Text style={styles.body}>
          {t('Money rate is off for this match.')}
        </Text>
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
      <Text style={styles.title}>{t('Settle up')}</Text>
      <Text style={styles.body}>{match.title}</Text>
      {!match.finishedAt && (
        <Text style={styles.caption}>
          {t('Based on current totals; this match is still active.')}
        </Text>
      )}
      {transfers.length ? (
        transfers.map((transfer) => (
          <Text key={`${transfer.from}-${transfer.to}`} style={styles.label}>
            {match.players.find((player) => player.id === transfer.from)?.name}{' '}
            {t('pays')}{' '}
            {match.players.find((player) => player.id === transfer.to)?.name}{' '}
            {formatMoney(transfer.paisa)}
          </Text>
        ))
      ) : (
        <Text style={styles.body}>{t('No payments needed.')}</Text>
      )}
    </Screen>
  );
}
