import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useMatchDatabase } from '../../storage/MatchStorageProvider';
import { getMatch, listMatches, type SavedMatch } from './matches';

export function useMatches(id?: number) {
  const database = useMatchDatabase();
  const [matches, setMatches] = useState<SavedMatch[]>([]);
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
          : getMatch(database, id).then((match) => (match ? [match] : []));
      reading
        .then((saved) => {
          if (!cancelled) {
            setMatches(saved);
            setLoading(false);
          }
        })
        .catch((failure: unknown) => {
          if (!cancelled) {
            setError(
              failure instanceof Error
                ? failure.message
                : 'Could not read saved matches.',
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
    match: matches[0],
    loading,
    error,
    reload: () => setRevision((value) => value + 1),
  };
}
