import type { PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from '../theme';
import { styles } from './Screen';

export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { flexGrow: 1, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        secondary && {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && { color: theme.colors.primary },
          destructive && { color: theme.colors.loss },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Chip({
  children,
  gold = false,
}: PropsWithChildren<{ gold?: boolean }>) {
  return (
    <View
      style={{
        backgroundColor: gold
          ? theme.colors.goldLight
          : theme.colors.primaryTint,
        borderRadius: theme.radius.chip,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={[styles.label, { fontSize: 10, color: theme.colors.primary }]}
      >
        {children}
      </Text>
    </View>
  );
}
export function Avatar({ name, seat = 0 }: { name: string; seat?: number }) {
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: theme.radius.chip,
        backgroundColor:
          seat === 0 ? theme.colors.primary : theme.colors.goldLight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={[
          styles.label,
          { color: seat === 0 ? theme.colors.surface : theme.colors.primary },
        ]}
      >
        {name.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}
export function formatScore(value: number) {
  return value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : '0';
}
export function scoreLabel(value: number) {
  return value > 0
    ? `Gains ${value}`
    : value < 0
      ? `Pays ${Math.abs(value)}`
      : 'No change';
}
export function Score({
  value,
  compact = false,
}: {
  value: number;
  compact?: boolean;
}) {
  const color =
    value > 0
      ? theme.colors.gain
      : value < 0
        ? theme.colors.loss
        : theme.colors.zero;
  return (
    <View
      accessible
      style={{ alignItems: 'flex-end', gap: theme.spacing.xs }}
      accessibilityLabel={`${formatScore(value)}, ${scoreLabel(value)}`}
    >
      <Text
        style={{
          fontFamily: theme.fonts.bold,
          fontSize: compact ? 14 : 22,
          color,
          fontVariant: ['tabular-nums'],
        }}
      >
        {formatScore(value)}
      </Text>
      <Text style={{ fontFamily: theme.fonts.medium, fontSize: 10, color }}>
        {scoreLabel(value)}
      </Text>
    </View>
  );
}
export function PresetCard() {
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.primaryTint }]}>
      <Text style={styles.eyebrow}>Scoring preset</Text>
      <View style={styles.spread}>
        <Text style={styles.label}>♧ Pagat base v1</Text>
        <Chip gold>Rules</Chip>
      </View>
      <Text style={styles.body}>Points · Normal finish · Seen maal only</Text>
    </View>
  );
}
