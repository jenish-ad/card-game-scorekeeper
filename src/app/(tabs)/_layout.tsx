import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '@/i18n';
import { Tabs } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.ink,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.hairline,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarIconStyle: { width: 48, height: 32 },
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
          title: t('Home'),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                borderRadius: 999,
                width: 48,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? theme.colors.ink : 'transparent',
              }}
            >
              <Icon
                name={focused ? 'albums' : 'albums-outline'}
                size={22}
                color={focused ? theme.colors.onInk : theme.colors.mutedText}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('History'),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                borderRadius: 999,
                width: 48,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? theme.colors.ink : 'transparent',
              }}
            >
              <Icon
                name={focused ? 'time' : 'time-outline'}
                size={22}
                color={focused ? theme.colors.onInk : theme.colors.mutedText}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: t('Rules'),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                borderRadius: 999,
                width: 48,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? theme.colors.ink : 'transparent',
              }}
            >
              <Icon
                name={focused ? 'book' : 'book-outline'}
                size={22}
                color={focused ? theme.colors.onInk : theme.colors.mutedText}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
