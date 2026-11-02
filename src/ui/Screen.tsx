import {
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import {
  KeyboardAvoidingView as AndroidKeyboardAvoidingView,
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type AppTheme } from '../theme';
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
  const [footerHeight, setFooterHeight] = useState(0);
  // Storage initialization also renders Screen before a navigator exists.
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const scrollStyle = [styles.content, compact && styles.compact];
  const scrollView =
    Platform.OS === 'android' ? (
      <KeyboardAwareScrollView
        contentContainerStyle={scrollStyle}
        keyboardShouldPersistTaps="handled"
        bottomOffset={footerHeight}
      >
        {children}
      </KeyboardAwareScrollView>
    ) : (
      <ScrollView
        contentContainerStyle={scrollStyle}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  const content = (
    <>
      {scrollView}
      {footer && (
        <View
          style={styles.footer}
          onLayout={({ nativeEvent }) =>
            setFooterHeight(nativeEvent.layout.height)
          }
        >
          {footer}
        </View>
      )}
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
        <AndroidKeyboardAvoidingView
          style={styles.fill}
          behavior="padding"
          automaticOffset
        >
          {content}
        </AndroidKeyboardAvoidingView>
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
    compact: {
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: theme.spacing.xl,
    },
    footer: {
      backgroundColor: c.surface,
      ...theme.shadows.raised,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.md,
      flexDirection: 'row',
      width: '100%',
      maxWidth: 640,
      alignSelf: 'center',
    },
    title: {
      fontFamily: theme.fonts.title,
      fontSize: theme.type.h1,
      lineHeight: 36,
      letterSpacing: -0.6,
      color: c.text,
    },
    subtitle: {
      fontFamily: theme.fonts.bold,
      fontSize: theme.type.h2,
      color: c.text,
    },
    body: {
      fontFamily: theme.fonts.body,
      fontSize: theme.type.body,
      lineHeight: 25,
      color: c.mutedText,
    },
    label: { fontFamily: theme.fonts.semibold, fontSize: 14, color: c.text },
    eyebrow: {
      fontFamily: theme.fonts.bold,
      fontSize: 11,

      color: c.mutedText,
    },
    button: {
      backgroundColor: c.ink,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.button,
      minHeight: theme.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: c.onInk,
      fontFamily: theme.fonts.semibold,
      fontSize: 14,
      textAlign: 'center',
    },
    input: {
      backgroundColor: c.surface,
      borderColor: c.hairline,
      borderWidth: 1,
      borderRadius: theme.radius.input,
      padding: theme.spacing.md,
      minHeight: theme.touchTarget,
      fontFamily: theme.fonts.medium,
      fontSize: 15,
      color: c.text,
    },
    error: {
      color: c.scoreLoss,
      fontFamily: theme.fonts.medium,
      fontSize: 14,
      lineHeight: 22,
    },
    card: {
      backgroundColor: c.surface,
      ...theme.shadows.card,
      borderRadius: theme.radius.card,
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    spread: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    divider: { height: 1, backgroundColor: c.hairline },
    flexible: { flex: 1, minWidth: 0 },
    caption: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      lineHeight: 18,
      color: c.mutedText,
      fontVariant: ['tabular-nums'],
    },
    ruledRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderColor: c.hairline,
    },
  });
}
export function useStyles() {
  const theme = useTheme();
  return useMemo(() => createStyles(theme), [theme]);
}
