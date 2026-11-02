import { t, n } from '../i18n';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../useTheme';
import { devanagariFonts, type AppTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { useStyles } from './Screen';
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  destructive = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  icon?: IconName;
}) {
  const theme = useTheme();
  const styles = useStyles();
  const local = createStyles(theme);
  const color = destructive
    ? theme.colors.loss
    : secondary
      ? theme.colors.primary
      : theme.colors.onPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        local.button,
        secondary && local.secondary,
        { opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      {icon && <Icon name={icon} color={color} size={18} />}
      <Text
        style={[
          styles.buttonText,
          local.buttonText,
          { color },
          /[\u0900-\u097f]/.test(label) && { fontFamily: devanagariFonts.bold },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const theme = useTheme();
  const styles = useStyles();
  const local = createStyles(theme);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join('')
    .toUpperCase();
  return (
    <View
      accessible={false}
      style={[local.avatar, { width: size, height: size }]}
    >
      <Text style={[styles.label, { color: theme.colors.primary }]}>
        {initials}
      </Text>
    </View>
  );
}
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
export function Score({
  value,
  compact = false,
}: {
  value: number;
  compact?: boolean;
}) {
  const theme = useTheme();
  const local = createStyles(theme);
  const color =
    value > 0
      ? theme.colors.gain
      : value < 0
        ? theme.colors.loss
        : theme.colors.zero;
  return (
    <View
      accessible
      style={local.score}
      accessibilityLabel={`${formatScore(value)}, ${scoreLabel(value)}`}
    >
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[local.number, compact && local.compact, { color }]}
      >
        {formatScore(value)}
      </Text>
    </View>
  );
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
function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    button: {
      flexGrow: 1,
      flexShrink: 1,
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    buttonText: { flexShrink: 1 },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    avatar: {
      borderRadius: theme.radius.button,
      backgroundColor: theme.colors.avatar,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    score: { alignItems: 'flex-end', flexShrink: 0 },
    number: {
      fontFamily: theme.fonts.bold,
      fontSize: 24,
      fontVariant: ['tabular-nums'],
    },
    compact: { fontSize: 15 },
  });
}
