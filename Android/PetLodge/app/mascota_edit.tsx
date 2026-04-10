import { Platform, StyleSheet } from "react-native";
import { View, Text, Pressable, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Switch } from "react-native";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { ScrollView } from "react-native";

//Navegación
import { router } from 'expo-router';
import { Link } from 'expo-router';



export default function HomeScreen() {
    const especies = [
    { label: "Perro", value: "perro" },
    { label: "Gato", value: "gato" },
    { label: "Ave", value: "ave" },
    { label: "Conejo", value: "conejo" },
  ];
const [nombre, setNombre] = useState("");

  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");
  const [tamano, setTamano] = useState("mediano");
  const [vacunas, setVacunas] = useState(false);
  const [vetNombre, setVetNombre] = useState("");
  const [vetContacto, setVetContacto] = useState("");
  const [nota, setNota] = useState("");

  
  return (
    <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <Picker
            selectedValue={especies}
            onValueChange={(itemValue) => itemValue}
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
          <TextInput
            style={styles.input}
            placeholder="Raza"
            value={raza}
            onChangeText={setRaza}
          />
          <TextInput
            style={styles.input}
            placeholder="Edad"
            value={edad}
            onChangeText={setEdad}
          />
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
            <Text>Vacunas al día</Text>
            <Switch
              value={vacunas}
              onValueChange={setVacunas}
              trackColor={{ false: "#ccc", true: "#4CAF50" }}
              thumbColor={vacunas ? "#fff" : "#fff"}
            />
          </View>
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
          <TextInput
            style={styles.input}
            placeholder="Notas Adicionales"
            value={nota}
            onChangeText={setNota}
          />
        </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    color: '#37513f',
    flexDirection: 'row',
   textAlign: 'center',
   fontSize: 30,
    gap: 8,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#A8A8A9',
    backgroundColor: '#f3f3f3', 
    color: '#676767',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4A3717',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  text: {
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  textButton: {
    color: '#ffffff',
    marginBottom: 10,
    fontSize: 20,
  },
  textLink: {
    color: '#4e6e58',
    marginBottom: 10,
    fontSize: 15,
    textAlign: 'center'
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
    marginTop: 15,}
});

