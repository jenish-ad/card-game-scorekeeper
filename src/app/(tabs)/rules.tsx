import { Text, View } from 'react-native';
import { theme } from '../../theme';
import { Chip, Score } from '../../ui/Primitives';
import { Screen, styles } from '../../ui/Screen';

export default function RulesScreen() {
  return (
    <Screen topSafeArea>
      <Text style={styles.title}>Rules & About</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.eyebrow, { color: theme.colors.goldLight }]}>
          Scoring preset
        </Text>
        <View style={styles.spread}>
          <Text style={[styles.subtitle, { color: theme.colors.surface }]}>
            ♧ Pagat base v1
          </Text>
          <Chip gold>Preset</Chip>
        </View>
      </View>
      <Text style={styles.subtitle}>How points are calculated</Text>
      <Text style={styles.body}>
        The table counts each player’s maal. Enter it in the app, then select a
        seen winner and the finish type.
      </Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          1. Each player starts with their maal × number of players. Unseen
          players’ maal counts as 0.
        </Text>
        <Text style={styles.body}>
          2. Subtract the total maal of all seen players.
        </Text>
        <Text style={styles.body}>
          3. Each non-winner also pays 3 points if seen, or 10 if unseen.
        </Text>
        <Text style={styles.body}>
          4. The winner receives the opposite of the other players’ combined
          points. Every round balances to 0.
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Text style={styles.label}>Dublee rule not configured</Text>
        <Text style={styles.body}>
          The Dublee adjustment has not been defined. Normal rounds can be
          scored and saved.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Worked example · 3 players</Text>
        <Text style={styles.body}>
          Sita wins normally. Total seen maal = 5 + 2 = 7.
        </Text>
        {[
          { name: 'Sita', detail: '5 maal · Seen · Winner', points: 21 },
          { name: 'Ram', detail: '2 maal · Seen', points: -4 },
          { name: 'Hari', detail: '0 maal · Unseen', points: -17 },
        ].map((player) => (
          <View key={player.name} style={styles.spread}>
            <View>
              <Text style={styles.label}>{player.name}</Text>
              <Text style={styles.body}>{player.detail}</Text>
            </View>
            <Score compact value={player.points} />
          </View>
        ))}
        <Text style={[styles.body, { fontVariant: ['tabular-nums'] }]}>
          Ram: 3 × 2 − 7 − 3 = −4{'\n'}Hari: 3 × 0 − 7 − 10 = −17{'\n'}Sita:
          −(−4 + −17) = +21
        </Text>
      </View>
      <Text style={styles.body}>
        Matches saved with the original preset retain their original scoring,
        including Dublee. They are never recalculated using the revised rules.
      </Text>
      <View style={styles.divider} />
      <Text style={styles.label}>Your matches are stored on this device.</Text>
      <Text style={styles.body}>
        Backup and cloud sync are not currently available.
      </Text>
    </Screen>
  );
}
