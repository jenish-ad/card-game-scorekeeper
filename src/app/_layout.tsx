import { t } from '../i18n';
import { useEffect, type PropsWithChildren } from 'react';
import { deactivateKeepAwake, ExpoKeepAwakeTag } from 'expo-keep-awake';
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
import { PreferencesProvider } from '../storage/PreferencesProvider';
import { MatchStorageProvider } from '../storage/MatchStorageProvider';
import { RoundDraftProvider } from '../features/marriage/RoundDraftProvider';
import { Mukta_400Regular } from '@expo-google-fonts/mukta/400Regular';
import { Mukta_600SemiBold } from '@expo-google-fonts/mukta/600SemiBold';
import { Mukta_700Bold } from '@expo-google-fonts/mukta/700Bold';
import { useTheme } from '../useTheme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AndroidKeyboardProvider>
        <MatchStorageProvider>
          <PreferencesProvider>
            <AppLayout />
          </PreferencesProvider>
        </MatchStorageProvider>
      </AndroidKeyboardProvider>
    </SafeAreaProvider>
  );
}
function AppLayout() {
  const theme = useTheme();
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Mukta_400Regular,
    Mukta_600SemiBold,
    Mukta_700Bold,
  });
  useEffect(() => {
    // Expo's development wrapper takes a global wake lock when this module is
    // installed. Remove that tag after fonts load so the app preference also
    // works in development; screen hooks own separate, unique tags.
    if (__DEV__ && loaded)
      void deactivateKeepAwake(ExpoKeepAwakeTag).catch(() => {});
  }, [loaded]);
  if (!loaded && !error)
    return (
      <View style={[local.fill, { backgroundColor: theme.colors.bg }]}>
        <ActivityIndicator
          accessibilityLabel={t('Loading')}
          color={theme.colors.primary}
        />
      </View>
    );
  return (
    <View style={[local.fill, { backgroundColor: theme.colors.bg }]}>
      <StatusBar style="auto" />
      {error && (
        <Text style={{ color: theme.colors.text }}>
          {t('Could not load fonts; restart the app.')}
        </Text>
      )}

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
            headerBackTitle: t('Back'),
            contentStyle: { backgroundColor: theme.colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="marriage/setup"
            options={{ title: t('New match') }}
          />
          <Stack.Screen
            name="marriage/match/[id]"
            options={{ title: t('Scoreboard') }}
          />
          <Stack.Screen
            name="marriage/round/[id]"
            options={{ title: t('Add round') }}
          />
          <Stack.Screen
            name="marriage/preview/[id]"
            options={{ title: t('Round details') }}
          />
          <Stack.Screen
            name="marriage/settle/[id]"
            options={{ title: t('Settle up') }}
          />
        </Stack>
      </RoundDraftProvider>
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
