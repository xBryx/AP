import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { useAuth } from "../../constants/AuthContext";
import { getAuthErrorMessage } from "../../constants/AuthErrors";
import { supabase } from "../../lib/supabase";

const isNotEmpty = (value: string): boolean => value.trim() !== "";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [actualPassword, setActualPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
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

    if (!user?.email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se encontro una sesion activa.",
      });
      return;
    }

    if (!isNotEmpty(actualPassword)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Debes ingresar tu contrasena actual.",
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

    if (actualPassword === newPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "La nueva contrasena debe ser distinta a la actual.",
      });
      return;
    }

    setLoading(true);

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: actualPassword,
    });

    if (reauthError) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "La contrasena actual es incorrecta.",
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

    setActualPassword("");
    setNewPassword("");
    setConfirmPassword("");
    Toast.show({
      type: "success",
      text1: "Exito",
      text2: "Tu contrasena se actualizo correctamente.",
    });
    router.replace("/(tabs)/perfil");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Cambiar contraseña</Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#676767"
            style={styles.icon}
          />
          <TextInput
            style={styles.inputInner}
            placeholder="Contraseña Actual"
            placeholderTextColor="#676767"
            value={actualPassword}
            secureTextEntry={!showCurrent}
            autoCapitalize="none"
            onChangeText={setActualPassword}
          />
          <Pressable
            onPress={() => setShowCurrent((prev) => !prev)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showCurrent ? "eye-outline" : "eye-off-outline"}
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
            placeholder="Confirmar nueva contraseña"
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

        <Pressable
          style={styles.button}
          onPress={handleConfirmar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Confirmar</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  title: {
    color: "#37513f",
    fontSize: 50,
    fontWeight: "bold",
    lineHeight: 56,
    marginBottom: 38,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#d2d2d2",
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 12,
    height: 58,
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    padding: 8,
  },
  inputInner: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4A3717",
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 34,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "600",
    lineHeight: 40,
  },
});
