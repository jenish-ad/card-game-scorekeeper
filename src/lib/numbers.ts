export function latinDigits(value: string): string {
  return value.replace(/[०-९]/g, (digit) =>
    String(digit.charCodeAt(0) - 0x966),
  );
}
