import { SceneLandscape } from '@/ui/SceneLandscape';
import { sceneHeader } from '@/ui/sceneHeader';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Pressable, Switch, Text, View, StyleSheet } from 'react-native';
import { t, translateError } from '@/i18n';
import { usePreferences } from '@/storage/PreferencesContext';
import type { Preferences } from '@/storage/preferences';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';
import { Button } from '@/ui/Button';
import { Screen, useStyles } from '@/ui/Screen';

export default function SettingsScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const c = theme.colors;
  const { preferences, update, preferenceError, clearPreferenceError } =
    usePreferences();
  async function change<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    try {
      await update(key, value);
    } catch {
      /* Preference errors remain visible below. */
    }
  }
  return (
    <Screen topSafeArea>
      <View style={[local.hero, { backgroundColor: c.sky }]}>
        <SceneLandscape />
        <View
          accessible={false}
          style={{
            position: 'absolute',
            right: 20,
            top: 24,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: c.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sunny-outline" size={30} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>{t('Settings')}</Text>
      </View>
      <SegmentedControl
        filled
        label={t('Appearance')}
        value={preferences.theme}
        onChange={(value) => void change('theme', value)}
        options={[
          { value: 'system', label: t('System') },
          { value: 'light', label: t('Light') },
          { value: 'dark', label: t('Dark') },
        ]}
      />
      <View
        style={{ flexDirection: 'row', gap: 10 }}
        accessibilityRole="radiogroup"
        accessibilityLabel={t('Language')}
      >
        {(['en', 'ne'] as const).map((language) => {
          const selected = preferences.language === language;
          const color = selected ? c.onInk : c.text;
          return (
            <Pressable
              key={language}
              accessibilityRole="radio"
              accessibilityLabel={
                language === 'en' ? t('English') : t('Nepali')
              }
              accessibilityState={{ checked: selected }}
              onPress={() => void change('language', language)}
              style={[
                local.language,
                { backgroundColor: selected ? c.ink : c.surface },
              ]}
            >
              <Text
                style={{
                  color,
                  fontSize: 26,
                  fontFamily:
                    language === 'ne'
                      ? 'Mukta_800ExtraBold'
                      : theme.fonts.heavy,
                }}
              >
                {language === 'en' ? 'Aa' : 'अ'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color }]}>
                  {language === 'en' ? 'English' : 'नेपाली'}
                </Text>
                <Text style={[styles.caption, { color }]}>
                  {language === 'en' ? 'Round 7' : 'राउन्ड ७'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.card, { padding: 12, gap: 10 }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { width: 65 }]}>{t('Numerals')}</Text>
          <View style={styles.flexible}>
            <SegmentedControl
              filled
              label={t('Numerals')}
              value={preferences.numerals}
              onChange={(value) => void change('numerals', value)}
              options={[
                { value: 'latin', label: '123' },
                { value: 'devanagari', label: '१२३' },
              ]}
            />
          </View>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { width: 65 }]}>{t('Dates')}</Text>
          <View style={styles.flexible}>
            <SegmentedControl
              filled
              label={t('Dates')}
              value={preferences.calendar}
              onChange={(value) => void change('calendar', value)}
              options={[
                { value: 'ad', label: t('AD') },
                { value: 'bs', label: t('BS') },
              ]}
            />
          </View>
        </View>
      </View>
      <View style={[styles.card, styles.row, { padding: 16 }]}>
        <View
          style={{ backgroundColor: c.gainTint, padding: 8, borderRadius: 12 }}
        >
          <Icon name="phone-portrait-outline" size={20} />
        </View>
        <View style={styles.flexible}>
          <Text style={styles.label}>{t('Keep screen on')}</Text>
        </View>
        <Switch
          accessibilityLabel={t('Keep screen on')}
          value={preferences.keepAwake}
          onValueChange={(value) => void change('keepAwake', value)}
          trackColor={{ false: c.hairline, true: c.ink }}
          thumbColor={c.surface}
        />
      </View>
      {preferenceError !== null && (
        <View style={styles.card}>
          <Text accessibilityRole="alert" style={styles.error}>
            {translateError(preferenceError, 'preferencesError')}
          </Text>
          <Button secondary label={t('Done')} onPress={clearPreferenceError} />
        </View>
      )}
    </Screen>
  );
}

const local = StyleSheet.create({
  hero: { ...sceneHeader, height: 150 },
  language: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
