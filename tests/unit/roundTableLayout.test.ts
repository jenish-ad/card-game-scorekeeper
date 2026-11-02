import { expect, test } from '@jest/globals';
import { roundTableLayout } from '@/features/marriage/components/roundTableLayout';
import { lightTheme } from '@/theme/tokens';
test('four rounds fit on a 360dp screen with fixed player names and totals', () => {
  const width = 360 - lightTheme.spacing.xl * 2;
  expect(roundTableLayout(width, 4, 1)).toEqual({
    nameWidth: 80,
    totalWidth: 56,
    roundWidth: 46,
    fits: true,
  });
});

test('many rounds scroll without shrinking their touch targets', () => {
  expect(roundTableLayout(320, 20, 1)).toEqual({
    nameWidth: 80,
    totalWidth: 56,
    roundWidth: 44,
    fits: false,
  });
});
test('larger text requires scrolling while a wider container can fit it', () => {
  expect(roundTableLayout(320, 5, 1.5).fits).toBe(false);
  expect(roundTableLayout(640, 5, 1.5).fits).toBe(true);
  expect(roundTableLayout(0, 5, 1).fits).toBe(false);
});
