import { useState } from 'react';
import { PlayerAvatar } from '../../../ui/PlayerAvatar';
import { ScoreText } from '../../../ui/ScoreText';
import { Icon } from '../../../ui/Icon';
import {
  displayMatchTitle,
  formatMoney,
  resultSummary,
} from '../../../i18n/matchText';
import { t, translateError } from '../../../i18n';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View, Share } from 'react-native';
import { useMatches } from '../../../features/marriage/useMatches';
import { matchTotals } from '../../../features/marriage/matches';
import { moneyAmount, settleUp } from '../../../features/marriage/settlement';
import { Button } from '../../../ui/Primitives';
import { Screen, useStyles } from '../../../ui/Screen';
export default function SettleScreen() {
  const styles = useStyles();
  const [shareError, setShareError] = useState<string | null>(null);
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
      <Text style={styles.body}>{displayMatchTitle(match)}</Text>
      {!match.finishedAt && (
        <Text style={styles.caption}>
          {t('Based on current totals; this match is still active.')}
        </Text>
      )}
      {transfers.length ? (
        transfers.map((transfer) => (
          <View key={`${transfer.from}-${transfer.to}`} style={styles.card}>
            <View style={styles.row}>
              <PlayerAvatar
                name={
                  match.players.find((player) => player.id === transfer.from)
                    ?.name ?? ''
                }
                colorIndex={
                  match.players.find((player) => player.id === transfer.from)
                    ?.seat
                }
                size={36}
              />
              <Text style={[styles.label, styles.flexible]}>
                {
                  match.players.find((player) => player.id === transfer.from)
                    ?.name
                }
              </Text>
              <Icon name="arrow-forward" />
              <PlayerAvatar
                name={
                  match.players.find((player) => player.id === transfer.to)
                    ?.name ?? ''
                }
                colorIndex={
                  match.players.find((player) => player.id === transfer.to)
                    ?.seat
                }
                size={36}
              />
              <Text style={[styles.label, styles.flexible]}>
                {
                  match.players.find((player) => player.id === transfer.to)
                    ?.name
                }
              </Text>
            </View>
            <ScoreText
              neutral
              value={transfer.paisa}
              label={formatMoney(transfer.paisa)}
              size="lg"
            />
          </View>
        ))
      ) : (
        <Text style={styles.body}>{t('No payments needed.')}</Text>
      )}
      <Button
        secondary
        icon="share-outline"
        label={t('Share result')}
        onPress={() =>
          void Share.share({ message: resultSummary(match) }).catch((error) =>
            setShareError(
              translateError(error, 'Could not share the result; try again.'),
            ),
          )
        }
      />
      {shareError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {shareError}
        </Text>
      )}
    </Screen>
  );
}
