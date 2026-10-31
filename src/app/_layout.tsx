import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MatchStorageProvider } from '../storage/MatchStorageProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <MatchStorageProvider>
        <Stack
          screenOptions={{
            headerTintColor: '#174c3c',
            contentStyle: { backgroundColor: '#f5f7f3' },
          }}
        >
          <Stack.Screen
            name="index"
            options={{ title: 'Card Game Scorekeeper' }}
          />
          <Stack.Screen
            name="marriage/setup"
            options={{ title: 'Set up Marriage' }}
          />
          <Stack.Screen name="history" options={{ title: 'Saved matches' }} />
          <Stack.Screen
            name="marriage/match/[id]"
            options={{ title: 'Marriage scoreboard' }}
          />
        </Stack>
      </MatchStorageProvider>
    </SafeAreaProvider>
  );
}
