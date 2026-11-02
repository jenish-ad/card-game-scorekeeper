import { adToBs } from './bikramSambat';
import { currentPreferences, t } from './index';
import type { TranslationKey } from './en';
import { formatNumber } from './numbers';
import type { Preferences } from '../storage/preferences';

export function formatDate(
  date: Date,
  preferences: Readonly<Preferences> = currentPreferences(),
): string {
  if (preferences.calendar === 'bs') {
    try {
      const bs = adToBs(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      );
      const month = t(
        `bsMonth${bs.month}` as TranslationKey,
        {},
        preferences.language,
      );
      return `${month} ${formatNumber(bs.day, preferences.numerals)}, ${formatNumber(bs.year, preferences.numerals)}${preferences.language === 'en' ? ' BS' : ''}`;
    } catch {
      // Dates outside the embedded table remain readable in AD.
    }
  }
  const text =
    preferences.language === 'ne'
      ? `${t(`adMonth${date.getMonth() + 1}` as TranslationKey, {}, preferences.language)} ${date.getDate()}, ${date.getFullYear()} ${t('AD', {}, preferences.language)}`
      : date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
  return formatNumber(text, preferences.numerals);
}
