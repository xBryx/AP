import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { getAuthErrorMessage } from "../../constants/AuthErrors";

import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (authError) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Error de sesión",
        text2: getAuthErrorMessage(authError),
      });
      return;
    }

    if (authData.user) {
      // Verificar si el rol es 'Customer'
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("role_id, role(name)")
        .eq("auth_id", authData.user.id)
        .single();

      setLoading(false);

      if (
        profileError ||
        !profile ||
        (profile.role && (profile.role as any).name !== "Customer")
      ) {
        await supabase.auth.signOut();
        Toast.show({
          type: "error",
          text1: "Acceso denegado",
          text2: "Solo los clientes pueden ingresar a esta aplicación.",
        });
        return;
      }

      router.replace("/(tabs)");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleContainer}>Bienvenido de{"\n"}nuevo</Text>

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

      <View style={styles.inputWrapper}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#676767"
          style={styles.icon}
        />
        <TextInput
          style={styles.inputInner}
          placeholder="Contraseña"
          placeholderTextColor="#676767"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#676767"
          />
        </Pressable>
      </View>

      <Link href={"/(auth)/forget_password"} asChild>
        <Pressable style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>¿Olvidó su contraseña?</Text>
        </Pressable>
      </Link>

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.textButton}>
          {loading ? "Iniciando..." : "Iniciar Sesión"}
        </Text>
      </Pressable>

      <View style={styles.registerContainer}>
        <Text style={styles.text}>¿No tienes cuenta aún? </Text>
        <Link href={"/(auth)/register"} asChild>
          <Pressable>
            <Text style={styles.textLink}>Registrate aquí</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 56,
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  inputInner: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 40,
  },
  forgotPasswordText: {
    color: "#4e6e58",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#4A3717",
    padding: 18,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 40,
  },
  textButton: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#676767",
    fontSize: 15,
  },
  textLink: {
    color: "#4e6e58",
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
