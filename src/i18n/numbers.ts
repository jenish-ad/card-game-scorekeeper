import { latinDigits } from '@/lib/numbers';
export { latinDigits } from '@/lib/numbers';
export type Numerals = 'latin' | 'devanagari';
export function formatNumber(
  value: number | string,
  numerals: Numerals,
): string {
  const text = String(value).replace(/-/g, '−');
  return formatDigits(text, numerals);
}
export function formatDigits(value: string, numerals: Numerals): string {
  const text = latinDigits(value);
  return numerals === 'devanagari'
    ? text.replace(/[0-9]/g, (digit) => '०१२३४५६७८९'[Number(digit)]!)
    : text;
}
