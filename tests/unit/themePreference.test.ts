import { expect, jest, test } from '@jest/globals';
import { defaultPreferences } from '@/storage/preferences';
import {
  darkTheme,
  lightTheme,
  nepaliDarkTheme,
  nepaliLightTheme,
} from '@/theme/tokens';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));
jest.mock('@/storage/PreferencesContext', () => ({
  usePreferences: jest.fn(),
}));

const { useColorScheme } =
  jest.requireMock<typeof import('react-native')>('react-native');
const { usePreferences } = jest.requireMock<
  typeof import('@/storage/PreferencesContext')
>('@/storage/PreferencesContext');
const { useTheme } =
  jest.requireActual<typeof import('@/theme/useTheme')>('@/theme/useTheme');

test.each([
  ['system', 'dark', darkTheme],
  ['system', 'light', lightTheme],
  ['system', null, lightTheme],
  ['light', 'dark', lightTheme],
  ['dark', 'light', darkTheme],
] as const)('%s appearance with system %s', (theme, system, expected) => {
  jest.mocked(useColorScheme).mockReturnValue(system);
  jest.mocked(usePreferences).mockReturnValue({
    preferences: { ...defaultPreferences, theme },
  } as ReturnType<typeof usePreferences>);
  expect(useTheme()).toBe(expected);
});

test.each([
  ['light', nepaliLightTheme],
  ['dark', nepaliDarkTheme],
] as const)('%s appearance preserves Nepali typography', (theme, expected) => {
  jest.mocked(useColorScheme).mockReturnValue(null);
  jest.mocked(usePreferences).mockReturnValue({
    preferences: { ...defaultPreferences, language: 'ne', theme },
  } as ReturnType<typeof usePreferences>);
  expect(useTheme()).toBe(expected);
});
