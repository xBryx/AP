import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { FlatList } from "react-native";

const mascotas = [{
    id: 1,
    nombre: "Max",
    tipo: "Perro",
    raza: "Labrador",
    edad: "3 años",
    Vacunas: true,
    CondicionesMedicas: "Ninguna",
    Veterinario: "Dr. Pérez",
    NumeroVeterinario: "8888-8888",
    Notas: "Muy juguetón"
  }];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("misMascotas");
  //To do
  const handleEdit = (mascota) => {
    console.log("Editar:", mascota.nombre);
  };

  const handleReserve = (mascota) => {
    //To do
    console.log("Reservar para:", mascota.nombre);
  };
  return (
    <View style={styles.container}>
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
              <Text style={{fontWeight: "bold"}}>Vacunas al día</Text>
              {item.Vacunas === true ? <Text>Sí</Text> : <Text>No</Text>}
              <Text style={{fontWeight: "bold"}}>Condiciones médicas</Text>
              <Text>{item.CondicionesMedicas} </Text>
              {/* Información veterinario */}
              <Text style={{fontWeight: "bold"}}>Veterinario/a</Text>
              <Text>
                {item.Veterinario} | {item.NumeroVeterinario}
              </Text>
              {/* Notas */}
              <Text style={{fontWeight: "bold"}}>Notas</Text>
              <Text>{item.Notas}</Text>
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
              </View>
            </View>
          )}
        />
      ) : (
        <View>
          <Text>Aquí va el formulario ➕</Text>
        </View>
      )}
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
});
