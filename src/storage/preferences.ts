import type { MatchConnection } from './database';
import type { Numerals } from '../i18n/numbers';
export interface Preferences {
  language: 'en' | 'ne';
  numerals: Numerals;
  calendar: 'ad' | 'bs';
  keepAwake: boolean;
}
export const defaultPreferences: Preferences = {
  language: 'en',
  numerals: 'latin',
  calendar: 'ad',
  keepAwake: true,
};
export async function readPreferences(
  database: MatchConnection,
  language: 'en' | 'ne',
): Promise<Preferences> {
  const rows = await database.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM app_preferences',
  );
  const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    language:
      values.language === 'en' || values.language === 'ne'
        ? values.language
        : language,
    numerals: values.numerals === 'devanagari' ? 'devanagari' : 'latin',
    calendar: values.calendar === 'bs' ? 'bs' : 'ad',
    keepAwake: values.keepAwake !== '0',
  };
}
export async function writePreference<K extends keyof Preferences>(
  database: MatchConnection,
  key: K,
  value: Preferences[K],
) {
  await database.runAsync(
    'INSERT INTO app_preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    typeof value === 'boolean' ? (value ? '1' : '0') : value,
  );
}
