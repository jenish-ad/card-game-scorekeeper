import { afterEach, expect, test } from '@jest/globals';
import { en } from '../src/i18n/en';
import { ne } from '../src/i18n/ne';
import { configureI18n, t } from '../src/i18n';
import { formatNumber, latinDigits } from '../src/i18n/numbers';
import { adToBs, bsMonthLengths } from '../src/i18n/bikramSambat';
import { formatDate } from '../src/i18n/dates';
import { defaultPreferences } from '../src/storage/preferences';
import { roundPreview } from '../src/features/marriage/roundPreview';
import { currentRuleVersion } from '../src/features/marriage/scoring';

afterEach(() => configureI18n(defaultPreferences));
test('dictionaries have identical keys and interpolate without changing player names', () => {
  expect(Object.keys(ne).sort()).toEqual(Object.keys(en).sort());
  configureI18n({
    ...defaultPreferences,
    language: 'ne',
    numerals: 'devanagari',
  });
  expect(t('Player {p0}', { p0: 3 })).toBe('खेलाडी ३');
  expect(t('{p0} maal', { p0: 'Ram 2' })).toBe('Ram 2 माल');
  expect(t('roundCount', { count: 1 }, 'en')).toBe('१ round');
  expect(t('roundCount', { count: 2 }, 'en')).toBe('२ rounds');
  expect(t('roundCount', { count: 2 })).toBe('२ राउन्ड');
});
test('numerals preserve signs, decimal amounts and Latin input parsing', () => {
  expect(formatNumber(-123.5, 'devanagari')).toBe('−१२३.५');
  expect(formatNumber('+42', 'devanagari')).toBe('+४२');
  expect(formatNumber(-2, 'latin')).toBe('−2');
  expect(latinDigits('१२3०')).toBe('1230');
  const result = roundPreview(
    [
      { playerId: 1, maal: '५', seen: true },
      { playerId: 2, maal: '०', seen: true },
    ],
    1,
    false,
    currentRuleVersion,
  );
  expect(result.ok).toBe(true);
  if (result.ok) expect(result.input.players[0]).toMatchObject({ maal: 5 });
});

// Independently checked against Hamro Patro's published year/month pages.
// Government corroboration and remaining official-calendar gaps: docs/CALENDAR.md.
test.each([
  [2075, 2018, 14],
  [2076, 2019, 14],
  [2077, 2020, 13],
  [2078, 2021, 14],
  [2079, 2022, 14],
  [2080, 2023, 14],
  [2081, 2024, 13],
  [2082, 2025, 14],
  [2083, 2026, 14],
  [2084, 2027, 14],
  [2085, 2028, 13],
])('Baisakh 1 %i is AD %i April %i', (bsYear, adYear, day) => {
  expect(adToBs(adYear, 4, day)).toEqual({ year: bsYear, month: 1, day: 1 });
});
test('mid-month, month-end, anchor and range boundaries', () => {
  expect(adToBs(2023, 4, 29)).toEqual({ year: 2080, month: 1, day: 16 });
  expect(adToBs(2023, 5, 14)).toEqual({ year: 2080, month: 1, day: 31 });
  expect(adToBs(2026, 11, 2)).toEqual({ year: 2083, month: 7, day: 16 });
  expect(adToBs(1943, 4, 14)).toEqual({ year: 2000, month: 1, day: 1 });
  expect(() => adToBs(1943, 4, 13)).toThrow();
  expect(() => adToBs(2050, 1, 1)).toThrow();
  expect(() => adToBs(2023, 2, 29)).toThrow();
  expect(bsMonthLengths).toHaveLength(101);
  expect(
    bsMonthLengths.every(
      (months) =>
        months.length === 12 &&
        months.every((days) => days >= 29 && days <= 32),
    ),
  ).toBe(true);
});
test('BS presentation follows language and numeral preferences', () => {
  const preferences = { ...defaultPreferences, calendar: 'bs' as const };
  const date = new Date(2026, 10, 2, 12);
  expect(formatDate(date, preferences)).toBe('Kartik 16, 2083 BS');
  expect(
    formatDate(date, {
      ...preferences,
      language: 'ne',
      numerals: 'devanagari',
    }),
  ).toBe('कार्तिक १६, २०८३');
});
