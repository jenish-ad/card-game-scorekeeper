import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTheme } from '../useTheme';
import { devanagariFonts } from '../theme';
import { Icon, type IconName } from './Icon';
import { useStyles } from './Screen';
import { feedback } from './feedback';
import { useReducedMotion } from './useReducedMotion';
import { PlayerAvatar } from './PlayerAvatar';
import { ScoreText } from './ScoreText';
export { formatScore, scoreLabel } from './ScoreText';
export function Button({
  label,
  onPress,
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
  const reduced = useReducedMotion();
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
            /[\u0900-\u097f]/.test(label) && {
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
// Compatibility wrappers for existing read-only detail views.
export function Avatar({
  name,
  size = 36,
  seat = 1,
}: {
  name: string;
  size?: 24 | 28 | 36 | 44;
  seat?: number;
}) {
  return <PlayerAvatar name={name} size={size} seat={seat} />;
}
export function Score({
  value,
  compact = false,
}: {
  value: number;
  compact?: boolean;
}) {
  return <ScoreText value={value} size={compact ? 'sm' : 'lg'} />;
}
export function SectionHeading({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.spread}>
      <Text style={styles.label}>{title}</Text>
      {detail && <Text style={styles.caption}>{detail}</Text>}
    </View>
  );
}
