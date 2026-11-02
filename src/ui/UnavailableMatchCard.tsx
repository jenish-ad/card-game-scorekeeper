import { Text, View } from 'react-native';
import { t } from '../i18n';
import { useStyles } from './Screen';
export function UnavailableMatchCard() {
  const styles = useStyles();
  return (
    <View style={styles.card} accessible>
      <Text style={styles.caption}>{t('unavailableMatch')}</Text>
    </View>
  );
}
