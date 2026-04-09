import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../constants/AuthContext";

export default function HomeScreen() {
  const { logout } = useAuth(); //Cerrar sesión
  return (
    <View style={styles.container}>
      <Text>Hola</Text>

      <Pressable onPress={logout}>
        <Text>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
