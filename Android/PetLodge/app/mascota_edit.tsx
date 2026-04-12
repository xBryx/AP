import { Platform, StyleSheet } from "react-native";
import { View, Text, Pressable, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Switch } from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { FlatList } from "react-native";
import { ScrollView } from "react-native";
import { Alert } from "react-native";
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
  const especies = [
    { label: "Perro", value: "perro" },
    { label: "Gato", value: "gato" },
    { label: "Ave", value: "ave" },
    { label: "Conejo", value: "conejo" },
  ];
 const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState("perro");
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState<number>(1);
  const [sexo, setSexo] = useState("macho");
  const [tamano, setTamano] = useState("mediano");
  const [vacunas, setVacunas] = useState(false);
  const [notaVacunas, setNotaVacunas] = useState("");
  const [condMedicas, setcondMedicas] = useState(false);
  const [notaCondMedicas, setNotasCondMedicas] = useState("");
  const [vetNombre, setVetNombre] = useState("");
  const [vetContacto, setVetContacto] = useState<number>(0);
  const [nota, setNota] = useState("");
  const [petImage, setPetImage] = useState("");

  const handleEditMascota = () => {
if (!noNulos(nombre)) {
      Alert.alert("Error", "No se permiten nulos en nombre");
      return;
    } else if (!noNulos(especie)) {
      Alert.alert("Error", "No se permiten nulos en apellido");
      return;
    } else if (!noNulos(raza)) {
      Alert.alert("Error", "cedula");
      return;
    } else if (!noNulos(edad.toString())) {
      Alert.alert("Error", "No se permiten nulos en teléfono");
      return;
    } else if (!noNulos(vetNombre)) {
      Alert.alert("Error", "No se permiten nulos en email");
      return;
    } else if (!noNulos(vetContacto.toString())) {
      Alert.alert("Error", "No se permiten nulos en teléfono");
      return;
    }
    const nuevaMascota = {
      nombre,
      especie,
      raza,
      edad,
      sexo,
      tamano,
      vacunas,
      notaVacunas,
      condMedicas,
      notaCondMedicas,
      vetNombre,
      vetContacto,
      nota,
      profileImage: petImage,
    };
  };

    const handlePickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
  
      if (!result.canceled) {
        setPetImage(result.assets[0].uri);
      }
    };

  return (
    <View style={styles.container}>
     {/* AÑADIR MASCOTAS */}
    
              {/*Foto de mascota*/}
              <Pressable onPress={handlePickImage} style={styles.button}>
                <Text style={styles.textButton}>Seleccionar imagen</Text>
              </Pressable>
    
              {/* Nombre de mascota */}
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={(text) => {
                  if (soloLetras(text, "nombre")) {
                    setNombre(text);
                  }
                }}
              />
              {/* Especie */}
              <Picker
                selectedValue={especie}
                onValueChange={(itemValue) => setEspecie(itemValue)}
              >
                <Picker.Item label="Seleccione especie" value="" />
    
                {especies.map((item) => (
                  <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </Picker>
              {/* Raza */}
              <TextInput
                style={styles.input}
                placeholder="Raza"
                value={raza}
                onChangeText={(text) => {
                  if (soloLetras(text, "raza")) {
                    setRaza(text);
                  }
                }}
              />
              {/* Edad */}
              <TextInput
                style={styles.input}
                placeholder="Edad"
                value={edad.toString()}
                onChangeText={(text) => {
                  if (soloNumeros(text, "edad")) {
                    setEdad(Number(text));
                  }
                }}
              />
              {/* Sexo */}
              <Picker
                selectedValue={sexo}
                onValueChange={(itemValue) => setSexo(itemValue)}
                style={styles.input}
              >
                <Picker.Item label="Sexo" value="hembra" />
                <Picker.Item label="Hembra" value="hembra" />
                <Picker.Item label="Macho" value="macho" />
              </Picker>
              <View style={styles.switchContainer}>
                {/* Vacunas */}
                <Text>Vacunas al día</Text>
                <Switch
                  value={vacunas}
                  onValueChange={setVacunas}
                  trackColor={{ false: "#ccc", true: "#4CAF50" }}
                  thumbColor={vacunas ? "#fff" : "#fff"}
                />
              </View>
    
              {/*Solo se muestra si tiene las vacunas activas*/}
              {vacunas && (
                <TextInput
                  style={styles.input}
                  placeholder="Especificar vacunas"
                  value={notaVacunas}
                  onChangeText={(text) => {
                  if (numerosYletras(text, "vacunas")) {
                    setNotaVacunas(text);
                  }
                }}
                />
              )}
              {/* Condiciones médicas */}
              <View style={styles.switchContainer}>
                <Text>Condiciones Médicas</Text>
                <Switch
                  value={condMedicas}
                  onValueChange={setcondMedicas}
                  trackColor={{ false: "#ccc", true: "#4CAF50" }}
                  thumbColor={condMedicas ? "#fff" : "#fff"}
                />
              </View>
    
              {/*Solo se muestra si tiene condiciones médicas*/}
              {condMedicas && (
                <TextInput
                  style={styles.input}
                  placeholder="Especificar condiciones médicas"
                  value={notaCondMedicas}
                  onChangeText={(text) => {
                  if (numerosYletras(text, "condiciones médicas")) {
                    setNotasCondMedicas(text);
                  }
                }}
                />
              )}
              {/* Tamaño */}
              <View style={styles.sizeContainer}>
                {["pequeño", "mediano", "grande"].map((size) => (
                  <Pressable
                    key={size}
                    style={[
                      styles.sizeButton,
                      tamano === size && styles.sizeButtonActive,
                    ]}
                    onPress={() => setTamano(size)}
                  >
                    <Text
                      style={
                        tamano === size ? styles.sizeTextActive : styles.sizeText
                      }
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {/* Info veterinario */}
              <TextInput
                style={styles.input}
                placeholder="Nombre del veterinario"
                value={vetNombre}
                onChangeText={(text) => {
                  if (soloLetras(text, "veterinario")) {
                    setVetNombre(text);
                  }
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="Contacto del veterinario"
                value={vetContacto.toString()}
                onChangeText={(text) => {
                  if (soloNumeros(text, "numero veterinario")) {
                    setVetContacto(Number(text));
                  }
                }}
              />
              {/* Notas */}
              <TextInput
                style={styles.input}
                placeholder="Notas Adicionales"
                value={nota}
                onChangeText={setNota}
              />
              <Pressable style={styles.button} onPress={handleEditMascota}>
                <Text style={styles.textButton}>Guardar mascota</Text>
              </Pressable>
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
  nombreMascota: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sizeContainer: {
    flexDirection: "row",
    backgroundColor: "#d9d9d9",
    borderRadius: 20,
    padding: 5,
    justifyContent: "space-between",
  },

  sizeButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
  },

  sizeButtonActive: {
    backgroundColor: "#ffffff",
  },

  sizeText: {
    color: "#333",
  },

  sizeTextActive: {
    fontWeight: "bold",
  },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
});
