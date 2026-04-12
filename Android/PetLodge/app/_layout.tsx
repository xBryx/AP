import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
//Obtener datos de usuario (info de login)
import { AuthProvider, useAuth } from "../constants/AuthContext";
//Para ejecutar código automático

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {session ? ( //Existe el usuario (Login guardado)
        <Stack.Screen name="(tabs)" />
      ) : (
        //No está logeado
        <>
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forget_password" />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
