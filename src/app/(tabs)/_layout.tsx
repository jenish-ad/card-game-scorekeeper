import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { theme } from '../../theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.bg },
        headerShadowVisible: false,
        headerTitle: '',
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: { fontFamily: theme.fonts.medium, fontSize: 11 },
        tabBarItemStyle: { minHeight: theme.touchTarget },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>⌂</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>◷</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: 'Rules',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>▤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
