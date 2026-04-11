import { Platform, StyleSheet } from "react-native";
import { View, Text, Pressable, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Switch } from "react-native";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { ScrollView } from "react-native";

//Navegación
import { router } from "expo-router";
import { Link } from "expo-router";

export default function HomeScreen() {
  const especies = [
    { label: "Perro", value: "perro" },
    { label: "Gato", value: "gato" },
    { label: "Ave", value: "ave" },
    { label: "Conejo", value: "conejo" },
  ];
  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState("");
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");
  const [tamano, setTamano] = useState("mediano");
  const [vacunas, setVacunas] = useState(false);
  const [notaVacunas, setNotaVacunas] = useState("");
  const [condMedicas, setcondMedicas] = useState(false);
  const [notaCondMedicas, setNotasCondMedicas] = useState("");
  const [vetNombre, setVetNombre] = useState("");
  const [vetContacto, setVetContacto] = useState("");
  const [nota, setNota] = useState("");

    const handleEditMascota = () => {
    const nuevaMascota = {
      nombre,
      especie,
      raza,
      edad,
      vacunas,
      condicionesMedicas: "",
      veterinario: vetNombre,
      numeroVeterinario: vetContacto,
      notas: nota,
    };
  };

  return (
    <View style={styles.container}>
              {/* AÑADIR MASCOTAS */}
    
              {/* Nombre de mascota */}
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
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
                onChangeText={setRaza}
              />
              {/* Edad */}
              <TextInput
                style={styles.input}
                placeholder="Edad"
                value={edad}
                onChangeText={setEdad}
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
                  onChangeText={setNotaVacunas}
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
                  onChangeText={setNotasCondMedicas}
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
                onChangeText={setVetNombre}
              />
              <TextInput
                style={styles.input}
                placeholder="Contacto del veterinario"
                value={vetContacto}
                onChangeText={setVetContacto}
              />
              {/* Notas */}
              <TextInput
                style={styles.input}
                placeholder="Notas Adicionales"
                value={nota}
                onChangeText={setNota}
              />
              <Pressable style={styles.button} onPress={handleEditMascota}>
                <Text style={styles.textButton}>Guardar cambios</Text>
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
