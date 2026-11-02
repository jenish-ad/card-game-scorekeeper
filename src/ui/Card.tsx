import { View, type ViewProps } from 'react-native';
import { useStyles } from '@/ui/Screen';
export function Card({ style, ...props }: ViewProps) {
  const styles = useStyles();
  return <View {...props} style={[styles.card, style]} />;
}
