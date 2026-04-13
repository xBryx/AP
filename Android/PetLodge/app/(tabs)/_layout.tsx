import { Tabs } from "expo-router";
import { View } from "react-native";
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

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

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
        tabBarActiveTintColor: "#37513f",
        tabBarInactiveTintColor: "#a0a0a0",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#e4e4e4",
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="plantilla"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: focused ? "#37513f" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ translateY: focused ? -6 : 0 }],
              }}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: "Reservas",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: focused ? "#37513f" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ translateY: focused ? -6 : 0 }],
              }}
            >
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                size={size}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mascotas"
        options={{
          title: "Mascotas",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: focused ? "#37513f" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ translateY: focused ? -6 : 0 }],
              }}
            >
              <Ionicons
                name={focused ? "paw" : "paw-outline"}
                size={size}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notificaciones"
        options={{
          title: "Notificaciones",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: focused ? "#37513f" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ translateY: focused ? -6 : 0 }],
              }}
            >
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                size={size}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
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
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: focused ? "#37513f" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ translateY: focused ? -6 : 0 }],
              }}
            >
              <Ionicons
                name={focused ? "person-circle" : "person-circle-outline"}
                size={size}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
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
