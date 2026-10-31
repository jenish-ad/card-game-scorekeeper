import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.fill} edges={['bottom', 'left', 'right']}>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    padding: 24,
    gap: 20,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#173c30' },
  body: { fontSize: 17, lineHeight: 26, color: '#33483f' },
  label: { fontSize: 17, fontWeight: '600', color: '#173c30' },
  button: {
    backgroundColor: '#174c3c',
    padding: 16,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#64776d',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    minHeight: 48,
    fontSize: 18,
    color: '#173c30',
  },
  error: { color: '#a12222', fontSize: 17, lineHeight: 25 },
});
