import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { openDatabaseAsync } from 'expo-sqlite';
import { Pressable, Text } from 'react-native';
import { Screen, styles } from '../ui/Screen';
import { migrateDatabase, type MatchDatabase } from './database';

const StorageContext = createContext<MatchDatabase | null>(null);
let openingDatabase: Promise<MatchDatabase> | undefined;

function openMatchDatabase() {
  openingDatabase ??= (async () => {
    const database = await openDatabaseAsync('card-game-scorekeeper.db');
    try {
      await migrateDatabase(database);
      return database;
    } catch (error) {
      await database.closeAsync();
      throw error;
    }
  })().catch((error: unknown) => {
    openingDatabase = undefined;
    throw error;
  });
  return openingDatabase;
}

export function MatchStorageProvider({ children }: PropsWithChildren) {
  const [database, setDatabase] = useState<MatchDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    openMatchDatabase()
      .then((connection) => {
        if (!cancelled) setDatabase(connection);
      })
      .catch((failure: unknown) => {
        if (!cancelled)
          setError(
            failure instanceof Error
              ? failure.message
              : 'Unable to open local match storage.',
          );
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);
  if (database)
    return (
      <StorageContext.Provider value={database}>
        {children}
      </StorageContext.Provider>
    );
  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        {error ? 'Storage unavailable' : 'Opening saved matches…'}
      </Text>
      {error && (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
          <Text style={styles.body}>
            Your saved matches have not been reset. Check available device
            storage and try again.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.button}
            onPress={() => {
              setError(null);
              setAttempt((value) => value + 1);
            }}
          >
            <Text style={styles.buttonText}>Retry opening storage</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

export function useMatchDatabase() {
  const database = useContext(StorageContext);
  if (!database) throw new Error('Match storage is not ready.');
  return database;
}
