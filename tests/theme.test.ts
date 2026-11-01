import { expect, test } from '@jest/globals';
import { lightColors, darkColors } from '../src/theme';
function luminance(hex: string) {
  const rgb = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return (
    (rgb[0] ?? 0) * 0.2126 + (rgb[1] ?? 0) * 0.7152 + (rgb[2] ?? 0) * 0.0722
  );
}
test.each([lightColors, darkColors])(
  'text and signed scores meet 4.5:1 contrast on their surfaces',
  (colors) => {
    for (const text of [
      colors.text,
      colors.textMuted,
      colors.gain,
      colors.loss,
      colors.zero,
      colors.primary,
    ])
      for (const surface of [
        colors.bg,
        colors.surface,
        colors.surfaceAlt,
        colors.primaryTint,
      ]) {
        const values = [luminance(text), luminance(surface)].sort(
          (a, b) => b - a,
        );
        expect(
          ((values[0] ?? 0) + 0.05) / ((values[1] ?? 0) + 0.05),
        ).toBeGreaterThanOrEqual(4.5);
      }
    expect(
      (Math.max(luminance(colors.onPrimary), luminance(colors.primary)) +
        0.05) /
        (Math.min(luminance(colors.onPrimary), luminance(colors.primary)) +
          0.05),
    ).toBeGreaterThanOrEqual(4.5);
  },
);
