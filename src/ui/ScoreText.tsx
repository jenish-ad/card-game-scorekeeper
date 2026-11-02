import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { t, n } from '../i18n';
import { useTheme } from '../useTheme';
import { useReducedMotion } from './useReducedMotion';
export function formatScore(value: number) {
  return n(value > 0 ? `+${value}` : value);
}
export function scoreLabel(value: number) {
  return value > 0
    ? t('Gains {p0}', { p0: value })
    : value < 0
      ? t('Pays {p0}', { p0: Math.abs(value) })
      : t('No change');
}
export function ScoreText({
  value,
  size = 'md',
  neutral = false,
  label,
}: {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  neutral?: boolean;
  label?: string;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const progress = useSharedValue(value);
  const [display, setDisplay] = useState(value);
  const first = useRef(true);
  useAnimatedReaction(
    () => Math.round(progress.get()),
    (next, previous) => {
      if (next !== previous) runOnJS(setDisplay)(next);
    },
  );
  useEffect(() => {
    cancelAnimation(progress);
    if (reduced) {
      progress.set(value);
    } else {
      if (first.current) {
        progress.set(0);
        first.current = false;
      }
      progress.set(
        withTiming(value, { duration: 400, easing: Easing.out(Easing.cubic) }),
      );
    }
    return () => cancelAnimation(progress);
  }, [value, reduced, progress]);
  return (
    <Text
      accessibilityLabel={
        label ?? `${formatScore(value)}, ${scoreLabel(value)}`
      }
      style={{
        fontFamily: theme.fonts.heavy,
        fontVariant: ['tabular-nums'],
        fontSize: { sm: 14, md: 20, lg: 26, xl: 34 }[size],
        color: neutral
          ? theme.colors.ink
          : value > 0
            ? theme.colors.scoreGain
            : value < 0
              ? theme.colors.scoreLoss
              : theme.colors.mutedText,
      }}
    >
      {label ?? formatScore(reduced ? value : display)}
    </Text>
  );
}
