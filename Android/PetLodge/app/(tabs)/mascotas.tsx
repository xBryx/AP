import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { View, Text, Pressable, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Switch } from "react-native";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { ScrollView } from "react-native";
import { Background } from "@react-navigation/elements";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [mascotas, setMascotas] = useState([
    {
      id: 1,
      nombre: "Max",
      tipo: "Perro",
      raza: "Labrador",
      edad: "3 años",
      vacunas: true,
      condicionesMedicas: "Ninguna",
      veterinario: "Dr. Pérez",
      numeroVeterinario: "8888-8888",
      notas: "Muy juguetón",
    },
    {
      id: 2,
      nombre: "juan",
      tipo: "Perro",
      raza: "Labrador",
      edad: "3 años",
      vacunas: true,
      condicionesMedicas: "Ninguna",
      veterinario: "Dr. Pérez",
      numeroVeterinario: "8888-8888",
      notas: "Muy juguetón",
    },
  ]);
  const especies = [
    { label: "Perro", value: "perro" },
    { label: "Gato", value: "gato" },
    { label: "Ave", value: "ave" },
    { label: "Conejo", value: "conejo" },
  ];
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("misMascotas");
  //To do
  const handleEdit = (mascota) => {
    
    router.push("/mascota_edit")
  };

  const handleReserve = (mascota) => {
    //To do
    console.log("Reservar para:", mascota.nombre);
  };
  const handleDelete = (mascota) => {
    //To do
    console.log("Eliminar:", mascota.nombre);
  };
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
      <ScrollView
      style={{ backgroundColor: "#FFFF" }}
        contentContainerStyle={{ justifyContent: "center" }}
      >
      {/* Switch del encabezado */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "misMascotas" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("misMascotas")}
        >
          <Text>Mis mascotas</Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            activeTab === "agregar" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("agregar")}
        >
          <Text>Añadir mascotas</Text>
        </Pressable>
      </View>
      {/*Comparación para saber que vista mostrar*/}
      {activeTab === "misMascotas" ? (
        <FlatList
          data={mascotas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Nombre y raza */}
              <Text style={styles.nombreMascota}>{item.nombre}</Text>
              {/* Información especie */}
              <Text>
                {item.tipo} | {item.raza} | {item.edad}
              </Text>
              {/* Información de salud */}
              <Text style={{ fontWeight: "bold" }}>Vacunas al día</Text>
              {item.vacunas === true ? <Text>Sí</Text> : <Text>No</Text>}
              <Text style={{ fontWeight: "bold" }}>Condiciones médicas</Text>
              <Text>{item.condicionesMedicas} </Text>
              {/* Información veterinario */}
              <Text style={{ fontWeight: "bold" }}>Veterinario/a</Text>
              <Text>
                {item.veterinario} | {item.numeroVeterinario}
              </Text>
              {/* Notas */}
              <Text style={{ fontWeight: "bold" }}>Notas</Text>
              <Text>{item.notas}</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  style={styles.button}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.textButton}>Editar</Text>
                </Pressable>

                <Pressable
                  style={styles.button}
                  onPress={() => handleReserve(item)}
                >
                  <Text style={styles.textButton}>Hacer Reserva</Text>
                </Pressable>
                <Pressable
                  style={styles.button}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.textButton}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      ) : (
        <View>
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
      )}
    </ScrollView>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    borderRadius: 20,
    padding: 4,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#dfe9ea",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
