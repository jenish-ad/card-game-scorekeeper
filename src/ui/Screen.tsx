import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

const c = theme.colors;
export function Screen({
  children,
  footer,
  topSafeArea = false,
}: PropsWithChildren<{ footer?: ReactNode; topSafeArea?: boolean }>) {
  return (
    <SafeAreaView
      style={styles.fill}
      edges={
        topSafeArea
          ? ['top', 'bottom', 'left', 'right']
          : ['bottom', 'left', 'right']
      }
    >
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer && <View style={styles.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: c.bg },
  content: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingBottom: theme.spacing.xxl,
  },
  footer: {
    backgroundColor: c.bg,
    borderTopWidth: 1,
    borderColor: c.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    flexDirection: 'row',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  title: { fontFamily: theme.fonts.title, fontSize: 30, color: c.text },
  subtitle: { fontFamily: theme.fonts.title, fontSize: 22, color: c.text },
  body: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: c.textMuted,
  },
  label: { fontFamily: theme.fonts.bold, fontSize: 14, color: c.text },
  eyebrow: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: c.textMuted,
    textTransform: 'uppercase',
  },
  button: {
    backgroundColor: c.primary,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.button,
    minHeight: theme.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: c.surface,
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    backgroundColor: c.surface,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: theme.radius.button,
    padding: theme.spacing.md,
    minHeight: theme.touchTarget,
    fontFamily: theme.fonts.medium,
    fontSize: 15,
    color: c.text,
  },
  error: {
    color: c.loss,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  spread: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  divider: { height: 1, backgroundColor: c.border },
});
