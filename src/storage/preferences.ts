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

export interface PreferenceState {
  preferences: Preferences;
  ready: boolean;
  readError: unknown | null;
  preferenceError: unknown | null;
}
export class PreferenceStore {
  private state: PreferenceState;
  private listeners = new Set<() => void>();
  private queue = Promise.resolve();
  constructor(
    private database: MatchConnection,
    private language: 'en' | 'ne',
    private configure: (preferences: Preferences) => void,
  ) {
    this.state = {
      preferences: { ...defaultPreferences, language },
      ready: false,
      readError: null,
      preferenceError: null,
    };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(next: PreferenceState) {
    this.state = next;
    this.listeners.forEach((listener) => listener());
  }
  async load() {
    this.publish({ ...this.state, readError: null });
    try {
      const preferences = await readPreferences(this.database, this.language);
      this.configure(preferences);
      this.publish({ ...this.state, preferences, ready: true });
    } catch (readError) {
      this.publish({ ...this.state, readError });
    }
  }
  clearPreferenceError = () => {
    this.publish({ ...this.state, preferenceError: null });
  };
  update = async <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ): Promise<void> => {
    const work = this.queue
      .catch(() => {})
      .then(async () => {
        try {
          await writePreference(this.database, key, value);
          const preferences = { ...this.state.preferences, [key]: value };
          this.configure(preferences);
          this.publish({ ...this.state, preferences, preferenceError: null });
        } catch (preferenceError) {
          this.publish({ ...this.state, preferenceError });
          throw preferenceError;
        }
      });
    this.queue = work;
    await work;
  };
}
