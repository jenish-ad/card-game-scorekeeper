import { SegmentedControl } from '@/ui/SegmentedControl';
import { Text, View } from 'react-native';
import { t, translateError } from '@/i18n';
import { formatNumber, latinDigits } from '@/i18n/numbers';
import type { TranslationKey } from '@/i18n/locales/en';
import { usePreferences } from '@/storage/PreferencesContext';
import type { Preferences } from '@/storage/preferences';
import { Button } from '@/ui/Button';
import { Screen, useStyles } from '@/ui/Screen';

const paragraphs: TranslationKey[] = [
  "For 2 to 5 players. Enter each player's maal and mark them Seen or Unseen. The winner must be Seen. Unseen maal counts as 0.",
  'For each opponent, multiply their counted maal by the number of players, subtract the total Seen maal, then subtract their finish fee.',
  'The default finish fee is 3 for Seen players and 10 for Unseen players. For a Dublee finish, each opponent pays an extra 5.',
  "The winner receives the opposite of all opponents' combined points. Every round totals 0. The winner can lose points if another player has enough maal.",
  'You can change these fees and enable a Rs rate per point under Rules when starting a match. Settings apply only to that match.',
];
export default function RulesScreen() {
  const styles = useStyles();
  const { preferences, update, preferenceError, clearPreferenceError } =
    usePreferences();
  async function change<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    try {
      await update(key, value);
    } catch {
      // The context retains the error while leaving the app and preference intact.
    }
  }
  return (
    <Screen topSafeArea>
      <Text style={styles.title}>{t('Rules')}</Text>
      <Text style={styles.subtitle}>{t('Settings')}</Text>
      <View style={styles.card}>
        <Button
          secondary
          label={t('Keep screen on during matches: {p0}', {
            p0: preferences.keepAwake ? t('On') : t('Off'),
          })}
          onPress={() => void change('keepAwake', !preferences.keepAwake)}
        />
        <Text style={styles.label}>{t('Language')}</Text>
        <SegmentedControl
          label={t('Language')}
          value={preferences.language}
          onChange={(value) => void change('language', value)}
          options={[
            { value: 'en', label: t('English') },
            { value: 'ne', label: t('Nepali') },
          ]}
        />
        <Text style={styles.label}>{t('Numerals')}</Text>
        <SegmentedControl
          label={t('Numerals')}
          value={preferences.numerals}
          onChange={(value) => void change('numerals', value)}
          options={[
            {
              value: 'latin',
              label: formatNumber(latinDigits(t('latinChoice')), 'latin'),
            },
            {
              value: 'devanagari',
              label: formatNumber(
                latinDigits(t('devanagariChoice')),
                'devanagari',
              ),
            },
          ]}
        />
        <Text style={styles.label}>{t('Dates')}</Text>
        <SegmentedControl
          label={t('Dates')}
          value={preferences.calendar}
          onChange={(value) => void change('calendar', value)}
          options={[
            { value: 'ad', label: t('AD') },
            { value: 'bs', label: t('BS') },
          ]}
        />
        {preferenceError !== null && (
          <View>
            <Text style={styles.error}>
              {translateError(preferenceError, 'preferencesError')}
            </Text>
            <Button
              secondary
              label={t('Done')}
              onPress={clearPreferenceError}
            />
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>{t('Scoring')}</Text>
      <View style={styles.card}>
        {paragraphs.map((key) => (
          <Text key={key} style={styles.body}>
            {t(key)}
          </Text>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.subtitle}>{t('Example: 3 players')}</Text>
        <Text style={styles.body}>
          {t(
            'Sita wins with 5 maal (Seen). Ram has 2 maal (Seen). Hari is Unseen. Total Seen maal is 7.',
          )}
        </Text>
        <Text style={styles.label}>{t('Normal finish')}</Text>
        <Text style={styles.body}>
          {t('Ram: 3 x 2 - 7 - 3 = -4')}
          {'\n'}
          {t('Hari: 0 - 7 - 10 = -17')}
          {'\n'}
          {t('Sita: +21')}
        </Text>
        <Text style={styles.label}>{t('Dublee finish')}</Text>
        <Text style={styles.body}>
          {t('Ram: -9')}
          {'\n'}
          {t('Hari: -22')}
          {'\n'}
          {t('Sita: +31')}
        </Text>
      </View>
      <Text style={styles.subtitle}>{t('Settle up')}</Text>
      <Text style={styles.body}>
        {t(
          "With a money rate enabled, totals also show Rs amounts. Settle up matches the largest remaining payments to reduce transfers. Share result opens your device's share sheet.",
        )}
      </Text>
      <Text style={styles.caption}>
        {t(
          'Matches are stored on this device. Cloud sync and backup are unavailable.',
        )}
      </Text>
    </Screen>
  );
}
