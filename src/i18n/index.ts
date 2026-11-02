import { AppError } from '../errors';
import { en, type TranslationKey } from './en';
import { ne } from './ne';
import { formatNumber, formatDigits } from './numbers';
import { defaultPreferences, type Preferences } from '../storage/preferences';

let current: Preferences = { ...defaultPreferences };
export function configureI18n(preferences: Preferences) {
  current = { ...preferences };
}
export function currentPreferences(): Readonly<Preferences> {
  return current;
}
export function n(value: number | string): string {
  return formatNumber(value, current.numerals);
}
export function t(
  key: TranslationKey,
  params: Record<string, string | number | undefined> = {},
  language: 'en' | 'ne' = current.language,
): string {
  const dictionary = language === 'ne' ? ne : en;
  const pluralKey = `${key}_${params.count === 1 ? 'one' : 'other'}`;
  const template =
    params.count !== undefined && pluralKey in dictionary
      ? dictionary[pluralKey as TranslationKey]
      : dictionary[key];
  return template.replace(
    /\{(\w+)\}|([^{}]+)/g,
    (
      placeholder: string,
      name: string | undefined,
      literal: string | undefined,
    ) => {
      if (literal !== undefined) return formatDigits(literal, current.numerals);
      if (name === undefined) return placeholder;
      const value = params[name];
      return value === undefined
        ? placeholder
        : typeof value === 'number'
          ? n(value)
          : value;
    },
  );
}

export function translateError(
  error: unknown,
  fallback: TranslationKey = 'Check the round inputs.',
): string {
  if (error instanceof AppError) return t(error.code, error.params);
  return error instanceof Error ? error.message : t(fallback);
}
