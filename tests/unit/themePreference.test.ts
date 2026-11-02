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

test.each([
  ['light', 'en', 'latin', lightTheme],
  ['light', 'en', 'devanagari', lightTheme],
  ['dark', 'en', 'latin', darkTheme],
  ['dark', 'en', 'devanagari', darkTheme],
  ['light', 'ne', 'latin', nepaliLightTheme],
  ['light', 'ne', 'devanagari', nepaliLightTheme],
  ['dark', 'ne', 'latin', nepaliDarkTheme],
  ['dark', 'ne', 'devanagari', nepaliDarkTheme],
] as const)(
  '%s theme and %s typography stay unchanged with %s numerals',
  (theme, language, numerals, expected) => {
    jest.mocked(useColorScheme).mockReturnValue(null);
    jest.mocked(usePreferences).mockReturnValue({
      preferences: { ...defaultPreferences, theme, language, numerals },
    } as ReturnType<typeof usePreferences>);
    expect(useTheme()).toBe(expected);
  },
);
