import { MotionContext } from '@/theme/MotionProvider';
import { useContext, useEffect, useRef } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { t, n } from '@/i18n';
import { useTheme } from '@/theme/useTheme';
import { useReducedMotion } from '@/theme/useReducedMotion';
import { usePreferences } from '@/storage/PreferencesContext';
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
  animate = false,
}: {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  neutral?: boolean;
  label?: string;
  animate?: boolean;
}) {
  const theme = useTheme();
  const { preferences } = usePreferences();
  const reduced = useReducedMotion();
  const { loaded } = useContext(MotionContext);
  const previous = useRef(value);
  const progress = useSharedValue(1);
  const motionStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + 0.4 * progress.get(),
    transform: [{ translateY: (1 - progress.get()) * 4 }],
  }));
  useEffect(() => {
    const changed = previous.current !== value;
    previous.current = value;
    cancelAnimation(progress);
    if (changed && animate && loaded && !reduced) {
      progress.set(0);
      progress.set(withTiming(1, { duration: 240 }));
    } else progress.set(1);
    return () => cancelAnimation(progress);
  }, [value, animate, loaded, reduced, progress]);
  return (
    <Animated.Text
      accessibilityLabel={
        label ?? `${formatScore(value)}, ${scoreLabel(value)}`
      }
      style={[
        motionStyle,
        {
          fontFamily: theme.fonts.heavy,
          fontVariant: ['tabular-nums'],
          fontSize:
            { sm: 14, md: 20, lg: 26, xl: 34 }[size] +
            (preferences.numerals === 'devanagari' ? 3 : 0),
          color: neutral
            ? theme.colors.ink
            : value > 0
              ? theme.colors.scoreGain
              : value < 0
                ? theme.colors.scoreLoss
                : theme.colors.mutedText,
        },
      ]}
    >
      {label ?? formatScore(value)}
    </Animated.Text>
  );
}
