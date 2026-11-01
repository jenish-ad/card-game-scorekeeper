import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type AppTheme } from './theme';
export function useTheme(): AppTheme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
