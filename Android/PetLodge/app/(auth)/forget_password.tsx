import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
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

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (!supabase) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se encontro configuracion de Supabase.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Email invalido",
        text2: "Ingresa un correo valido para continuar.",
      });
      return;
    }

    setLoading(true);

    const redirectTo = "petlodge://change_password";

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo },
    );

    setLoading(false);

    if (error) {
      Toast.show({
        type: "error",
        text1: "Error al enviar correo",
        text2: getAuthErrorMessage(error),
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Correo enviado",
      text2: "Revisa tu bandeja y abre el enlace desde este dispositivo.",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleContainer}>Recuperar{"\n"}contraseña</Text>

      <View style={styles.inputWrapper}>
        <Ionicons
          name="mail-outline"
          size={20}
          color="#676767"
          style={styles.icon}
        />
        <TextInput
          style={styles.inputInner}
          placeholder="Email"
          placeholderTextColor="#676767"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <Text style={styles.helpText}>
        Te enviaremos un correo para restablecer tu contraseña.
      </Text>

      <Pressable
        style={styles.button}
        onPress={handleSendReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.textButton}>Enviar enlace</Text>
        )}
      </Pressable>

      <Link href="/(auth)/login" asChild>
        <Pressable style={styles.backLinkContainer}>
          <Text style={styles.backLink}>Volver a inicio de sesion</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 12,
    height: 56,
  },
  button: {
    backgroundColor: "#4A3717",
    padding: 18,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 12,
  },
  inputInner: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  helpText: {
    color: "#676767",
    marginBottom: 20,
    fontSize: 14,
  },
  textButton: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  backLinkContainer: {
    marginTop: 18,
    alignSelf: "center",
  },
  backLink: {
    color: "#4e6e58",
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
