import { createContext, useContext } from 'react';
import { defaultPreferences, type Preferences } from './preferences';
export const PreferencesContext = createContext({
  preferences: defaultPreferences,
  keepAwake: true,
  setKeepAwake: (_value: boolean) => {},
  update: async <K extends keyof Preferences>(
    _key: K,
    _value: Preferences[K],
  ): Promise<void> => {},
});
export function usePreferences() {
  return useContext(PreferencesContext);
}
