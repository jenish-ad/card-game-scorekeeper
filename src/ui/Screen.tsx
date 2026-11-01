import { useContext, type PropsWithChildren, type ReactNode } from 'react';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightTheme, darkTheme, type AppTheme } from '../theme';
import { useTheme } from '../useTheme';

export function Screen({
  children,
  footer,
  topSafeArea = false,
  compact = false,
}: PropsWithChildren<{
  footer?: ReactNode;
  topSafeArea?: boolean;
  compact?: boolean;
}>) {
  const styles = useStyles();
  // Storage initialization also renders Screen before a navigator exists.
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const content = (
    <>
      <ScrollView
        contentContainerStyle={[styles.content, compact && styles.compact]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </>
  );
  return (
    <SafeAreaView
      style={styles.fill}
      edges={
        topSafeArea
          ? ['top', 'bottom', 'left', 'right']
          : ['bottom', 'left', 'right']
      }
    >
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.fill}
          behavior="padding"
          keyboardVerticalOffset={headerHeight}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.fill}>{content}</View>
      )}
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  const c = theme.colors;
  return StyleSheet.create({
    fill: { flex: 1, backgroundColor: c.bg },
    content: {
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
      width: '100%',
      maxWidth: 640,
      alignSelf: 'center',
      paddingBottom: theme.spacing.xxl,
    },
    compact: { gap: 10, padding: 12 },
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
    title: {
      fontFamily: theme.fonts.title,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.8,
      color: c.text,
    },
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

      color: c.textMuted,
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
      color: c.onPrimary,
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
    flexible: { flex: 1, minWidth: 0 },
    caption: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      lineHeight: 18,
      color: c.textMuted,
      fontVariant: ['tabular-nums'],
    },
    ruledRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderColor: c.border,
    },
  });
}
const lightStyles = createStyles(lightTheme);
const darkStyles = createStyles(darkTheme);
export function useStyles() {
  return useTheme() === darkTheme ? darkStyles : lightStyles;
}
