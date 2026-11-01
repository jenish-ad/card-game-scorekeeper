import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { MatchStorageProvider } from '../storage/MatchStorageProvider';
import { RoundDraftProvider } from '../features/marriage/RoundDraftProvider';
import { theme } from '../theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {error && <Text>Could not load fonts. Using system fonts.</Text>}
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
                options={{ title: 'New Match' }}
              />
              <Stack.Screen
                name="marriage/match/[id]"
                options={{ title: 'Scoreboard' }}
              />
              <Stack.Screen
                name="marriage/round/[id]"
                options={{ title: 'Add Round' }}
              />
              <Stack.Screen
                name="marriage/preview/[id]"
                options={{ title: 'Preview Points' }}
              />
            </Stack>
          </RoundDraftProvider>
        </MatchStorageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
