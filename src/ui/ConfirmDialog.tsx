import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type ComponentRef,
} from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  findNodeHandle,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { t, translateError } from '../i18n';
import { devanagariFonts } from '../theme';
import { useTheme } from '../useTheme';
import { useStyles } from './Screen';

export type ConfirmOptions = {
  title: string;
  body?: string;
  confirmLabel: string;
  destructive?: boolean;
  /** Runs inside the dialog so failures can be retried before resolving. */
  action?: () => Promise<void>;
};
type Request = ConfirmOptions & { resolve: (result: boolean) => void };
const ConfirmContext = createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null
>(null);

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm requires ConfirmProvider');
  return confirm;
}

export function ConfirmProvider({ children }: PropsWithChildren) {
  const [request, setRequest] = useState<Request | null>(null);
  const pending = useRef<Request | null>(null);
  const confirm = useCallback((options: ConfirmOptions) => {
    // Keep an existing dialog and its promise intact if another caller fires.
    if (pending.current) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      const next = { ...options, resolve };
      pending.current = next;
      setRequest(next);
    });
  }, []);
  useEffect(
    () => () => {
      pending.current?.resolve(false);
      pending.current = null;
    },
    [],
  );
  function close(result: boolean) {
    pending.current?.resolve(result);
    pending.current = null;
    setRequest(null);
  }
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && <ConfirmDialog {...request} onClose={close} />}
    </ConfirmContext.Provider>
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  destructive = false,
  action,
  onClose,
}: ConfirmOptions & { onClose: (result: boolean) => void }) {
  const theme = useTheme();
  const styles = useStyles();
  const titleRef = useRef<ComponentRef<typeof Text>>(null);
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const labelStyle = (label: string) => [
    styles.buttonText,
    /[\u0900-\u097f]/.test(label) && { fontFamily: devanagariFonts.bold },
  ];
  function cancel() {
    if (!running.current) onClose(false);
  }
  async function submit() {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      await action?.();
      onClose(true);
    } catch (failure) {
      setError(translateError(failure));
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={cancel}
      onShow={() => {
        const target = findNodeHandle(titleRef.current);
        if (target) AccessibilityInfo.setAccessibilityFocus(target);
      }}
    >
      <View style={local.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={cancel}
          accessible={false}
        />
        <View
          accessibilityViewIsModal
          onAccessibilityEscape={cancel}
          style={[
            local.card,
            {
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.xl,
              gap: theme.spacing.lg,
            },
          ]}
        >
          <ScrollView contentContainerStyle={{ gap: theme.spacing.lg }}>
            <Text
              ref={titleRef}
              accessible
              accessibilityRole="header"
              style={[
                styles.subtitle,
                /[\u0900-\u097f]/.test(title) && {
                  fontFamily: devanagariFonts.title,
                },
              ]}
            >
              {title}
            </Text>
            {body && <Text style={styles.body}>{body}</Text>}
            {error && (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.error}
              >
                {error}
              </Text>
            )}
          </ScrollView>
          <View style={[local.actions, { gap: theme.spacing.sm }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={cancel}
              style={[
                styles.button,
                local.button,
                {
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  opacity: busy ? 0.4 : 1,
                },
              ]}
            >
              <Text
                style={[
                  labelStyle(t('Cancel')),
                  { color: theme.colors.primary },
                ]}
              >
                {t('Cancel')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={() => void submit()}
              style={[
                styles.button,
                local.button,
                {
                  backgroundColor: destructive
                    ? theme.colors.danger
                    : theme.colors.primary,
                  opacity: busy ? 0.6 : 1,
                },
              ]}
            >
              {busy && <ActivityIndicator color={theme.colors.onPrimary} />}
              <Text style={labelStyle(confirmLabel)}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const local = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: { borderRadius: 12, maxWidth: 340, width: '85%', maxHeight: '85%' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  button: { flexShrink: 1, flexDirection: 'row', gap: 8 },
});
