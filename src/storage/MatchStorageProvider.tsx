import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { openDatabaseAsync } from 'expo-sqlite';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Screen, useStyles } from '../ui/Screen';
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
  const styles = useStyles();
  const [database, setDatabase] = useState<MatchDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    openMatchDatabase()
      .then((connection) => {
        if (!cancelled) setDatabase(connection);
      })
      .catch(() => {
        if (!cancelled)
          setError(
            'Could not open saved matches; check device storage and retry.',
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
      {!error && <ActivityIndicator accessibilityLabel="Loading" />}
      {error && (
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
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
