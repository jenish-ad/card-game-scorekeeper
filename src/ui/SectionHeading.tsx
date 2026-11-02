import { View, Text } from 'react-native';
import { useStyles } from './Screen';
export function SectionHeading({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.spread}>
      <Text style={styles.label}>{title}</Text>
      {detail && <Text style={styles.caption}>{detail}</Text>}
    </View>
  );
}
