import { Tabs } from 'expo-router';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSegments } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../../constants/AuthContext';
import { supabase } from '../../lib/supabase';
//Para iconos de la hotbar
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const segments = useSegments();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const refreshUnreadNotifications = useCallback(async () => {
    if (!supabase || !user?.id) {
      setHasUnreadNotifications(false);
      return;
    }

    const { count, error } = await supabase
      .from('notification')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error consultando notificaciones no leidas:', error);
      return;
    }

    setHasUnreadNotifications((count ?? 0) > 0);
  }, [user?.id]);

  useEffect(() => {
    refreshUnreadNotifications();
  }, [refreshUnreadNotifications, segments]);

  const isInNotificationsTab = segments.includes('notificaciones');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>   
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mascotas"
        options={{
          title: 'Mascotas',
           tabBarIcon: ({ color, size }) => (
             <MaterialIcons name="pets" size={size} color={color} />
           )  
        }}
      />
      <Tabs.Screen
        name="notificaciones"
        options={{
          title: 'Notificaciones',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={size} color={color} />
              {hasUnreadNotifications && !isInNotificationsTab ? (
                <View style={styles.notificationDot} />
              ) : null}
            </View>
          ),
        }}        
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    right: -3,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
});
