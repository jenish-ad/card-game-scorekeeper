import { en } from '../i18n/en';
import { ne } from '../i18n/ne';
import { adToBs } from '../i18n/bikramSambat';
import { formatNumber } from '../i18n/numbers';

// Reproduce historical generated titles without consulting mutable app preferences.
export function legacyAutoTitles(createdAt: string): Set<string> {
  const date = new Date(createdAt);
  if (!Number.isFinite(date.getTime())) return new Set();
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const titles = [
    date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    `${date.toLocaleDateString('en-GB', { weekday: 'short' })}, ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
    `${ne[`adMonth${month}` as keyof typeof ne]} ${day}, ${year} ${ne.AD}`,
  ];
  try {
    const bs = adToBs(year, month, day);
    titles.push(
      `${en[`bsMonth${bs.month}` as keyof typeof en]} ${bs.day}, ${bs.year} BS`,
      `${ne[`bsMonth${bs.month}` as keyof typeof ne]} ${bs.day}, ${bs.year}`,
    );
  } catch {
    /* Old dates outside the BS table only had AD titles. */
  }
  return new Set(
    titles.flatMap((title) => [
      formatNumber(title, 'latin'),
      formatNumber(title, 'devanagari'),
    ]),
  );
}
