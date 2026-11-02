import { translateError } from '../../i18n';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useMatchDatabase } from '../../storage/MatchStorageProvider';
import {
  getMatch,
  listMatches,
  type SavedMatch,
  type UnavailableMatch,
} from './matches';

export function useMatches(id?: number) {
  const database = useMatchDatabase();
  const [matches, setMatches] = useState<SavedMatch[]>([]);
  const [unavailable, setUnavailable] = useState<UnavailableMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useFocusEffect(
    useCallback(() => {
      // A retry explicitly refreshes the database read, even without a focus change.
      void revision;
      let cancelled = false;
      setLoading(true);
      setError(null);
      const reading =
        id === undefined
          ? listMatches(database)
          : getMatch(database, id).then((match) => ({
              matches: match ? [match] : [],
              unavailable: [],
            }));
      reading
        .then((saved) => {
          if (!cancelled) {
            setMatches(saved.matches);
            setUnavailable(saved.unavailable);
            setLoading(false);
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setError(
              translateError(error, 'Could not load matches; try again.'),
            );
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [database, id, revision]),
  );
  return {
    matches,
    unavailable,
    match: matches[0],
    loading,
    error,
    reload: () => setRevision((value) => value + 1),
  };
}
