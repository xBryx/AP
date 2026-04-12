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

import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";
//Para ejecutar código automático

export const unstable_settings = {
  anchor: "(tabs)",
};

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#4A3717",
        backgroundColor: "#f0f8f1",
        height: 80,
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: "bold",
        color: "#263f2d",
      }}
      text2Style={{
        fontSize: 14,
        color: "#4e6e58",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#263f2d",
        backgroundColor: "#fbf2f2",
        height: 80,
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: "bold",
        color: "#263f2d",
      }}
      text2Style={{
        fontSize: 14,
        color: "#4e6e58",
      }}
    />
  ),
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
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)/change_password" />
        </>
      ) : (
        //No está logeado
        <>
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(auth)/forget_password" />
          <Stack.Screen name="(auth)/change_password" />
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
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
