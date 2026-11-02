import { useKeepAwake } from 'expo-keep-awake';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { usePreferences } from '../storage/PreferencesContext';
function Awake() {
  useKeepAwake();
  return null;
}
export function MatchKeepAwake({ active }: { active: boolean }) {
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  const { keepAwake } = usePreferences();
  return active && focused && keepAwake ? <Awake /> : null;
}
