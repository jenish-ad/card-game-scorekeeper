import {
  useEffect,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { getLocales } from 'expo-localization';
import { ActivityIndicator, Text } from 'react-native';
import { useMatchDatabase } from './MatchStorageProvider';
import { PreferencesContext } from './PreferencesContext';
import { PreferenceStore } from './preferences';
import { configureI18n, t, translateError } from '../i18n';
import { Screen, useStyles } from '../ui/Screen';
import { Button } from '../ui/Primitives';
export { usePreferences } from './PreferencesContext';
export function PreferencesProvider({ children }: PropsWithChildren) {
  const database = useMatchDatabase();
  const styles = useStyles();
  const [store] = useState(
    () =>
      new PreferenceStore(
        database,
        getLocales()[0]?.languageTag.startsWith('ne') ? 'ne' : 'en',
        configureI18n,
      ),
  );
  const { preferences, ready, readError, preferenceError } =
    useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    void store.load();
  }, [store]);
  if (!ready && readError !== null)
    return (
      <Screen>
        <Text style={styles.error}>
          {translateError(readError, 'preferencesError')}
        </Text>
        <Button label={t('Retry')} onPress={() => void store.load()} />
      </Screen>
    );
  if (!ready) return <ActivityIndicator accessibilityLabel={t('loading')} />;
  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        keepAwake: preferences.keepAwake,
        preferenceError,
        clearPreferenceError: store.clearPreferenceError,
        setKeepAwake: (value) => {
          void store.update('keepAwake', value).catch(() => {});
        },
        update: store.update,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
