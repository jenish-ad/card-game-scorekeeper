import { afterEach, expect, test } from '@jest/globals';
import { AppError, errorMessages } from '../src/errors';
import { configureI18n, t, translateError } from '../src/i18n';
import { en } from '../src/i18n/en';
import { ne } from '../src/i18n/ne';
import { defaultPreferences } from '../src/storage/preferences';
import { playerInitials } from '../src/ui/playerText';
import { parseSetupSettings } from '../src/features/marriage/setupSettings';
import { parseSettings } from '../src/features/marriage/scoring';
import { validatePlayerNames } from '../src/features/marriage/playerNames';

afterEach(() => configureI18n(defaultPreferences));

test.each(['latin', 'devanagari'] as const)(
  '[1] literal hyphens survive numeral formatting (%s)',
  (numerals) => {
    const key =
      'Enter a whole-number maal total for every player, including 0.';
    configureI18n({ ...defaultPreferences, numerals });
    expect(t(key)).toContain('whole-number');
    expect(t(key)).not.toContain('−');
    expect(t(key, {}, 'ne')).not.toContain('−');
    expect(t('Round {p0}', { p0: -3 })).toBe(
      numerals === 'latin' ? 'Round −3' : 'Round −३',
    );
    // Player names are string params, not numeric literals or numeric params.
    expect(t('{p0} maal', { p0: 'Ram-2' })).toBe('Ram-2 maal');
  },
);

test('[2] initials preserve surrogate pairs and leave names intact', () => {
  const name = '😀 सीता';
  expect(playerInitials(name)).toBe('😀स');
  expect(playerInitials('𠮷 Ram')).toBe('𠮷R');
  expect(playerInitials('')).toBe('');
  expect(name).toBe('😀 सीता');
});

test('[3] meaningful error messages reach UI; non-Error failures use a fallback', () => {
  expect(translateError(new Error('Disk full'), 'Could not save match.')).toBe(
    'Disk full',
  );
  expect(translateError(null, 'Could not save match.')).toBe(
    'Could not save match.',
  );
  configureI18n({ ...defaultPreferences, language: 'ne' });
  expect(translateError(new AppError('ROSTER_MINIMUM'))).toBe(
    ne.ROSTER_MINIMUM.replace('२', '2'),
  );
});

test('[7] setup normalizes every fee and a decimal money rate before validation', () => {
  const settings = parseSetupSettings(
    { seenFee: '१०', unseenFee: '१०', dubleeExtra: '१०', foulPenalty: '१०' },
    'perPlayer',
    true,
    '२.५',
  );
  expect(settings).toMatchObject({
    seenFee: 10,
    unseenFee: 10,
    dubleeExtra: 10,
    foulPenalty: 10,
    moneyRate: 2.5,
  });
  expect(() =>
    parseSetupSettings(
      { seenFee: '१.५', unseenFee: '१०', dubleeExtra: '५', foulPenalty: '१०' },
      'perPlayer',
      true,
      '२.५',
    ),
  ).toThrow(AppError);
});

test('[8] all typed error codes have both translations and English log messages', () => {
  // Indexing by every ErrorCode also checks dictionary coverage at compile time.
  for (const code of Object.keys(
    errorMessages,
  ) as (keyof typeof errorMessages)[]) {
    expect(en[code]).toBe(errorMessages[code]);
    expect(ne[code]).toEqual(expect.any(String));
    expect(ne[code].length).toBeGreaterThan(0);
  }
  configureI18n({
    ...defaultPreferences,
    language: 'ne',
    numerals: 'devanagari',
  });
  const error = new AppError('PLAYER_DEPARTED', { name: 'Ram' });
  expect(error.message).toBe('Ram left this match. Use Rejoin instead.');
  expect(translateError(error)).toContain('Ram');
  expect(translateError(error)).not.toBe(error.message);
  expect(() => parseSettings({})).toThrow(AppError);
  const validation = validatePlayerNames(['Ram', ' ram ']);
  expect(validation.ok).toBe(false);
  if (!validation.ok) {
    expect(validation.error).toBeInstanceOf(AppError);
    expect(validation.message).toBe(en.PLAYER_NAME_DUPLICATE);
    expect(translateError(validation.error)).toBe(ne.PLAYER_NAME_DUPLICATE);
  }
});
