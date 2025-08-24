import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/common/HapticTab';
import { Colors } from '@/constants/Colors';
import { useLanguage } from '@/contexts/LanguageContext';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/ui/IconSymbol';
import TabBarBackground from '@/ui/TabBarBackground';

function TabLayoutContent() {
  const colorScheme = useColorScheme();
  const { isTabBarVisible } = useNavigation();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: isTabBarVisible ? Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }) : { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.chat'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: t('nav.mood'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="explore"
        options={{
          title: t('nav.explore'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <NavigationProvider>
      <TabLayoutContent />
    </NavigationProvider>
  );
}
