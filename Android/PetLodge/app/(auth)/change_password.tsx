import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getAuthErrorMessage } from "../../constants/AuthErrors";
import { useAuth } from "../../constants/AuthContext";
import { supabase } from "../../lib/supabase";

const isNotEmpty = (value: string): boolean => value.trim() !== "";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [actualPassword, setActualPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    if (!supabase) {
      Alert.alert("Error", "No se encontró configuración de Supabase.");
      return;
    }

    if (!user?.email) {
      Alert.alert("Error", "No se encontró una sesión activa.");
      return;
    }

    if (!isNotEmpty(actualPassword)) {
      Alert.alert("Error", "Debes ingresar tu contraseña actual.");
      return;
    }

    if (!isNotEmpty(newPassword)) {
      Alert.alert("Error", "Debes ingresar una nueva contraseña.");
      return;
    }

    if (!isNotEmpty(confirmPassword)) {
      Alert.alert("Error", "Debes confirmar tu nueva contraseña.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "La nueva contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "La confirmación no coincide con la nueva contraseña.");
      return;
    }

    if (actualPassword === newPassword) {
      Alert.alert("Error", "La nueva contraseña debe ser distinta a la actual.");
      return;
    }

    setLoading(true);

    // Reautenticación para comprobar que la contraseña actual es correcta.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: actualPassword,
    });

    if (reauthError) {
      setLoading(false);
      Alert.alert("Error", "La contraseña actual es incorrecta.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      Alert.alert("Error", getAuthErrorMessage(updateError));
      return;
    }

    setActualPassword("");
    setNewPassword("");
    setConfirmPassword("");
    Alert.alert("Éxito", "Tu contraseña se actualizó correctamente.", [
      { text: "Aceptar", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleContainer}>Cambiar contraseña</Text>
      <View style={styles.inputContainer}>
        <Entypo name="lock" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña Actual"
          value={actualPassword}
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setActualPassword}
        />
      </View>
      <View style={styles.inputContainer}>
        <Entypo name="lock" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          value={newPassword}
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setNewPassword}
        />
      </View>
      <View style={styles.inputContainer}>
        <Entypo name="lock" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setConfirmPassword}
        />
      </View>

      <Pressable style={styles.button} onPress={handleConfirmar} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.textButton}>Confirmar</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f3f3f3",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#676767",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    padding: 20,
  },
  titleContainer: {
    color: "#37513f",
    flexDirection: "row",
    textAlign: "center",
    fontSize: 30,
    gap: 8,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4A3717",
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  text: {
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 15,
  },
  textButton: {
    color: "#ffffff",
    fontSize: 20,
  },
  textLink: {
    color: "#4e6e58",
    marginBottom: 10,
    fontSize: 15,
    textAlign: "center",
  },
});
