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

export function latinDigits(value: string): string {
  return value.replace(/[०-९]/g, (digit) =>
    String(digit.charCodeAt(0) - 0x966),
  );
}
