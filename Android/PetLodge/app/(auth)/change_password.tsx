import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";


import { useState } from "react";

import Entypo from "@expo/vector-icons/Entypo";

//Navegación

const numerosYletras = (texto: string, nombreCampo: string): boolean => {
  if (/^[A-Za-z0-9]*$/.test(texto)) {
    return true;
  } else {
    Alert.alert(
      "Error",
      "No se permiten caracteres especiales en " + nombreCampo,
    );
    return false;
  }
};
const noNulos = (texto: string): boolean => {
  return texto.trim() !== "";
};
export default function HomeScreen() {
  const [actualPassword, setactualPassword] = useState("");
  const [newPassword, setnewPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const handleConfirmar = () => {
    if (!noNulos(actualPassword)) {
      Alert.alert("Error", "No se permiten nulos en la contraseña actual");
      return;
    } else if (!noNulos(newPassword)) {
      Alert.alert("Error", "No se permiten nulos en la nueva contraseña");
      return;
    } else if (!noNulos(confirmPassword)) {
      Alert.alert("Error", "No se permiten nulos en confirmar contraseña");
      return;
    }
    console.log("entro");
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
          onChangeText={(text) => {
            if (numerosYletras(text, "contraseña actual"))
              setactualPassword(text);
          }}
        />
      </View>
      <View style={styles.inputContainer}>
        <Entypo name="lock" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          value={newPassword}
          secureTextEntry
          onChangeText={(text) => {
            if (numerosYletras(text, "nueva contraseña")) {
              setnewPassword(text);
            }
          }}
        />
      </View>
      <View style={styles.inputContainer}>
        <Entypo name="lock" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          secureTextEntry
          onChangeText={(text) => {
            if (numerosYletras(text, "confirmar contraseña")) {
              setconfirmPassword(text);
            }
          }}
        />
      </View>

      <Pressable style={styles.button} onPress={handleConfirmar}>
        <Text style={styles.textButton}>Confirmar</Text>
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
