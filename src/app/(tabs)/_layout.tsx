import { Tabs } from 'expo-router';
import { useTheme } from '../../useTheme';
import { Icon } from '../../ui/Icon';

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: { fontFamily: theme.fonts.bold, fontSize: 11 },
        tabBarItemStyle: {
          minHeight: theme.touchTarget,
          paddingTop: theme.spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? 'albums' : 'albums-outline'}
              size={22}
              color={focused ? theme.colors.primary : theme.colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? 'time' : 'time-outline'}
              size={22}
              color={focused ? theme.colors.primary : theme.colors.textMuted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: 'Rules',
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? 'book' : 'book-outline'}
              size={22}
              color={focused ? theme.colors.primary : theme.colors.textMuted}
            />
          ),
        }}
      />
    </Tabs>
  );
}
