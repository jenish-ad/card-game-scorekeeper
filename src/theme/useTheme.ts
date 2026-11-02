import { usePreferences } from '@/storage/PreferencesContext';
import { useColorScheme } from 'react-native';
import {
  darkTheme,
  lightTheme,
  nepaliLightTheme,
  nepaliDarkTheme,
  type AppTheme,
} from '@/theme/tokens';
export function useTheme(): AppTheme {
  const { preferences } = usePreferences();
  const systemScheme = useColorScheme();
  const scheme =
    preferences.theme === 'system' ? systemScheme : preferences.theme;
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  return preferences.language === 'ne' || preferences.numerals === 'devanagari'
    ? theme === darkTheme
      ? nepaliDarkTheme
      : nepaliLightTheme
    : theme;
}
