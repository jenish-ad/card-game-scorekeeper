import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { getLocales } from 'expo-localization';
import { ActivityIndicator, Text } from 'react-native';
import { useMatchDatabase } from './MatchStorageProvider';
import { PreferencesContext } from './PreferencesContext';
import {
  defaultPreferences,
  readPreferences,
  writePreference,
  type Preferences,
} from './preferences';
import { configureI18n, t } from '../i18n';
export { usePreferences } from './PreferencesContext';
export function PreferencesProvider({ children }: PropsWithChildren) {
  const database = useMatchDatabase();
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let cancelled = false;
    void readPreferences(
      database,
      getLocales()[0]?.languageTag.startsWith('ne') ? 'ne' : 'en',
    )
      .then((value) => {
        if (!cancelled) {
          configureI18n(value);
          setPreferences(value);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [database]);
  async function update<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    const work = queue.current
      .catch(() => {})
      .then(async () => {
        await writePreference(database, key, value);
        setPreferences((previous) => {
          const next = { ...previous, [key]: value };
          configureI18n(next);
          return next;
        });
      });
    queue.current = work;
    await work;
  }
  if (error) return <Text>{t('preferencesError')}</Text>;
  if (!ready) return <ActivityIndicator accessibilityLabel={t('loading')} />;
  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        keepAwake: preferences.keepAwake,
        setKeepAwake: (value) => {
          void update('keepAwake', value).catch(() => setError(true));
        },
        update,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
