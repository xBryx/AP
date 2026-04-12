import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { getAuthErrorMessage } from "../../constants/AuthErrors";
import { supabase } from "../../lib/supabase";

const noNulos = (texto: string): boolean => {
  return texto.trim() !== "";
};

const esEmailValido = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function HomeScreen() {
  const [nombre, setnombre] = useState("");
  const [apellido, setapellido] = useState("");
  const [cedula, setcedula] = useState("");
  const [email, setemail] = useState("");
  const [telefono, settelefono] = useState("");
  const [direccion, setdireccion] = useState("");
  const [password, setpassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleConfirmar = async () => {
    if (!noNulos(nombre)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se permiten nulos en nombre",
      });
      return;
    } else if (!noNulos(apellido)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se permiten nulos en apellido",
      });
      return;
    } else if (!noNulos(cedula)) {
      Toast.show({ type: "error", text1: "Error", text2: "Cédula inválida" });
      return;
    } else if (!noNulos(email)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se permiten nulos en email",
      });
      return;
    } else if (!noNulos(password)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se permiten nulos en contraseña",
      });
      return;
    } else if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Contraseña débil",
        text2: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    } else if (!esEmailValido(email)) {
      Toast.show({
        type: "error",
        text1: "Email Inválido",
        text2: "El formato del correo o email no es válido",
      });
      return;
    } else if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Las contraseñas no coinciden",
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: `${nombre.trim()} ${apellido.trim()}`,
          identification: cedula.trim(),
          phone: telefono.trim(),
          address: direccion.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      Toast.show({
        type: "error",
        text1: "Error al registrar",
        text2: getAuthErrorMessage(error),
      });
      return;
    }

    if (data.session) {
      // Auto confirmación en dev (redirige automáticamente por el AuthContext onAuthStateChange)
      router.replace("/(tabs)");
    } else if (data.user) {
      // Esperando confirmación por email
      Toast.show({
        type: "success",
        text1: "Registro exitoso",
        text2: "Revisá tu correo para confirmar tu cuenta.",
      });
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 2000);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.titleContainer}>Registrate</Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#676767"
            style={styles.icon}
          />
          <TextInput
            style={styles.inputInner}
            placeholder="Nombre"
            placeholderTextColor="#676767"
            value={nombre}
            onChangeText={(text) => setnombre(text.replace(/[^a-zA-Z\s]/g, ""))}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#676767"
            style={styles.icon}
          />
          <TextInput
            style={styles.inputInner}
            placeholder="Apellidos"
            placeholderTextColor="#676767"
            value={apellido}
            onChangeText={(text) =>
              setapellido(text.replace(/[^a-zA-Z\s]/g, ""))
            }
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="id-card-outline"
            size={20}
            color="#676767"
            style={styles.icon}
          />
          <TextInput
            style={styles.inputInner}
            placeholder="Cédula"
            placeholderTextColor="#676767"
            value={cedula}
            keyboardType="numeric"
            onChangeText={(text) => setcedula(text.replace(/[^0-9]/g, ""))}
          />
        </View>

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
            onChangeText={setemail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="call-outline"
            size={20}
            color="#676767"
            style={styles.icon}
          />
          <TextInput
            style={styles.inputInner}
            placeholder="Teléfono"
            placeholderTextColor="#676767"
            value={telefono}
            keyboardType="numeric"
            onChangeText={(text) => settelefono(text.replace(/[^0-9]/g, ""))}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#676767"
            style={styles.icon}
          />
          <TextInput
            style={styles.inputInner}
            placeholder="Dirección"
            placeholderTextColor="#676767"
            value={direccion}
            onChangeText={(text) =>
              setdireccion(text.replace(/[^a-zA-Z0-9\s]/g, ""))
            }
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
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={setpassword}
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
            secureTextEntry={!showConfirmPassword}
            onChangeText={setconfirmPassword}
          />
          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
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
          <Text style={styles.textButton}>
            {loading ? "Cargando..." : "Confirmar"}
          </Text>
        </Pressable>

        <View style={styles.loginContainer}>
          <Text style={styles.text}>¿Ya tienes cuenta? </Text>
          <Link href={"/(auth)/login"} asChild>
            <Pressable>
              <Text style={styles.textLink}>Iniciar Sesión</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#ffffff",
    paddingTop: 80,
    paddingBottom: 40,
  },
  titleContainer: {
    color: "#263f2d",
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "left",
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
  button: {
    backgroundColor: "#4A3717",
    padding: 18,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 40,
  },
  textButton: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginContainer: {
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
