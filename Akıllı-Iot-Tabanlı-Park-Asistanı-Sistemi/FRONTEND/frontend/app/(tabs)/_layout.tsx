import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Ionicons from '@expo/vector-icons/Ionicons';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// nameIOS ve nameAndroid tiplerini string olarak bıraktım
// Eğer IconSymbol ve Ionicons için kesin tipler varsa oraya uyarlamak gerekebilir.
interface TabIconProps {
  nameIOS: string;
  nameAndroid: string;
  color: string;
  size?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ nameIOS, nameAndroid, color, size = 28 }) => {
  if (Platform.OS === 'ios') {
    // Burada as any ile tipi zorla
    return <IconSymbol name={nameIOS as any} color={color} size={size} />;
  } else {
    // Ionicons için de as any yapabiliriz
    return <Ionicons name={nameAndroid as any} color={color} size={size} />;
  }
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'rgba(106, 27, 154, 0.95)',
            borderTopColor: 'transparent',
            height: 70,
          },
          default: {
            backgroundColor: '#6A1B9A',
            borderTopColor: '#4A148C',
            height: 70,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anasayfa',
          tabBarIcon: ({ color, size }) => (
            <TabIcon nameIOS="house.fill" nameAndroid="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <TabIcon nameIOS="person.fill" nameAndroid="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
