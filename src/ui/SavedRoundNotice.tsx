import { t } from '../i18n';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Text } from 'react-native';
import { useTheme } from '../useTheme';
import { Icon } from './Icon';
import { useStyles } from './Screen';

export function SavedRoundNotice({
  round,
  onDismiss,
}: {
  round: string;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const styles = useStyles();
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    let cancelled = false;
    let animation: Animated.CompositeAnimation | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      animation = Animated.sequence([
        Animated.delay(2200),
        Animated.timing(opacity, {
          toValue: 0,
          duration: reduceMotion ? 0 : theme.motion.enter,
          useNativeDriver: true,
        }),
      ]);
      animation.start(({ finished }) => {
        if (finished && !cancelled) onDismiss();
      });
    });
    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [opacity, onDismiss, theme.motion.enter]);
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.primaryTint,
          borderRadius: theme.radius.button,
          padding: theme.spacing.lg,
          opacity,
        },
      ]}
    >
      <Icon name="checkmark-circle" />
      <Text style={[styles.label, styles.flexible]}>
        {t('Round {p0}', { p0: Number(round) })} {t('saved. Scores updated.')}
      </Text>
    </Animated.View>
  );
}
