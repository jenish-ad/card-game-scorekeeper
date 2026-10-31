import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { Screen, styles } from '../ui/Screen';

export default function HomeScreen() {
  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        Keep your table together
      </Text>
      <Text style={styles.body}>
        Marriage scorekeeping, starting with your players.
      </Text>
      <Link href="/marriage/setup" asChild>
        <Pressable accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>Set up Marriage</Text>
        </Pressable>
      </Link>
      <Text style={styles.body}>
        Record maal, review each round, and keep your scoreboard offline on this
        device.
      </Text>
      <Link href="/history" asChild>
        <Pressable accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>Resume a match or view history</Text>
        </Pressable>
      </Link>
      <Text accessibilityRole="header" style={styles.label}>
        More games, later
      </Text>
      <Text style={styles.body}>Callbreak support is planned.</Text>
    </Screen>
  );
}
