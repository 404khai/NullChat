import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { COLORS } from '@/src/constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor: COLORS.secondary,
            borderTopColor: COLORS.border,
          },
          default: {
            backgroundColor: COLORS.secondary,
            borderTopColor: COLORS.border,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="chatbubbles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="identity"
        options={{
          title: 'Identity',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="finger-print" color={color} />,
        }}
      />
    </Tabs>
  );
}
