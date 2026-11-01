import type { PropsWithChildren } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  Platform,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { MatchStorageProvider } from '../storage/MatchStorageProvider';
import { RoundDraftProvider } from '../features/marriage/RoundDraftProvider';
import { useTheme } from '../useTheme';

export default function RootLayout() {
  const theme = useTheme();
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });
  if (!loaded && !error)
    return (
      <View style={[local.fill, { backgroundColor: theme.colors.bg }]}>
        <ActivityIndicator
          accessibilityLabel="Loading"
          color={theme.colors.primary}
        />
      </View>
    );
  return (
    <View style={[local.fill, { backgroundColor: theme.colors.bg }]}>
      <SafeAreaProvider>
        <AndroidKeyboardProvider>
          <StatusBar style="auto" />
          {error && (
            <Text style={{ color: theme.colors.text }}>
              Could not load fonts; restart the app.
            </Text>
          )}
          <MatchStorageProvider>
            <RoundDraftProvider>
              <Stack
                screenOptions={{
                  headerTintColor: theme.colors.primary,
                  headerStyle: { backgroundColor: theme.colors.bg },
                  headerShadowVisible: false,
                  headerTitleAlign: Platform.OS === 'ios' ? 'center' : 'left',
                  headerTitleStyle: {
                    fontFamily: theme.fonts.bold,
                    fontSize: 14,
                  },
                  headerBackTitle: 'Back',
                  contentStyle: { backgroundColor: theme.colors.bg },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="marriage/setup"
                  options={{ title: 'New match' }}
                />
                <Stack.Screen
                  name="marriage/match/[id]"
                  options={{ title: 'Scoreboard' }}
                />
                <Stack.Screen
                  name="marriage/round/[id]"
                  options={{ title: 'Add round' }}
                />
                <Stack.Screen
                  name="marriage/preview/[id]"
                  options={{ title: 'Round details' }}
                />
                <Stack.Screen
                  name="marriage/settle/[id]"
                  options={{ title: 'Settle up' }}
                />
              </Stack>
            </RoundDraftProvider>
          </MatchStorageProvider>
        </AndroidKeyboardProvider>
      </SafeAreaProvider>
    </View>
  );
}

const local = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'center' },
});

function AndroidKeyboardProvider({ children }: PropsWithChildren) {
  if (Platform.OS === 'android')
    return <KeyboardProvider>{children}</KeyboardProvider>;
  return <>{children}</>;
}
