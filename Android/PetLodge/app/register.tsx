import { StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Link, router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

const noNulos = (texto: string): boolean => {
  return texto.trim() !== "";
};

const soloLetras = (texto: string, nombreCampo: string): boolean => {
  if (/^[A-Za-z\s]*$/.test(texto)) {
    return true;
  } else {
    Alert.alert("Error", "Solo se permiten letras en " + nombreCampo);
    return false;
  }
};
const soloNumeros = (numero: string, nombreCampo: string): boolean => {
  if (/^[0-9]*$/.test(numero)) {
    return true;
  } else {
    Alert.alert("Error", "Solo se permiten números en " + nombreCampo);
    return false;
  }
};
const numerosYletras = (texto: string, nombreCampo: string): boolean => {
  if (/^[A-Za-z0-9\s]*$/.test(texto)) {
    return true;
  } else {
    Alert.alert(
      "Error",
      "No se permiten caracteres especiales en " + nombreCampo,
    );
    return false;
  }
};

export default function HomeScreen() {
  const [nombre, setnombre] = useState("");
  const [apellido, setapellido] = useState("");
  const [cedula, setcedula] = useState<number>(0);
  const [email, setemail] = useState("");
  const [telefono, settelefono] = useState<number>(0);
  const [direccion, setdireccion] = useState("");
  const [password, setpassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleConfirmar = async () => {
    if (!noNulos(nombre)) {
      Alert.alert("Error", "No se permiten nulos en nombre");
      return;
    } else if (!noNulos(apellido)) {
      Alert.alert("Error", "No se permiten nulos en apellido");
      return;
    } else if (!noNulos(cedula.toString()) || cedula === 0) {
      Alert.alert("Error", "Cédula inválida");
      return;
    } else if (!noNulos(email)) {
      Alert.alert("Error", "No se permiten nulos en email");
      return;
    } else if (!noNulos(password)) {
      Alert.alert("Error", "No se permiten nulos en contraseña");
      return;
    } else if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: `${nombre.trim()} ${apellido.trim()}`,
          identification: cedula.toString().trim(),
          phone: telefono.toString().trim(),
          address: direccion.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      // Manejar errores de PostgreSQL/triggers o errores GoTrue
      const msg = error.message || "";
      const code = (error as any).error_code || "";

      if (code === "weak_password") {
        Alert.alert("Error", "La contraseña es muy débil.");
      } else if (code === "email_address_invalid") {
        Alert.alert("Error", "El correo electrónico no es válido.");
      } else if (msg.includes("AUTH_FULLNAME_REQUIRED")) {
        Alert.alert("Error", "El nombre completo es requerido por el sistema.");
      } else if (msg.includes("AUTH_IDENTIFICATION_REQUIRED")) {
        Alert.alert("Error", "La cédula es requerida por el sistema.");
      } else if (msg.includes("AUTH_IDENTIFICATION_DUPLICATE")) {
        Alert.alert("Error", "Ya existe un usuario con esta cédula.");
      } else if (msg.includes("AUTH_ROLE_NOT_FOUND")) {
        Alert.alert("Error", "Rol de usuario no encontrado en el sistema.");
      } else {
        Alert.alert("Error al registrar", msg);
      }
      return;
    }

    if (data.session) {
      // Auto confirmación en dev (redirige automáticamente por el AuthContext onAuthStateChange)
      router.replace("/(tabs)");
    } else if (data.user) {
      // Esperando confirmación por email
      Alert.alert(
        "Registro exitoso",
        "Revisá tu correo para confirmar tu cuenta.",
        [{ text: "OK", onPress: () => router.replace("/login") }],
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleContainer}>Registrate</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={(text) => {
          if (soloLetras(text, "nombre")) {
            setnombre(text);
          }
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={apellido}
        onChangeText={(text) => {
          if (soloLetras(text, "apellido")) {
            setapellido(text);
          }
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Cédula"
        value={cedula.toString()}
        keyboardType="numeric"
        onChangeText={(text) => {
          if (soloNumeros(text, "cédula")) {
            setcedula(Number(text));
          }
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setemail}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono.toString()}
        keyboardType="numeric"
        onChangeText={(text) => {
          if (soloNumeros(text, "teléfono")) {
            settelefono(Number(text));
          }
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={(text) => {
          if (numerosYletras(text, "dirección")) {
            setdireccion(text);
          }
        }}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Contraseña"
        value={password}
        onChangeText={setpassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        secureTextEntry
        onChangeText={setconfirmPassword}
      />

      <Pressable
        style={styles.button}
        onPress={handleConfirmar}
        disabled={loading}
      >
        <Text style={styles.textButton}>
          {loading ? "Cargando..." : "Confirmar"}
        </Text>
      </Pressable>

      <Text style={styles.text}>¿Ya tienes cuenta?</Text>

      <Link href={"/(auth)/login"}>
        <Text style={styles.textLink}>Iniciar Sesión</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
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
  input: {
    borderWidth: 1,
    borderColor: "#A8A8A9",
    backgroundColor: "#f3f3f3",
    color: "#676767",
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
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
    marginBottom: 10,
    fontSize: 20,
  },
  textLink: {
    color: "#4e6e58",
    marginBottom: 10,
    fontSize: 15,
    textAlign: "center",
  },
});
