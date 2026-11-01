import { expect, test } from '@jest/globals';
import { roundTableLayout } from '../src/ui/roundTableLayout';
import { lightTheme } from '../src/theme';
test('five players fit on a 360dp screen at default font scale', () => {
  const width = 360 - lightTheme.spacing.xl * 2;
  expect(roundTableLayout(width, 5, 1)).toEqual({
    roundWidth: 40,
    minimumPlayerWidth: 52,
    fits: true,
  });
});
test('larger text requires scrolling while a wider container can fit it', () => {
  expect(roundTableLayout(320, 5, 1.5).fits).toBe(false);
  expect(roundTableLayout(640, 5, 1.5).fits).toBe(true);
  expect(roundTableLayout(0, 5, 1).fits).toBe(false);
});
