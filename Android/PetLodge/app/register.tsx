import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { View, Text, TextInput, Pressable } from "react-native";
import { Alert } from "react-native";
import { useState } from "react";

//Navegación
import { router } from "expo-router";
import { Link } from "expo-router";

const noNulos = (texto: string): boolean => {
  return texto.trim() !== "";
};

const soloLetras = (texto: string, nombreCampo: string): boolean => {
  if (/^[A-Za-z]*$/.test(texto)) {
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
  if (/^[A-Za-z0-9]*$/.test(texto)) {
    return true;
  } else {
    Alert.alert(
      "Error",
      "No se permiten caracteres especiales en " + nombreCampo
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

  const handleConfirmar = () => {
    if (!noNulos(nombre)) {
      Alert.alert("Error", "No se permiten nulos en nombre");
      return;
    } else if (!noNulos(apellido)) {
      Alert.alert("Error", "No se permiten nulos en apellido");
      return;
    } else if (!noNulos(cedula.toString())) {
      Alert.alert("Error", "cedula");
      return;
    } else if (!noNulos(email)) {
      Alert.alert("Error", "No se permiten nulos en email");
      return;
    } else if (!noNulos(telefono.toString())) {
      Alert.alert("Error", "No se permiten nulos en teléfono");
      return;
    } else if (!noNulos(direccion)) {
      Alert.alert("Error", "No se permiten nulos en dirección");
      return;
    } else if (!noNulos(password)) {
      Alert.alert("Error", "No se permiten nulos en contraseña");
      return;
    } else if (!noNulos(confirmPassword)) {
      Alert.alert("Error", "No se permiten nulos en contraseña");
      return;
    }
    console.log("entro");
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

      <Pressable style={styles.button} onPress={handleConfirmar}>
        <Text style={styles.textButton}>Confirmar</Text>
      </Pressable>

      <Text style={styles.text}>¿Ya tienes cuenta?</Text>

      <Link href={"/login"}>
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
