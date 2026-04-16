import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

import { getAuthErrorMessage } from "../../constants/AuthErrors";
import { supabase } from "../../lib/supabase";

const isNotEmpty = (value: string): boolean => value.trim() !== "";

export default function ChangePasswordRecoveryScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    if (!supabase) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se encontro configuracion de Supabase.",
      });
      return;
    }

    if (!isNotEmpty(newPassword)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes ingresar una nueva contrasena.",
      });
      return;
    }

    if (!isNotEmpty(confirmPassword)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes confirmar tu nueva contrasena.",
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "La nueva contrasena debe tener minimo 6 caracteres.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "La confirmacion no coincide con la nueva contrasena.",
      });
      return;
    }

    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Enlace invalido",
        text2: "Abre de nuevo el enlace de recuperacion desde tu correo.",
      });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: getAuthErrorMessage(updateError),
      });
      return;
    }

    setNewPassword("");
    setConfirmPassword("");

    Toast.show({
      type: "success",
      text1: "Contrasena actualizada",
      text2: "Inicia sesion con tu nueva contrasena.",
    });

    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleContainer}>Nueva contraseña</Text>

      <View style={styles.inputWrapper}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#676767"
          style={styles.icon}
        />
        <TextInput
          style={styles.inputInner}
          placeholder="Nueva contraseña"
          placeholderTextColor="#676767"
          value={newPassword}
          secureTextEntry={!showNew}
          autoCapitalize="none"
          onChangeText={setNewPassword}
        />
        <Pressable
          onPress={() => setShowNew((prev) => !prev)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showNew ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#676767"
          />
        </Pressable>
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#676767"
          style={styles.icon}
        />
        <TextInput
          style={styles.inputInner}
          placeholder="Confirmar contraseña"
          placeholderTextColor="#676767"
          value={confirmPassword}
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          onChangeText={setConfirmPassword}
        />
        <Pressable
          onPress={() => setShowConfirm((prev) => !prev)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showConfirm ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#676767"
          />
        </Pressable>
      </View>

      <Text style={styles.helpText}>
        Este paso funciona solo si abriste el enlace desde el correo de
        recuperacion.
      </Text>

      <Pressable
        style={styles.button}
        onPress={handleConfirmar}
        disabled={loading}
      >
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
    height: 56,
  },
  inputInner: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  titleContainer: {
    color: "#263f2d",
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 40,
    lineHeight: 48,
  },
  button: {
    backgroundColor: "#4A3717",
    padding: 18,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 12,
  },
  eyeIcon: {
    padding: 10,
  },
  helpText: {
    color: "#676767",
    marginBottom: 8,
    fontSize: 14,
  },
  textButton: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
