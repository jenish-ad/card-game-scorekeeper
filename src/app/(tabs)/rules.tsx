import { Text, View } from 'react-native';
import { Screen, useStyles } from '../../ui/Screen';
export default function RulesScreen() {
  const styles = useStyles();
  return (
    <Screen topSafeArea>
      <Text style={styles.title}>Rules</Text>
      <Text style={styles.body}>
        For 2 to 5 players. Enter each player&apos;s maal and mark them Seen or
        Unseen. The winner must be Seen. Unseen maal counts as 0.
      </Text>
      <Text style={styles.subtitle}>Scoring</Text>
      <Text style={styles.body}>
        For each opponent, multiply their counted maal by the number of players,
        subtract the total Seen maal, then subtract their finish fee.
      </Text>
      <Text style={styles.body}>
        The default finish fee is 3 for Seen players and 10 for Unseen players.
        For a Dublee finish, each opponent pays an extra 5.
      </Text>
      <Text style={styles.body}>
        The winner receives the opposite of all opponents&apos; combined points.
        Every round totals 0. The winner can lose points if another player has
        enough maal.
      </Text>
      <Text style={styles.body}>
        You can change these fees and enable a Rs rate per point under Rules
        when starting a match. Settings apply only to that match.
      </Text>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Example: 3 players</Text>
        <Text style={styles.body}>
          Sita wins with 5 maal (Seen). Ram has 2 maal (Seen). Hari is Unseen.
          Total Seen maal is 7.
        </Text>
        <Text style={styles.label}>Normal finish</Text>
        <Text style={styles.body}>
          Ram: 3 x 2 - 7 - 3 = -4{'\n'}Hari: 0 - 7 - 10 = -17{'\n'}Sita: +21
        </Text>
        <Text style={styles.label}>Dublee finish</Text>
        <Text style={styles.body}>
          Ram: -9{'\n'}Hari: -22{'\n'}Sita: +31
        </Text>
      </View>
      <Text style={styles.subtitle}>Settle up</Text>
      <Text style={styles.body}>
        With a money rate enabled, totals also show Rs amounts. Settle up
        matches the largest remaining payments to reduce transfers. Share result
        opens your device&apos;s share sheet.
      </Text>
      <Text style={styles.caption}>
        Matches are stored on this device. Cloud sync and backup are
        unavailable.
      </Text>
    </Screen>
  );
}
