import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
//Obtener datos de usuario (info de login)
import { AuthProvider } from "../constants/AuthContext";
import { useAuth } from '../constants/AuthContext';
//Para ejecutar código automático
import { useEffect } from "react";
import { router } from 'expo-router';

export const unstable_settings = {
  anchor: "(tabs)",
};


function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? ( //Existe el usuario (Login guardado)
        <Stack.Screen name="(tabs)" />
      ) : ( //No está logeado
        <Stack.Screen name='(auth)/login' />
      )}
    </Stack>
  );
}


export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}


