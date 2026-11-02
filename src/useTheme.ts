import { usePreferences } from './storage/PreferencesContext';
import { useColorScheme } from 'react-native';
import {
  darkTheme,
  lightTheme,
  nepaliLightTheme,
  nepaliDarkTheme,
  type AppTheme,
} from './theme';
export function useTheme(): AppTheme {
  const { preferences } = usePreferences();
  const theme = useColorScheme() === 'dark' ? darkTheme : lightTheme;
  return preferences.language === 'ne' || preferences.numerals === 'devanagari'
    ? theme === darkTheme
      ? nepaliDarkTheme
      : nepaliLightTheme
    : theme;
}
