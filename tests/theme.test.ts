import { expect, test } from '@jest/globals';
import { lightColors, darkColors, playerPalette } from '../src/theme';
function luminance(hex: string) {
  const rgb = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(text: string, surface: string) {
  const a = luminance(text);
  const b = luminance(surface);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
test.each([lightColors, darkColors])(
  'text and scores meet 4.5:1 across all UI surfaces',
  (colors) => {
    for (const text of [
      colors.text,
      colors.mutedText,
      colors.scoreGain,
      colors.scoreLoss,
      colors.ink,
    ]) {
      for (const surface of [
        colors.bg,
        colors.surface,
        colors.surfaceSunken,
        colors.goldTint,
        colors.gainTint,
        colors.lossTint,
      ])
        expect(contrast(text, surface)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(colors.onInk, colors.ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.onLoss, colors.loss)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.goldText, colors.goldTint)).toBeGreaterThanOrEqual(
      4.5,
    );
  },
);
test.each(playerPalette)(
  'player initials meet 4.5:1 on both tints: $color',
  (swatch) => {
    expect(contrast(swatch.lightText, swatch.lightTint)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(swatch.darkText, swatch.darkTint)).toBeGreaterThanOrEqual(
      4.5,
    );
  },
);
