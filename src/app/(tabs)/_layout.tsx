import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '@/i18n';
import { Tabs, useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.ink,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          ...theme.shadows.card,
        },
        tabBarIconStyle: { width: 44, height: 28 },
        tabBarLabelStyle: { fontFamily: theme.fonts.medium, fontSize: 10 },
        tabBarItemStyle: { minHeight: theme.touchTarget, paddingTop: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('Home'),
          tabBarIcon: ({ focused }) => (
            <Icon
              name="home-outline"
              size={21}
              color={focused ? theme.colors.ink : theme.colors.mutedText}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('History'),
          tabBarIcon: ({ focused }) => (
            <Icon
              name="time-outline"
              size={21}
              color={focused ? theme.colors.ink : theme.colors.mutedText}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: t('New match'),
          tabBarButton: () => (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('New match')}
                onPress={() => router.push('/marriage/setup')}
                style={({ pressed }) => ({
                  marginTop: -20,
                  width: 60,
                  height: 60,
                  borderRadius: 25,
                  borderWidth: 5,
                  borderColor: theme.colors.bg,
                  backgroundColor: theme.colors.ink,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.8 : 1,
                  ...theme.shadows.card,
                })}
              >
                <Icon name="add" size={28} color={theme.colors.onInk} />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: t('Rules'),
          tabBarIcon: ({ focused }) => (
            <Icon
              name="book-outline"
              size={21}
              color={focused ? theme.colors.ink : theme.colors.mutedText}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('Settings'),
          tabBarIcon: ({ focused }) => (
            <Icon
              name="settings-outline"
              size={21}
              color={focused ? theme.colors.ink : theme.colors.mutedText}
            />
          ),
        }}
      />
    </Tabs>
  );
}
