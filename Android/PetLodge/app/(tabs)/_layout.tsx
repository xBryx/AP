import { Tabs } from "expo-router";
import { View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
