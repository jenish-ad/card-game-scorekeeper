import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { devanagariFonts } from '@/theme/tokens';
import { Icon, type IconName } from '@/ui/Icon';
import { useStyles } from '@/ui/Screen';
import { feedback } from '@/lib/feedback';
import { useMotionEnabled } from '@/theme/useReducedMotion';
export function Button({
  label,
  onPress,
  onLongPress,
  secondary = false,
  disabled = false,
  destructive = false,
  ghost = false,
  loading = false,
  iconOnly = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  ghost?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
  icon?: IconName;
}) {
  const theme = useTheme();
  const styles = useStyles();
  const reduced = !useMotionEnabled();
  const color = ghost
    ? destructive
      ? theme.colors.scoreLoss
      : theme.colors.ink
    : destructive
      ? theme.colors.onLoss
      : secondary
        ? theme.colors.ink
        : theme.colors.onInk;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onLongPress={onLongPress}
      onPress={() => {
        void feedback(destructive ? 'warning' : 'selection');
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        {
          flexGrow: iconOnly ? 0 : 1,
          minWidth: 44,
          paddingHorizontal: iconOnly ? 8 : theme.spacing.lg,
          flexShrink: 1,
          flexDirection: 'row',
          gap: theme.spacing.sm,
          backgroundColor: ghost
            ? 'transparent'
            : destructive
              ? theme.colors.loss
              : secondary
                ? theme.colors.surfaceSunken
                : theme.colors.ink,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !reduced ? 0.98 : 1 }],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : icon ? (
        <Icon name={icon} color={color} size={18} />
      ) : null}
      {!iconOnly && (
        <Text
          style={[
            styles.buttonText,
            { color, flexShrink: 1 },
            /[\u0900-\u0965\u0970-\u097f]/.test(label) && {
              fontFamily: devanagariFonts.semibold,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
